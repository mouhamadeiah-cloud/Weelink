import React from 'react';
import { Shield, X, Check } from 'lucide-react';

export interface UnifiedShadowConfig {
  enabled: boolean;
  preset?: 'none' | 'soft' | 'medium' | 'deep' | '3d' | 'glow';
  direction?: 'bottom' | 'top' | 'right' | 'left' | 'center';
  blur?: number;
  intensity?: number;
  color?: string;
}

interface UnifiedShadowPopoverProps {
  currentShadow?: UnifiedShadowConfig | string;
  onUpdate: (config: UnifiedShadowConfig) => void;
  onClose: () => void;
  title?: string;
}

export const UnifiedShadowPopover: React.FC<UnifiedShadowPopoverProps> = ({
  currentShadow,
  onUpdate,
  onClose,
  title = 'الظل والعمق ثلاثي الأبعاد',
}) => {
  // Normalize current shadow config
  const shadowConfig: UnifiedShadowConfig = typeof currentShadow === 'string'
    ? {
        enabled: currentShadow !== 'none',
        preset: (currentShadow as any) || 'soft',
        direction: 'bottom',
        blur: currentShadow === 'deep' ? 35 : currentShadow === 'medium' ? 20 : 10,
        intensity: currentShadow === 'deep' ? 0.7 : currentShadow === 'medium' ? 0.5 : 0.3,
        color: '#000000',
      }
    : {
        enabled: currentShadow?.enabled ?? false,
        preset: currentShadow?.preset || 'soft',
        direction: currentShadow?.direction || 'bottom',
        blur: currentShadow?.blur ?? 20,
        intensity: currentShadow?.intensity ?? 0.5,
        color: currentShadow?.color || '#000000',
      };

  const presets = [
    { id: 'none', label: 'بدون ظل', desc: 'مسطح بالكامل' },
    { id: 'soft', label: 'ناعم وخفيف', desc: 'ظل هادئ ومريح' },
    { id: 'medium', label: 'طافي متوسط', desc: 'بروز واضح فوق الخلفية' },
    { id: 'deep', label: 'عميق فاخر', desc: 'ظل سينمائي ممتد' },
    { id: '3d', label: 'ثلاثي أبعاد', desc: 'تأثير مجسم مرتفع' },
    { id: 'glow', label: 'توهج محيطي', desc: 'إشراقة ضوئية منتشرة' },
  ] as const;

  const directions = [
    { id: 'bottom', label: 'أسفل' },
    { id: 'center', label: 'محيطي' },
    { id: 'top', label: 'أعلى' },
    { id: 'right', label: 'يمين' },
    { id: 'left', label: 'يسار' },
  ] as const;

  const quickColors = ['#000000', '#1e293b', '#3b82f6', '#8b5cf6', '#f59e0b', '#ffffff'];

  const handleSelectPreset = (presetId: (typeof presets)[number]['id']) => {
    if (presetId === 'none') {
      onUpdate({
        enabled: false,
        preset: 'none',
        direction: shadowConfig.direction,
        blur: 0,
        intensity: 0,
        color: shadowConfig.color,
      });
    } else {
      let blur = 20;
      let intensity = 0.5;
      if (presetId === 'soft') {
        blur = 12;
        intensity = 0.3;
      } else if (presetId === 'medium') {
        blur = 24;
        intensity = 0.5;
      } else if (presetId === 'deep') {
        blur = 38;
        intensity = 0.7;
      } else if (presetId === '3d') {
        blur = 28;
        intensity = 0.65;
      } else if (presetId === 'glow') {
        blur = 32;
        intensity = 0.8;
      }

      onUpdate({
        enabled: true,
        preset: presetId,
        direction: presetId === 'glow' ? 'center' : shadowConfig.direction || 'bottom',
        blur,
        intensity,
        color: presetId === 'glow' ? '#3b82f6' : shadowConfig.color || '#000000',
      });
    }
  };

  return (
    <div
      dir="rtl"
      id="unified-shadow-popover"
      className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right space-y-3 animate-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
          <Shield className="w-4 h-4 text-purple-600" />
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

      {/* Presets Grid */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 block">نمط الظل والعمق:</label>
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((p) => {
            const isSelected = (!shadowConfig.enabled && p.id === 'none') || (shadowConfig.enabled && shadowConfig.preset === p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-right transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50 text-purple-900 border-purple-300 shadow-xs font-bold'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div>
                  <div className="text-[11px] leading-tight">{p.label}</div>
                  <div className="text-[8px] text-gray-400 leading-tight">{p.desc}</div>
                </div>
                {isSelected && <Check className="w-3 h-3 text-purple-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Direction and Sliders (When enabled) */}
      {shadowConfig.enabled && (
        <div className="space-y-2.5 pt-2 border-t border-gray-100">
          {/* Direction */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 block">اتجاه الظل:</span>
            <div className="grid grid-cols-5 gap-1">
              {directions.map((d) => {
                const isDir = shadowConfig.direction === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onUpdate({ ...shadowConfig, direction: d.id })}
                    className={`py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      isDir
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Blur Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500 font-bold">مدى الانتشار والنعومة (Blur):</span>
              <span className="text-purple-600 font-bold">{shadowConfig.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={shadowConfig.blur}
              onChange={(e) => onUpdate({ ...shadowConfig, blur: Number(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
          </div>

          {/* Intensity Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500 font-bold">كثافة الظل (Intensity):</span>
              <span className="text-purple-600 font-bold">{Math.round((shadowConfig.intensity || 0.5) * 100)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={Math.round((shadowConfig.intensity || 0.5) * 100)}
              onChange={(e) => onUpdate({ ...shadowConfig, intensity: Number(e.target.value) / 100 })}
              className="w-full accent-purple-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
            />
          </div>

          {/* Color palette */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-gray-500 font-bold">لون الظل:</span>
            <div className="flex items-center gap-1.5">
              {quickColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdate({ ...shadowConfig, color: c })}
                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                    shadowConfig.color === c ? 'ring-2 ring-purple-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={shadowConfig.color || '#000000'}
                onChange={(e) => onUpdate({ ...shadowConfig, color: e.target.value })}
                className="w-5 h-5 rounded-full border border-gray-300 cursor-pointer p-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
