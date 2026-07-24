import { WatermarkPreset } from '../types/video';

export const GEMINI_WATERMARK_PRESETS: WatermarkPreset[] = [
  {
    id: 'gemini-bottom-right',
    label: 'Gemini (Bottom Right)',
    description: 'Standard Google Gemini / Imagen logo in lower-right corner',
    relX: 75,
    relY: 82,
    relW: 22,
    relH: 15
  },
  {
    id: 'gemini-bottom-left',
    label: 'Gemini (Bottom Left)',
    description: 'Alternative Gemini / Imagen logo in lower-left corner',
    relX: 3,
    relY: 82,
    relW: 22,
    relH: 15
  },
  {
    id: 'veo-bottom-right',
    label: 'Google Veo (Bottom Right)',
    description: 'Veo video generator watermark overlay in bottom-right corner',
    relX: 78,
    relY: 85,
    relW: 19,
    relH: 12
  },
  {
    id: 'gemini-top-right',
    label: 'Top Right Corner',
    description: 'Watermark overlay positioned in top-right corner',
    relX: 75,
    relY: 3,
    relW: 22,
    relH: 15
  },
  {
    id: 'custom',
    label: 'Custom Selection',
    description: 'Manually draw or adjust bounding box on video preview canvas',
    relX: 40,
    relY: 40,
    relW: 20,
    relH: 20
  }
];
