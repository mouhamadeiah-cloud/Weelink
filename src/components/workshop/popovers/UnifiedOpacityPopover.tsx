import React from 'react';
import { Sliders, X } from 'lucide-react';

interface UnifiedOpacityPopoverProps {
  opacity: number; // 0 to 1
  onUpdate: (opacity: number) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const UnifiedOpacityPopover: React.FC<UnifiedOpacityPopoverProps> = ({
  opacity,
  onUpdate,
  onClose,
  title = 'درجة الشفافية',
  subtitle = 'التحكم في ظهور وشفافية العنصر',
}) => {
  const percent = Math.round((opacity !== undefined ? opacity : 1) * 100);
  const chips = [25, 50, 75, 90, 100];

  return (
    <div
      dir="rtl"
      id="unified-opacity-popover"
      className="absolute top-full right-0 mt-2 w-72 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right space-y-3 animate-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
            <Sliders className="w-4 h-4 text-cyan-600" />
            <span>{title}</span>
          </div>
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Value & Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-600">نسبة الوضوح:</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            {percent}%
          </span>
        </div>

        <input
          type="range"
          min="5"
          max="100"
          value={percent}
          onChange={(e) => onUpdate(Number(e.target.value) / 100)}
          className="w-full accent-cyan-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
        />
      </div>

      {/* Quick Chips */}
      <div className="space-y-1 pt-1 border-t border-gray-100">
        <span className="text-[10px] font-bold text-gray-400 block">خيارات سريعة:</span>
        <div className="grid grid-cols-5 gap-1">
          {chips.map((val) => {
            const isSelected = Math.abs(percent - val) <= 3;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onUpdate(val / 100)}
                className={`py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {val}%
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
