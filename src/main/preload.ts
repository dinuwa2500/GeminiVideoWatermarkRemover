import { contextBridge, ipcRenderer } from 'electron';
import { ProcessingOptions, ProgressStatus } from '../shared/types/processing';

contextBridge.exposeInMainWorld('electronAPI', {
  selectVideoFile: () => ipcRenderer.invoke('dialog:selectVideo'),
  selectSavePath: (defaultName: string) => ipcRenderer.invoke('dialog:selectSavePath', defaultName),
  probeVideo: (filePath: string) => ipcRenderer.invoke('video:probe', filePath),
  startProcessing: (options: ProcessingOptions) => ipcRenderer.invoke('video:startProcessing', options),
  cancelProcessing: (jobId: string) => ipcRenderer.invoke('video:cancelProcessing', jobId),
  getHardwareInfo: () => ipcRenderer.invoke('system:getHardwareInfo'),
  onProgress: (callback: (status: ProgressStatus) => void) => {
    const handler = (_event: any, status: ProgressStatus) => callback(status);
    ipcRenderer.on('video:progress', handler);
    return () => {
      ipcRenderer.removeListener('video:progress', handler);
    };
  }
});
