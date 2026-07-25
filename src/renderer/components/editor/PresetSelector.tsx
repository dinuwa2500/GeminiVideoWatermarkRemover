import React from 'react';
import { useVideoContext } from '../../context/VideoContext';
import { GEMINI_WATERMARK_PRESETS } from '../../../shared/constants/presets';
import { PresetType } from '../../../shared/types/video';
import { Target, Sparkles, Maximize2 } from 'lucide-react';

export const PresetSelector: React.FC = () => {
  const { selectedPreset, selectPreset, roiBox, setRoiBox, activeVideo } = useVideoContext();

  const handleDimChange = (field: 'x' | 'y' | 'w' | 'h', valStr: string) => {
    const val = parseInt(valStr, 10) || 0;
    const maxW = activeVideo?.width || 3840;
    const maxH = activeVideo?.height || 2160;

    let updated = { ...roiBox };

    if (field === 'w') {
      updated.w = Math.max(1, Math.min(maxW - updated.x, val));
    } else if (field === 'h') {
      updated.h = Math.max(1, Math.min(maxH - updated.y, val));
    } else if (field === 'x') {
      updated.x = Math.max(0, Math.min(maxW - 1, val));
    } else if (field === 'y') {
      updated.y = Math.max(0, Math.min(maxH - 1, val));
    }

    setRoiBox(updated);
    selectPreset('custom');
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 rounded-2xl border border-slate-800 p-4">
      {/* Preset Buttons Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
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

      {/* Manual ROI Bounding Box Dimensions Input */}
      <div className="border-t border-slate-800/80 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold text-slate-200">Remove Box Dimensions (px)</h4>
          </div>
          {selectedPreset === 'custom' && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-semibold">
              Custom Size
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-slate-400 block mb-1">Width (W)</label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                max={activeVideo?.width || 3840}
                value={roiBox.w}
                onChange={(e) => handleDimChange('w', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 focus:border-sky-400 focus:outline-none transition-colors"
                placeholder="Width"
              />
              <span className="absolute right-2.5 text-[10px] font-mono text-slate-500 pointer-events-none">px</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-slate-400 block mb-1">Height (H)</label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                max={activeVideo?.height || 2160}
                value={roiBox.h}
                onChange={(e) => handleDimChange('h', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 focus:border-sky-400 focus:outline-none transition-colors"
                placeholder="Height"
              />
              <span className="absolute right-2.5 text-[10px] font-mono text-slate-500 pointer-events-none">px</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-slate-400 block mb-1">Position X</label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="0"
                max={activeVideo?.width || 3840}
                value={roiBox.x}
                onChange={(e) => handleDimChange('x', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 focus:border-sky-400 focus:outline-none transition-colors"
                placeholder="X"
              />
              <span className="absolute right-2.5 text-[10px] font-mono text-slate-500 pointer-events-none">px</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-slate-400 block mb-1">Position Y</label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="0"
                max={activeVideo?.height || 2160}
                value={roiBox.y}
                onChange={(e) => handleDimChange('y', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 focus:border-sky-400 focus:outline-none transition-colors"
                placeholder="Y"
              />
              <span className="absolute right-2.5 text-[10px] font-mono text-slate-500 pointer-events-none">px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
