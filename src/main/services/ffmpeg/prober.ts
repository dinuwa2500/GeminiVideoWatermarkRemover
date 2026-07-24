import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { getFfmpegPath, getFfprobePath } from './binaryPath';
import { VideoMetadata } from '../../../shared/types/video';

// Set executable paths for fluent-ffmpeg
ffmpeg.setFfmpegPath(getFfmpegPath());
ffmpeg.setFfprobePath(getFfprobePath());

export async function probeVideoFile(filePath: string): Promise<VideoMetadata> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Video file does not exist at path: ${filePath}`);
  }

  const stats = fs.statSync(filePath);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(new Error(`Failed to probe video: ${err.message}`));
      }

      const videoStream = metadata.streams?.find((s) => s.codec_type === 'video');
      const audioStream = metadata.streams?.find((s) => s.codec_type === 'audio');

      if (!videoStream) {
        return reject(new Error('No video stream detected in selected file'));
      }

      // Calculate FPS safely
      let fps = 30;
      if (videoStream.r_frame_rate) {
        const parts = videoStream.r_frame_rate.split('/');
        if (parts.length === 2 && parseFloat(parts[1]) > 0) {
          fps = parseFloat(parts[0]) / parseFloat(parts[1]);
        } else {
          fps = parseFloat(videoStream.r_frame_rate) || 30;
        }
      }

      const width = videoStream.width || 1920;
      const height = videoStream.height || 1080;
      const duration = metadata.format.duration ? parseFloat(metadata.format.duration) : 0;

      resolve({
        filePath,
        fileName: path.basename(filePath),
        fileSize: stats.size,
        width,
        height,
        duration,
        fps: Math.round(fps * 100) / 100,
        codec: videoStream.codec_name || 'unknown',
        audioCodec: audioStream?.codec_name,
        hasAudio: !!audioStream,
        bitrate: metadata.format.bit_rate ? parseInt(metadata.format.bit_rate, 10) : undefined
      });
    });
  });
}
