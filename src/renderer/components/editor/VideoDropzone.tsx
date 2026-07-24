import React, { useState } from 'react';
import { useVideoContext } from '../../context/VideoContext';
import { UploadCloud, FileVideo, Sparkles, FolderOpen } from 'lucide-react';

export const VideoDropzone: React.FC = () => {
  const { setActiveVideo, runAutoDetection } = useVideoContext();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelectFile = async () => {
    if (!window.electronAPI) return;
    try {
      const filePath = await window.electronAPI.selectVideoFile();
      if (filePath) {
        setLoading(true);
        const meta = await window.electronAPI.probeVideo(filePath);
        setActiveVideo(meta);
        await runAutoDetection(filePath);
      }
    } catch (err: any) {
      alert(`Error probing video: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const filePath = (file as any).path || file.name;
      if (filePath && window.electronAPI) {
        try {
          setLoading(true);
          const meta = await window.electronAPI.probeVideo(filePath);
          setActiveVideo(meta);
          await runAutoDetection(filePath);
        } catch (err: any) {
          alert(`Error reading dropped video file: ${err.message}`);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-full min-h-[400px] rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer border-2 border-dashed ${
        isDragging
          ? 'border-sky-400 bg-sky-500/10 shadow-2xl shadow-sky-500/20 scale-[0.99]'
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
      onClick={handleSelectFile}
    >
      <div className="w-20 h-20 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-6 shadow-xl relative group">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
        {loading ? (
          <Sparkles className="w-10 h-10 text-sky-400 animate-spin" />
        ) : (
          <UploadCloud className="w-10 h-10 text-sky-400 group-hover:scale-110 transition-transform" />
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2">
        {loading ? 'AI Auto-Detecting Gemini Watermark...' : 'Drag & Drop Video File Here'}
      </h3>

      <p className="text-sm text-slate-400 max-w-md text-center mb-6">
        Automatic AI watermark box detection & <span className="text-sky-400 font-medium">zero quality loss</span> (MP4, MOV, MKV, WebM, AVI).
      </p>

      <button
        type="button"
        disabled={loading}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all glow-button"
      >
        <FolderOpen className="w-4 h-4" />
        Browse Video File
      </button>

      <div className="mt-8 flex items-center gap-6 text-xs text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <FileVideo className="w-3.5 h-3.5 text-slate-400" />
          Visually Lossless (Zero Quality Damage)
        </span>
        <span>•</span>
        <span>Auto AI Detection</span>
        <span>•</span>
        <span>Passthrough Audio</span>
      </div>
    </div>
  );
};
