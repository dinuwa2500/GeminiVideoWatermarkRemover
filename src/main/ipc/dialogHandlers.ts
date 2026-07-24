import { dialog, BrowserWindow } from 'electron';
import path from 'path';

export async function handleSelectVideoFile(window: BrowserWindow | null): Promise<string | null> {
  if (!window) return null;

  const result = await dialog.showOpenDialog(window, {
    title: 'Select Input Video with Gemini Watermark',
    properties: ['openFile'],
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'mov', 'mkv', 'webm', 'avi', 'flv', 'm4v'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
}

export async function handleSelectSavePath(window: BrowserWindow | null, defaultName: string): Promise<string | null> {
  if (!window) return null;

  const ext = path.extname(defaultName) || '.mp4';
  const basename = path.basename(defaultName, ext);

  const result = await dialog.showSaveDialog(window, {
    title: 'Select Destination for Cleaned Video',
    defaultPath: `${basename}_no_watermark${ext}`,
    filters: [
      { name: 'MP4 Video', extensions: ['mp4'] },
      { name: 'MKV Video', extensions: ['mkv'] },
      { name: 'MOV Video', extensions: ['mov'] },
      { name: 'WebM Video', extensions: ['webm'] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  return result.filePath;
}
