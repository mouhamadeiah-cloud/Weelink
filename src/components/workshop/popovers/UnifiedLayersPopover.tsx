import React from 'react';
import { Layers, X, ArrowUp, ArrowDown } from 'lucide-react';

interface UnifiedLayersPopoverProps {
  onLayerAction: (action: 'bringToFront' | 'bringForward' | 'sendBackward' | 'sendToBack') => void;
  onClose: () => void;
  title?: string;
}

// Custom clear layer icons
const LayerTopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const LayerBottomIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 12 12 17 22 12" />
    <polyline points="2 17 12 22 22 17" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const UnifiedLayersPopover: React.FC<UnifiedLayersPopoverProps> = ({
  onLayerAction,
  onClose,
  title = 'ترتيب الطبقات',
}) => {
  return (
    <div
      dir="rtl"
      id="unified-layers-popover"
      className="absolute top-full right-0 mt-2 w-72 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right space-y-3 animate-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
          <Layers className="w-4 h-4 text-blue-600" />
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

      {/* Grid 4 Actions */}
      <div className="grid grid-cols-4 gap-1.5">
        {/* 1. فوق الجميع */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLayerAction('bringToFront');
          }}
          className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all cursor-pointer text-gray-700"
          title="فوق الجميع (أعلى طبقة)"
        >
          <LayerTopIcon className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-bold">فوق</span>
        </button>

        {/* 2. للأعلى */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLayerAction('bringForward');
          }}
          className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all cursor-pointer text-gray-700"
          title="رفع طبقة للأعلى"
        >
          <ArrowUp className="w-4 h-4 text-amber-600" />
          <span className="text-[10px] font-bold">للأعلى</span>
        </button>

        {/* 3. للأسفل */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLayerAction('sendBackward');
          }}
          className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all cursor-pointer text-gray-700"
          title="تنزيل طبقة للأسفل"
        >
          <ArrowDown className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-bold">للأسفل</span>
        </button>

        {/* 4. تحت الجميع */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLayerAction('sendToBack');
          }}
          className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all cursor-pointer text-gray-700"
          title="تحت الجميع (أسفل طبقة)"
        >
          <LayerBottomIcon className="w-4 h-4 text-rose-600" />
          <span className="text-[10px] font-bold">تحت</span>
        </button>
      </div>
    </div>
  );
};
