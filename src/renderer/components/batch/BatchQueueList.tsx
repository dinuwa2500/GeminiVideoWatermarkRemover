import React, { useState } from 'react';
import { useVideoContext } from '../../context/VideoContext';
import { Layers, Play, Trash2, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';

export const BatchQueueList: React.FC = () => {
  const { batchQueue, removeFromQueue, clearQueue, isProcessing } = useVideoContext();
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  const handleRunBatch = async () => {
    if (batchQueue.length === 0 || !window.electronAPI) return;

    setIsBatchRunning(true);
    for (const item of batchQueue) {
      if (item.status === 'completed') continue;

      // Ask save location or use default prefix
      const ext = item.fileName.substring(item.fileName.lastIndexOf('.'));
      const defaultOutName = item.fileName.replace(ext, `_no_watermark${ext}`);
      const savePath = await window.electronAPI.selectSavePath(defaultOutName);

      if (!savePath) continue; // Skipped by user

      item.options.outputPath = savePath;
      item.status = 'processing';

      try {
        await window.electronAPI.startProcessing(item.options);
        item.status = 'completed';
      } catch (e) {
        item.status = 'error';
      }
    }
    setIsBatchRunning(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Batch Processing Queue</h2>
            <p className="text-xs text-slate-400">Queue multiple video files for sequential watermark removal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {batchQueue.length > 0 && (
            <button
              onClick={clearQueue}
              disabled={isBatchRunning}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
            >
              Clear Queue
            </button>
          )}

          <button
            onClick={handleRunBatch}
            disabled={batchQueue.length === 0 || isBatchRunning || isProcessing}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all glow-button disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {isBatchRunning ? 'Processing Batch Queue...' : `Start Batch (${batchQueue.length} Videos)`}
          </button>
        </div>
      </div>

      {/* Queue Items List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {batchQueue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-8">
            <Layers className="w-12 h-12 mb-3 stroke-[1.5] text-slate-700" />
            <h4 className="font-semibold text-slate-400 mb-1">Queue is Currently Empty</h4>
            <p className="text-xs max-w-sm">Use the Single Video Editor to configure watermark bounding box presets and click "Add to Batch Processing Queue".</p>
          </div>
        ) : (
          batchQueue.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-500 font-bold">#{idx + 1}</span>
                <div>
                  <div className="text-sm font-bold text-slate-200">{item.fileName}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    Algorithm: <span className="text-sky-400 capitalize">{item.options.algorithm}</span> | Encoder:{' '}
                    <span className="text-indigo-400">{item.options.encoder}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Status Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
                  {item.status === 'completed' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Completed</span>
                    </>
                  ) : item.status === 'processing' ? (
                    <>
                      <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                      <span className="text-sky-400">Processing...</span>
                    </>
                  ) : item.status === 'error' ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-rose-400">Error</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400">Queued</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => removeFromQueue(item.id)}
                  disabled={isBatchRunning}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
