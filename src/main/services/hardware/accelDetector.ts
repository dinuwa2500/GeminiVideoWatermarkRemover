import { execSync } from 'child_process';
import { getFfmpegPath, getFfprobePath } from '../ffmpeg/binaryPath';
import { HardwareInfo } from '../../../shared/types/ipc';

export function detectHardwareCapabilities(): HardwareInfo {
  const ffmpegPath = getFfmpegPath();
  const ffprobePath = getFfprobePath();
  let encodersOutput = '';

  try {
    encodersOutput = execSync(`"${ffmpegPath}" -encoders`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    encodersOutput = '';
  }

  const hasNvenc = encodersOutput.includes('h264_nvenc') || encodersOutput.includes('hevc_nvenc');
  const hasQsv = encodersOutput.includes('h264_qsv') || encodersOutput.includes('hevc_qsv');
  const hasAmf = encodersOutput.includes('h264_amf') || encodersOutput.includes('hevc_amf');

  return {
    hasNvenc,
    hasQsv,
    hasAmf,
    ffmpegPath,
    ffprobePath,
    isBundled: !ffmpegPath.startsWith('ffmpeg')
  };
}
