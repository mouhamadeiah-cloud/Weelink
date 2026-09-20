import React from 'react';
import { Sun, X, Check } from 'lucide-react';

export interface UnifiedLightingConfig {
  enabled: boolean;
  preset?: 'none' | 'glow-soft' | 'glow-cyan' | 'glow-purple' | 'glow-amber' | 'neon-border' | 'center-glow';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'none';
  intensity?: number;
  color?: string;
  spread?: number;
}

interface UnifiedLightingPopoverProps {
  currentLighting?: UnifiedLightingConfig | string;
  onUpdate: (config: UnifiedLightingConfig) => void;
  onClose: () => void;
  title?: string;
}

export const UnifiedLightingPopover: React.FC<UnifiedLightingPopoverProps> = ({
  currentLighting,
  onUpdate,
  onClose,
  title = 'إضاءة وتوهج العنصر',
}) => {
  const lightingConfig: UnifiedLightingConfig = typeof currentLighting === 'string'
    ? {
        enabled: currentLighting !== 'none',
        preset: (currentLighting as any) || 'glow-amber',
        position: 'center',
        intensity: 0.7,
        color:
          currentLighting === 'glow-cyan'
            ? '#06b6d4'
            : currentLighting === 'glow-purple'
            ? '#a855f7'
            : currentLighting === 'neon-border'
            ? '#38bdf8'
            : '#f59e0b',
        spread: 60,
      }
    : {
        enabled: currentLighting?.enabled ?? false,
        preset: currentLighting?.preset || 'glow-amber',
        position: currentLighting?.position || 'center',
        intensity: currentLighting?.intensity ?? 0.7,
        color: currentLighting?.color || '#f59e0b',
        spread: currentLighting?.spread ?? 60,
      };

  const presets = [
    { id: 'none', label: 'بدون إضاءة', desc: 'محايد هادئ', color: '#64748b' },
    { id: 'glow-cyan', label: 'هالة زرقاء سماوية', desc: 'طابع رقمي مستقبلي', color: '#06b6d4' },
    { id: 'glow-purple', label: 'هالة بنفسجية ملكية', desc: 'إشراقة فاخرة وعصرية', color: '#a855f7' },
    { id: 'glow-amber', label: 'إضاءة ذهبية دافئة', desc: 'توهج عنبري مريح', color: '#f59e0b' },
    { id: 'neon-border', label: 'إطار نيون مشع', desc: 'توهج حواف نيون', color: '#38bdf8' },
    { id: 'center-glow', label: 'توهج من المركز', desc: 'شعاع مضيء ناعم', color: '#ec4899' },
  ] as const;

  const positions = [
    { id: 'center', label: 'وسط' },
    { id: 'top', label: 'أعلى' },
    { id: 'bottom', label: 'أسفل' },
    { id: 'right', label: 'يمين' },
    { id: 'left', label: 'يسار' },
  ] as const;

  const quickColors = ['#f59e0b', '#06b6d4', '#a855f7', '#ec4899', '#10b981', '#ffffff'];

  const handleSelectPreset = (presetId: (typeof presets)[number]['id']) => {
    if (presetId === 'none') {
      onUpdate({
        enabled: false,
        preset: 'none',
        position: 'none',
        intensity: 0,
        color: lightingConfig.color,
        spread: 0,
      });
    } else {
      const selected = presets.find((p) => p.id === presetId);
      onUpdate({
        enabled: true,
        preset: presetId,
        position: lightingConfig.position === 'none' ? 'center' : lightingConfig.position,
        intensity: 0.75,
        color: selected?.color || lightingConfig.color,
        spread: 60,
      });
    }
  };

  return (
    <div
      dir="rtl"
      id="unified-lighting-popover"
      className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right space-y-3 animate-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>{title}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Presets List */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 block">نمط الإضاءة والتوهج:</label>
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((p) => {
            const isSelected = (!lightingConfig.enabled && p.id === 'none') || (lightingConfig.enabled && lightingConfig.preset === p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-right transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs font-bold'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs"
                    style={{ backgroundColor: p.color }}
                  />
                  <div className="truncate">
                    <div className="text-[11px] leading-tight truncate">{p.label}</div>
                    <div className="text-[8px] text-gray-400 leading-tight truncate">{p.desc}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-3 h-3 text-amber-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Position and Sliders */}
      {lightingConfig.enabled && (
        <div className="space-y-2.5 pt-2 border-t border-gray-100">
          {/* Position */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 block">موضع تركيز الإضاءة:</span>
            <div className="grid grid-cols-5 gap-1">
              {positions.map((pos) => {
                const isPos = lightingConfig.position === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => onUpdate({ ...lightingConfig, position: pos.id })}
                    className={`py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      isPos
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {pos.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500 font-bold">شدة التوهج (Intensity):</span>
              <span className="text-amber-600 font-bold">{Math.round((lightingConfig.intensity || 0.7) * 100)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={Math.round((lightingConfig.intensity || 0.7) * 100)}
              onChange={(e) => onUpdate({ ...lightingConfig, intensity: Number(e.target.value) / 100 })}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
          </div>

          {/* Spread Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500 font-bold">مدى الانتشار (Spread):</span>
              <span className="text-amber-600 font-bold">{lightingConfig.spread || 60}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="120"
              value={lightingConfig.spread || 60}
              onChange={(e) => onUpdate({ ...lightingConfig, spread: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
          </div>

          {/* Color palette */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-gray-500 font-bold">لون التوهج:</span>
            <div className="flex items-center gap-1.5">
              {quickColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdate({ ...lightingConfig, color: c })}
                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                    lightingConfig.color === c ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={lightingConfig.color || '#f59e0b'}
                onChange={(e) => onUpdate({ ...lightingConfig, color: e.target.value })}
                className="w-5 h-5 rounded-full border border-gray-300 cursor-pointer p-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
