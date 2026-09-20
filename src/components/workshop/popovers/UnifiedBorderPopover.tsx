import React from 'react';
import { Square, X } from 'lucide-react';

export interface UnifiedBorderConfig {
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
}

interface UnifiedBorderPopoverProps {
  currentBorder: UnifiedBorderConfig;
  onUpdate: (config: UnifiedBorderConfig) => void;
  onClose: () => void;
  title?: string;
}

export const UnifiedBorderPopover: React.FC<UnifiedBorderPopoverProps> = ({
  currentBorder,
  onUpdate,
  onClose,
  title = 'الإطار وزوايا التدوير',
}) => {
  const borderWidth = currentBorder.borderWidth ?? 0;
  const borderColor = currentBorder.borderColor || '#3b82f6';
  const borderRadius = currentBorder.borderRadius ?? 0;
  const borderStyle = currentBorder.borderStyle || 'solid';

  const widths = [
    { value: 0, label: 'بدون إطار' },
    { value: 1, label: '1px رفيع' },
    { value: 2, label: '2px متوسط' },
    { value: 4, label: '4px بارز' },
    { value: 6, label: '6px عريض' },
  ];

  const radiuses = [
    { value: 0, label: 'حادة (0px)' },
    { value: 8, label: 'خفيفة (8px)' },
    { value: 16, label: 'ناعمة (16px)' },
    { value: 24, label: 'دائرية (24px)' },
    { value: 9999, label: 'كبسولة كاملة' },
  ];

  const styles = [
    { id: 'solid', label: 'صلب (Solid)' },
    { id: 'dashed', label: 'متقطع (Dashed)' },
    { id: 'dotted', label: 'منقط (Dotted)' },
  ] as const;

  const quickColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ffffff', '#000000'];

  return (
    <div
      dir="rtl"
      id="unified-border-popover"
      className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right space-y-3 animate-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
          <Square className="w-4 h-4 text-indigo-600" />
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

      {/* 1. Border Width */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-gray-500 block">سماكة الإطار (Border Width):</span>
        <div className="grid grid-cols-5 gap-1">
          {widths.map((w) => {
            const isCur = borderWidth === w.value;
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => onUpdate({ ...currentBorder, borderWidth: w.value })}
                className={`py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer text-center ${
                  isCur
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {w.value === 0 ? 'بدون' : `${w.value}px`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Border Style (if width > 0) */}
      {borderWidth > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-500 block">شكل الخط:</span>
          <div className="grid grid-cols-3 gap-1">
            {styles.map((s) => {
              const isCur = borderStyle === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onUpdate({ ...currentBorder, borderStyle: s.id })}
                  className={`py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer text-center ${
                    isCur
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Border Radius */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-gray-500 block">استدارة الزوايا (Radius):</span>
        <div className="grid grid-cols-5 gap-1">
          {radiuses.map((r) => {
            const isCur = borderRadius === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => onUpdate({ ...currentBorder, borderRadius: r.value })}
                className={`py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer text-center ${
                  isCur
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {r.value === 9999 ? 'بيضاوي' : r.value === 0 ? 'حادة' : `${r.value}px`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Border Color (if width > 0) */}
      {borderWidth > 0 && (
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <span className="text-[10px] text-gray-500 font-bold">لون الإطار:</span>
          <div className="flex items-center gap-1.5">
            {quickColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onUpdate({ ...currentBorder, borderColor: c })}
                className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                  borderColor === c ? 'ring-2 ring-indigo-500 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={borderColor}
              onChange={(e) => onUpdate({ ...currentBorder, borderColor: e.target.value })}
              className="w-5 h-5 rounded-full border border-gray-300 cursor-pointer p-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};
