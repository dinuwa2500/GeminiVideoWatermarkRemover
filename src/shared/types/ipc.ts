import { VideoMetadata } from './video';
import { ProcessingOptions, ProgressStatus } from './processing';

export interface HardwareInfo {
  hasNvenc: boolean;
  hasQsv: boolean;
  hasAmf: boolean;
  ffmpegPath: string;
  ffprobePath: string;
  isBundled: boolean;
}

export interface ElectronAPI {
  selectVideoFile: () => Promise<string | null>;
  selectSavePath: (defaultName: string) => Promise<string | null>;
  probeVideo: (filePath: string) => Promise<VideoMetadata>;
  startProcessing: (options: ProcessingOptions) => Promise<{ success: boolean; jobId: string; error?: string }>;
  cancelProcessing: (jobId: string) => Promise<boolean>;
  getHardwareInfo: () => Promise<HardwareInfo>;
  onProgress: (callback: (status: ProgressStatus) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
