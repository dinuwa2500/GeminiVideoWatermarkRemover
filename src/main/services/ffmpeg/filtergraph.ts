import { ProcessingOptions } from '../../../shared/types/processing';

export function buildFfmpegFilterGraph(options: ProcessingOptions): string {
  const { box, algorithm, blurRadius = 15 } = options;

  // Sanitize coordinates (even numbers work best for FFmpeg color spaces like yuv420p)
  const x = Math.max(0, Math.floor(box.x / 2) * 2);
  const y = Math.max(0, Math.floor(box.y / 2) * 2);
  const w = Math.max(2, Math.floor(box.w / 2) * 2);
  const h = Math.max(2, Math.floor(box.h / 2) * 2);

  switch (algorithm) {
    case 'delogo':
      // FFmpeg delogo filter interpolates pixels using surrounding boundary values
      return `delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0`;

    case 'blur':
      // Split stream into base video and blurred box section, then overlay back at (x,y)
      const radius = Math.max(1, blurRadius);
      return `[0:v]split[main][crop_src];[crop_src]crop=${w}:${h}:${x}:${y},boxblur=luma_radius=${radius}:luma_power=2[blurred];[main][blurred]overlay=${x}:${y}`;

    case 'crop':
      // Crop remaining main video frame out of corner
      return `crop=iw-${w}:ih-${h}:0:0`;

    case 'opencv-inpaint':
    default:
      return `delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0`;
  }
}
