import React from 'react';
import { useVideoContext } from '../../context/VideoContext';
import { RemovalAlgorithm, EncoderCodec } from '../../../shared/types/processing';
import { Settings2, Cpu, Volume2, ShieldCheck, Play, Plus, RefreshCw } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const {
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
    hardwareInfo,
    startSingleProcessing,
    isProcessing,
    activeVideo,
    setActiveVideo,
    batchQueue,
    addToQueue,
    roiBox
  } = useVideoContext();

  const handleAddToBatch = () => {
    if (!activeVideo) return;
    addToQueue({
      id: `batch_${Date.now()}`,
      filePath: activeVideo.filePath,
      fileName: activeVideo.fileName,
      outputPath: '',
      options: {
        inputPath: activeVideo.filePath,
        outputPath: '',
        box: roiBox,
        algorithm,
        encoder,
        bandThickness,
        blurRadius,
        crf,
        preserveAudio,
        hardwareAccel: true
      },
      status: 'idle',
      progress: {
        jobId: '',
        state: 'idle',
        percent: 0,
        currentFrame: 0,
        totalFrames: 0,
        fps: 0,
        timemark: '00:00:00',
        speed: '0x',
        etaSeconds: 0
      }
    });
    alert(`Added "${activeVideo.fileName}" to Batch Processing Queue!`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 p-5 overflow-y-auto gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-100">Processing Engine Settings</h3>
        </div>
        <button
          onClick={() => setActiveVideo(null)}
          className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Change Video
        </button>
      </div>

      {/* Algorithm Mode */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">Removal Algorithm</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'delogo', label: 'Spatial Inpaint', desc: 'Native Delogo Filter' },
            { id: 'blur', label: 'Gaussian Blur', desc: 'Smooth Mask Overlay' },
            { id: 'crop', label: 'Margin Crop', desc: 'Trim Watermark Area' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setAlgorithm(mode.id as RemovalAlgorithm)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                algorithm === mode.id
                  ? 'bg-sky-500/10 border-sky-400 text-sky-300 font-semibold shadow-md'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold">{mode.label}</div>
              <div className="text-[10px] text-slate-500">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Algorithm Specific Sliders */}
      {algorithm === 'delogo' && (
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Border Smoothness (Band Thickness):</span>
            <span className="font-mono text-sky-400 font-bold">{bandThickness}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={bandThickness}
            onChange={(e) => setBandThickness(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>
      )}

      {algorithm === 'blur' && (
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Blur Strength Radius:</span>
            <span className="font-mono text-sky-400 font-bold">{blurRadius}px</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={blurRadius}
            onChange={(e) => setBlurRadius(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>
      )}

      {/* Video Encoder Codec Selection */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">Export Encoder Codec</label>
        <select
          value={encoder}
          onChange={(e) => setEncoder(e.target.value as EncoderCodec)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-sky-400 focus:outline-none"
        >
          {hardwareInfo?.hasNvenc && <option value="h264_nvenc">NVIDIA H.264 (NVENC GPU Accelerated)</option>}
          {hardwareInfo?.hasNvenc && <option value="hevc_nvenc">NVIDIA H.265 / HEVC (NVENC GPU Accelerated)</option>}
          {hardwareInfo?.hasQsv && <option value="h264_qsv">Intel QuickSync (QSV GPU Accelerated)</option>}
          <option value="libx264">x264 CPU Software Encoder (High Quality)</option>
          <option value="libx265">x265 / HEVC CPU Software Encoder</option>
        </select>
      </div>

      {/* CRF Quality Slider */}
      <div>
        <div className="flex justify-between text-xs text-slate-300 mb-1">
          <span>Quality Factor (CRF):</span>
          <span className="font-mono text-sky-400 font-bold">{crf} ({crf <= 18 ? 'Visually Lossless' : crf >= 26 ? 'Compact File' : 'Balanced'})</span>
        </div>
        <input
          type="range"
          min="16"
          max="28"
          value={crf}
          onChange={(e) => setCrf(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />
      </div>

      {/* Audio Passthrough Switch */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-xs font-bold text-slate-200">Copy Audio Stream (Passthrough)</div>
            <div className="text-[10px] text-slate-400">100% original audio quality without re-encoding</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={preserveAudio}
          onChange={(e) => setPreserveAudio(e.target.checked)}
          className="w-4 h-4 rounded accent-sky-400 cursor-pointer"
        />
      </div>

      {/* Primary Action Buttons */}
      <div className="mt-auto pt-4 flex flex-col gap-2">
        <button
          onClick={startSingleProcessing}
          disabled={isProcessing}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 transition-all glow-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 fill-white" />
          {isProcessing ? 'Processing Video Stream...' : 'Remove Watermark & Export Video'}
        </button>

        <button
          onClick={handleAddToBatch}
          disabled={isProcessing}
          className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Add to Batch Processing Queue
        </button>
      </div>
    </div>
  );
};
