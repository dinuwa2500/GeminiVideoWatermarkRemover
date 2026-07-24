import { BoundingBox } from './video';

export type RemovalAlgorithm = 'delogo' | 'blur' | 'crop' | 'opencv-inpaint';

export type EncoderCodec = 'libx264' | 'libx265' | 'h264_nvenc' | 'hevc_nvenc' | 'h264_qsv' | 'h264_amf' | 'copy';

export interface ProcessingOptions {
  inputPath: string;
  outputPath: string;
  box: BoundingBox;
  algorithm: RemovalAlgorithm;
  encoder: EncoderCodec;
  bandThickness?: number; // For delogo filter interpolation edge smoothness
  blurRadius?: number;    // For Gaussian blur mask
  crf?: number;           // Quality factor (18-28, default 22)
  preserveAudio: boolean;
  hardwareAccel: boolean;
}

export type ProcessingState = 'idle' | 'probing' | 'processing' | 'paused' | 'completed' | 'error';

export interface ProgressStatus {
  jobId: string;
  state: ProcessingState;
  percent: number;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  timemark: string; // e.g. "00:01:23.45"
  speed: string;    // e.g. "2.4x"
  etaSeconds: number;
  errorMessage?: string;
}

export interface BatchItem {
  id: string;
  filePath: string;
  fileName: string;
  outputPath: string;
  options: ProcessingOptions;
  status: ProcessingState;
  progress: ProgressStatus;
}
