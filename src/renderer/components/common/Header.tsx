import React from "react";
import { useVideoContext } from "../../context/VideoContext";
import { Video, Cpu, Zap, Layers } from "lucide-react";
import logoImg from "../../assets/logo.png";

export const Header: React.FC = () => {
  const { hardwareInfo, isProcessing, activeTab, setActiveTab } =
    useVideoContext();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-sky-500/30 p-1 flex items-center justify-center shadow-lg shadow-sky-500/20 overflow-hidden">
          <img
            src={logoImg}
            alt="Gemini Watermark Remover Logo"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-gradient leading-none">
              Gemini Video Watermark Remover
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
              v1.0.0 Pro
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Streamed FFmpeg Video Inpainting & Watermark Removal Engine
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "editor"
              ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          Single Video Editor
        </button>

        <button
          onClick={() => setActiveTab("batch")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "batch"
              ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Batch Queue
        </button>
      </div>

      {/* Hardware Accel & Status Badges */}
      <div className="flex items-center gap-3">
        {hardwareInfo ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
            <Zap
              className={`w-3.5 h-3.5 ${hardwareInfo.hasNvenc || hardwareInfo.hasQsv ? "text-amber-400" : "text-slate-400"}`}
            />
            <span className="text-slate-300 font-medium">
              {hardwareInfo.hasNvenc
                ? "NVIDIA NVENC GPU"
                : hardwareInfo.hasQsv
                  ? "Intel QSV GPU"
                  : "CPU Multi-Thread"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-slate-400 animate-spin" />
            <span className="text-slate-400">Detecting Hardware...</span>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-xs text-sky-400 font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            Processing Active
          </div>
        )}
      </div>
    </header>
  );
};
