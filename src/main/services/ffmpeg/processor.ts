import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { getFfmpegPath } from './binaryPath';
import { buildFfmpegFilterGraph } from './filtergraph';
import { probeVideoFile } from './prober';
import { ProcessingOptions, ProgressStatus } from '../../../shared/types/processing';

interface ActiveJob {
  process: ChildProcess;
  jobId: string;
  cancelled: boolean;
}

const activeJobs = new Map<string, ActiveJob>();

export function cancelProcessingJob(jobId: string): boolean {
  const job = activeJobs.get(jobId);
  if (job) {
    job.cancelled = true;
    try {
      job.process.kill('SIGKILL');
    } catch (e) {
      // Process already terminated
    }
    activeJobs.delete(jobId);
    return true;
  }
  return false;
}

export async function processVideoJob(
  jobId: string,
  options: ProcessingOptions,
  onProgress: (status: ProgressStatus) => void
): Promise<void> {
  const ffmpegPath = getFfmpegPath();

  // Probe metadata first to calculate total frames and duration accurately
  const meta = await probeVideoFile(options.inputPath);
  const totalFrames = Math.max(1, Math.floor(meta.duration * meta.fps));

  // Build filter graph
  const vfFilter = buildFfmpegFilterGraph(options);

  // Ensure output directory exists
  const outDir = path.dirname(options.outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Build FFmpeg command arguments
  const args: string[] = [
    '-y',                     // Overwrite output without asking
    '-hide_banner',           // Suppress banner
    '-loglevel', 'info',       // Info log level for progress parsing
    '-i', options.inputPath   // Input file
  ];

  // Video filter
  args.push('-vf', vfFilter);

  // Video Codec selection
  let videoCodec = options.encoder || 'libx264';
  if (options.hardwareAccel) {
    if (options.encoder === 'h264_nvenc' || options.encoder === 'hevc_nvenc') {
      videoCodec = options.encoder;
    }
  }

  args.push('-c:v', videoCodec);

  // Quality preset & CRF for x264/x265
  if (videoCodec === 'libx264' || videoCodec === 'libx265') {
    args.push('-crf', (options.crf || 22).toString());
    args.push('-preset', 'medium');
  }

  // Audio track copy or passthrough
  if (options.preserveAudio && meta.hasAudio) {
    args.push('-c:a', 'copy'); // Lossless audio copy
  } else {
    args.push('-an'); // Strip audio if disabled
  }

  args.push(options.outputPath);

  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { windowsHide: true });
    activeJobs.set(jobId, { process: child, jobId, cancelled: false });

    let stderrBuffer = '';

    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderrBuffer += text;

      // Extract progress line using Regex
      // Example: frame=  450 fps= 45 q=28.0 size=    3456kB time=00:00:15.00 bitrate=1887.4kbits/s speed=1.5x
      const frameMatch = text.match(/frame=\s*(\d+)/);
      const fpsMatch = text.match(/fps=\s*([\d.]+)/);
      const timeMatch = text.match(/time=\s*([\d:.]+)/);
      const speedMatch = text.match(/speed=\s*([\d.]+x)/);

      if (frameMatch || timeMatch) {
        const currentFrame = frameMatch ? parseInt(frameMatch[1], 10) : 0;
        const currentFps = fpsMatch ? parseFloat(fpsMatch[1]) : 0;
        const timemark = timeMatch ? timeMatch[1] : '00:00:00';
        const speed = speedMatch ? speedMatch[1] : '1.0x';

        // Calculate progress percentage
        let percent = totalFrames > 0 ? Math.min(99.9, (currentFrame / totalFrames) * 100) : 0;
        percent = Math.round(percent * 10) / 10;

        // Calculate ETA in seconds
        let etaSeconds = 0;
        if (currentFps > 0 && totalFrames > currentFrame) {
          etaSeconds = Math.round((totalFrames - currentFrame) / currentFps);
        }

        onProgress({
          jobId,
          state: 'processing',
          percent,
          currentFrame,
          totalFrames,
          fps: currentFps,
          timemark,
          speed,
          etaSeconds
        });
      }
    });

    child.on('close', (code) => {
      const activeJob = activeJobs.get(jobId);
      activeJobs.delete(jobId);

      if (activeJob?.cancelled) {
        return reject(new Error('Job was cancelled by user'));
      }

      if (code === 0) {
        onProgress({
          jobId,
          state: 'completed',
          percent: 100,
          currentFrame: totalFrames,
          totalFrames,
          fps: 0,
          timemark: '00:00:00',
          speed: '1.0x',
          etaSeconds: 0
        });
        resolve();
      } else {
        const err = new Error(`FFmpeg exited with code ${code}. ${stderrBuffer.slice(-300)}`);
        onProgress({
          jobId,
          state: 'error',
          percent: 0,
          currentFrame: 0,
          totalFrames,
          fps: 0,
          timemark: '00:00:00',
          speed: '0x',
          etaSeconds: 0,
          errorMessage: err.message
        });
        reject(err);
      }
    });

    child.on('error', (err) => {
      activeJobs.delete(jobId);
      reject(err);
    });
  });
}
