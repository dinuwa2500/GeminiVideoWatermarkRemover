import React from 'react';
import { useVideoContext } from '../../context/VideoContext';
import { CheckCircle2, AlertTriangle, XCircle, Gauge, Clock, Film, Sparkles, Folder } from 'lucide-react';

export const StatusDashboard: React.FC = () => {
  const { progressStatus, cancelProcessing, isProcessing, completedOutputPath } = useVideoContext();

  if (!progressStatus || progressStatus.state === 'idle') return null;

  const isCompleted = progressStatus.state === 'completed';
  const isError = progressStatus.state === 'error';

  const formatEta = (secs: number) => {
    if (secs <= 0) return 'Finished';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl backdrop-blur-md mb-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Status Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : isError ? (
            <XCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <Sparkles className="w-5 h-5 text-sky-400 animate-spin" />
          )}

          <h4 className="font-bold text-sm text-slate-100">
            {isCompleted
              ? 'Watermark Removal Completed!'
              : isError
              ? 'Processing Error'
              : 'Processing Video Stream...'}
          </h4>
        </div>

        {isProcessing && (
          <button
            onClick={cancelProcessing}
            className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            Cancel Job
          </button>
        )}
      </div>

      {/* Main Animated Progress Bar */}
      <div className="relative w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 mb-4">
        <div
          style={{ width: `${Math.min(100, Math.max(0, progressStatus.percent))}%` }}
          className={`h-full rounded-full transition-all duration-300 relative ${
            isCompleted
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30'
              : isError
              ? 'bg-rose-500'
              : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 shadow-lg shadow-sky-500/30'
          }`}
        >
          {isProcessing && (
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          )}
        </div>
      </div>

      {/* Progress Metrics Grid */}
      <div className="grid grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
          <Film className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Progress</div>
            <div className="font-bold text-slate-200">{progressStatus.percent}%</div>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Speed & FPS</div>
            <div className="font-bold text-slate-200">
              {progressStatus.speed} ({progressStatus.fps} FPS)
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Time Mark</div>
            <div className="font-bold text-slate-200">{progressStatus.timemark}</div>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase">ETA Remaining</div>
            <div className="font-bold text-slate-200">{formatEta(progressStatus.etaSeconds)}</div>
          </div>
        </div>
      </div>

      {/* Error Output Card */}
      {isError && progressStatus.errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono break-all max-h-24 overflow-y-auto">
          <div className="font-bold mb-1 flex items-center gap-1 text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" /> Error Log:
          </div>
          {progressStatus.errorMessage}
        </div>
      )}

      {/* Completed Success Actions */}
      {isCompleted && completedOutputPath && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 truncate max-w-md">Saved to: {completedOutputPath}</span>
          <button
            onClick={() => window.electronAPI?.showItemInFolder(completedOutputPath)}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <Folder className="w-3.5 h-3.5" /> Open Output Folder
          </button>
        </div>
      )}
    </div>
  );
};
