import React, { createContext, useContext, useState, useEffect } from 'react';
import { VideoMetadata, BoundingBox, PresetType } from '../../shared/types/video';
import { ProcessingOptions, ProgressStatus, BatchItem, RemovalAlgorithm, EncoderCodec } from '../../shared/types/processing';
import { HardwareInfo } from '../../shared/types/ipc';
import { GEMINI_WATERMARK_PRESETS } from '../../shared/constants/presets';

interface VideoContextType {
  activeVideo: VideoMetadata | null;
  setActiveVideo: (meta: VideoMetadata | null) => void;
  roiBox: BoundingBox;
  setRoiBox: React.Dispatch<React.SetStateAction<BoundingBox>>;
  selectedPreset: PresetType;
  selectPreset: (presetId: PresetType) => void;
  algorithm: RemovalAlgorithm;
  setAlgorithm: (alg: RemovalAlgorithm) => void;
  encoder: EncoderCodec;
  setEncoder: (enc: EncoderCodec) => void;
  blurRadius: number;
  setBlurRadius: (r: number) => void;
  bandThickness: number;
  setBandThickness: (b: number) => void;
  crf: number;
  setCrf: (crf: number) => void;
  preserveAudio: boolean;
  setPreserveAudio: (preserve: boolean) => void;
  hardwareAccel: boolean;
  setHardwareAccel: (accel: boolean) => void;
  hardwareInfo: HardwareInfo | null;
  progressStatus: ProgressStatus | null;
  isProcessing: boolean;
  batchQueue: BatchItem[];
  addToQueue: (item: BatchItem) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  startSingleProcessing: () => Promise<void>;
  cancelProcessing: () => Promise<void>;
  activeTab: 'editor' | 'batch' | 'preview';
  setActiveTab: (tab: 'editor' | 'batch' | 'preview') => void;
  completedOutputPath: string | null;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeVideo, setActiveVideo] = useState<VideoMetadata | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('gemini-bottom-right');
  const [algorithm, setAlgorithm] = useState<RemovalAlgorithm>('delogo');
  const [encoder, setEncoder] = useState<EncoderCodec>('libx264');
  const [blurRadius, setBlurRadius] = useState<number>(15);
  const [bandThickness, setBandThickness] = useState<number>(2);
  const [crf, setCrf] = useState<number>(22);
  const [preserveAudio, setPreserveAudio] = useState<boolean>(true);
  const [hardwareAccel, setHardwareAccel] = useState<boolean>(true);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'batch' | 'preview'>('editor');
  const [completedOutputPath, setCompletedOutputPath] = useState<string | null>(null);

  // Default ROI Box
  const [roiBox, setRoiBox] = useState<BoundingBox>({ x: 0, y: 0, w: 200, h: 100 });

  // Fetch hardware capabilities on startup
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getHardwareInfo().then((info) => {
        setHardwareInfo(info);
        if (info.hasNvenc) {
          setEncoder('h264_nvenc');
        } else if (info.hasQsv) {
          setEncoder('h264_qsv');
        }
      }).catch(console.error);

      // Subscribe to real-time processing progress events from Electron Main process
      const unsubscribe = window.electronAPI.onProgress((status) => {
        setProgressStatus(status);
        if (status.state === 'completed') {
          setIsProcessing(false);
        } else if (status.state === 'error' || status.state === 'idle') {
          setIsProcessing(false);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // Recalculate ROI Box whenever active video or preset changes
  useEffect(() => {
    if (!activeVideo) return;

    const preset = GEMINI_WATERMARK_PRESETS.find((p) => p.id === selectedPreset) || GEMINI_WATERMARK_PRESETS[0];
    const x = Math.round((preset.relX / 100) * activeVideo.width);
    const y = Math.round((preset.relY / 100) * activeVideo.height);
    const w = Math.round((preset.relW / 100) * activeVideo.width);
    const h = Math.round((preset.relH / 100) * activeVideo.height);

    setRoiBox({ x, y, w, h });
  }, [activeVideo, selectedPreset]);

  const selectPreset = (presetId: PresetType) => {
    setSelectedPreset(presetId);
  };

  const addToQueue = (item: BatchItem) => {
    setBatchQueue((prev) => [...prev, item]);
  };

  const removeFromQueue = (id: string) => {
    setBatchQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearQueue = () => {
    setBatchQueue([]);
  };

  const startSingleProcessing = async () => {
    if (!activeVideo || !window.electronAPI) return;

    // Ask user where to save the output video
    const savePath = await window.electronAPI.selectSavePath(activeVideo.fileName);
    if (!savePath) return; // User canceled save dialog

    const options: ProcessingOptions = {
      inputPath: activeVideo.filePath,
      outputPath: savePath,
      box: roiBox,
      algorithm,
      encoder,
      bandThickness,
      blurRadius,
      crf,
      preserveAudio,
      hardwareAccel
    };

    setIsProcessing(true);
    setCompletedOutputPath(savePath);
    setProgressStatus({
      jobId: 'init',
      state: 'processing',
      percent: 0,
      currentFrame: 0,
      totalFrames: Math.floor(activeVideo.duration * activeVideo.fps),
      fps: 0,
      timemark: '00:00:00',
      speed: '0x',
      etaSeconds: 0
    });

    const result = await window.electronAPI.startProcessing(options);
    if (!result.success) {
      setIsProcessing(false);
      alert(`Failed to start processing job: ${result.error}`);
    }
  };

  const cancelProcessing = async () => {
    if (progressStatus?.jobId && window.electronAPI) {
      await window.electronAPI.cancelProcessing(progressStatus.jobId);
      setIsProcessing(false);
      setProgressStatus(null);
    }
  };

  return (
    <VideoContext.Provider
      value={{
        activeVideo,
        setActiveVideo,
        roiBox,
        setRoiBox,
        selectedPreset,
        selectPreset,
        algorithm,
        setAlgorithm,
        encoder,
        setEncoder,
        blurRadius,
        setBlurRadius,
        bandThickness,
        setBandThickness,
        crf,
        setCrf,
        preserveAudio,
        setPreserveAudio,
        hardwareAccel,
        setHardwareAccel,
        hardwareInfo,
        progressStatus,
        isProcessing,
        batchQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        startSingleProcessing,
        cancelProcessing,
        activeTab,
        setActiveTab,
        completedOutputPath
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
};
