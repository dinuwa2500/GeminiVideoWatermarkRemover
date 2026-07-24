import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { handleSelectVideoFile, handleSelectSavePath } from './ipc/dialogHandlers';
import { probeVideoFile } from './services/ffmpeg/prober';
import { processVideoJob, cancelProcessingJob } from './services/ffmpeg/processor';
import { detectHardwareCapabilities } from './services/hardware/accelDetector';
import { ProcessingOptions, ProgressStatus } from '../shared/types/processing';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    title: 'Gemini Video Watermark Remover',
    frame: true,
    backgroundColor: '#0f172a', // Sleek dark slate
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Allow loading local video files in HTML5 video preview
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handler Registrations
ipcMain.handle('dialog:selectVideo', async () => {
  return handleSelectVideoFile(mainWindow);
});

ipcMain.handle('dialog:selectSavePath', async (_event, defaultName: string) => {
  return handleSelectSavePath(mainWindow, defaultName);
});

ipcMain.handle('video:probe', async (_event, filePath: string) => {
  return probeVideoFile(filePath);
});

ipcMain.handle('system:getHardwareInfo', async () => {
  return detectHardwareCapabilities();
});

ipcMain.handle('video:startProcessing', async (_event, options: ProcessingOptions) => {
  const jobId = `job_${Date.now()}`;
  try {
    // Run asynchronously in background without blocking IPC response
    processVideoJob(jobId, options, (status: ProgressStatus) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('video:progress', status);
      }
    }).catch((err) => {
      console.error(`Job ${jobId} failed:`, err);
    });

    return { success: true, jobId };
  } catch (err: any) {
    return { success: false, jobId, error: err.message };
  }
});

ipcMain.handle('video:cancelProcessing', async (_event, jobId: string) => {
  return cancelProcessingJob(jobId);
});
