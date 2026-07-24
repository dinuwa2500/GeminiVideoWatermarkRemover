export interface BoundingBox {
  x: number;      // Pixel X start position
  y: number;      // Pixel Y start position
  w: number;      // Pixel width
  h: number;      // Pixel height
}

export interface VideoMetadata {
  filePath: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  duration: number; // in seconds
  fps: number;
  codec: string;
  audioCodec?: string;
  hasAudio: boolean;
  bitrate?: number;
}

export type PresetType = 
  | 'gemini-bottom-right'
  | 'gemini-bottom-left'
  | 'gemini-top-right'
  | 'gemini-top-left'
  | 'veo-bottom-right'
  | 'custom';

export interface WatermarkPreset {
  id: PresetType;
  label: string;
  description: string;
  // Box relative percentages (0 - 100%)
  relX: number;
  relY: number;
  relW: number;
  relH: number;
}
