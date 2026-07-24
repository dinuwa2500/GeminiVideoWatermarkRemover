import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getFfprobePath } from './binaryPath';
import { VideoMetadata } from '../../../shared/types/video';

export async function probeVideoFile(filePath: string): Promise<VideoMetadata> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Video file does not exist at path: ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  const ffprobePath = getFfprobePath();

  const args = [
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    filePath
  ];

  return new Promise((resolve, reject) => {
    execFile(ffprobePath, args, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`Failed to probe video file: ${err.message}`));
      }

      try {
        const metadata = JSON.parse(stdout);
        const videoStream = metadata.streams?.find((s: any) => s.codec_type === 'video');
        const audioStream = metadata.streams?.find((s: any) => s.codec_type === 'audio');

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
        const duration = metadata.format?.duration ? parseFloat(metadata.format.duration) : 0;

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
          bitrate: metadata.format?.bit_rate ? parseInt(metadata.format.bit_rate, 10) : undefined
        });
      } catch (parseErr: any) {
        reject(new Error(`Failed to parse FFprobe JSON metadata: ${parseErr.message}`));
      }
    });
  });
}
