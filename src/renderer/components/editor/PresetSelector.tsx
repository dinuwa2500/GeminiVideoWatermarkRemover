import React from 'react';
import { useVideoContext } from '../../context/VideoContext';
import { GEMINI_WATERMARK_PRESETS } from '../../../shared/constants/presets';
import { PresetType } from '../../../shared/types/video';
import { Target, Sparkles, Sliders } from 'lucide-react';

export const PresetSelector: React.FC = () => {
  const { selectedPreset, selectPreset } = useVideoContext();

  return (
    <div className="flex flex-col gap-2 bg-slate-900/60 rounded-2xl border border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-4 h-4 text-sky-400" />
        <h3 className="text-sm font-bold text-slate-100">Gemini Watermark Presets</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {GEMINI_WATERMARK_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => selectPreset(preset.id as PresetType)}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-sky-500/10 border-sky-400 text-sky-300 shadow-md shadow-sky-500/10'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold">{preset.label}</span>
                {isSelected && <Sparkles className="w-3 h-3 text-sky-400" />}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
