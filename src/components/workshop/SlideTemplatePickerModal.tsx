import React from 'react';
import { X, Check, Sparkles, Layers } from 'lucide-react';
import { SlideType } from '../../types';
import { SLIDE_TEMPLATES } from '../../data/slideTemplatesData';
import { SlideTemplateWireframe } from './SlideTemplateWireframe';
import { SLIDE_MENU_ITEMS } from '../../data/slideMenuItems';

interface SlideTemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  slideType: SlideType;
  currentVariantId?: number;
  isChangingExistingSlide?: boolean;
  onSelectTemplate?: (variantId: number) => void;
  onSelectVariant?: (variantId: number) => void;
}

export const SlideTemplatePickerModal: React.FC<SlideTemplatePickerModalProps> = ({
  isOpen,
  onClose,
  slideType,
  currentVariantId = 1,
  isChangingExistingSlide = false,
  onSelectTemplate,
  onSelectVariant,
}) => {
  if (!isOpen) return null;

  const templates = SLIDE_TEMPLATES[slideType] || [];
  const slideItem = SLIDE_MENU_ITEMS.find((item) => item.type === slideType);
  const slideName = slideItem ? slideItem.label : slideType;

  const handleCardClick = (variantId: number) => {
    // 1. Notify parent handler to update or add slide with this variant
    if (onSelectTemplate) {
      onSelectTemplate(variantId);
    } else if (onSelectVariant) {
      onSelectVariant(variantId);
    }
    // 2. Immediately close modal so it disappears without delay
    onClose();
  };

  return (
    <div
      id="slide-template-picker-modal"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#fafbfc] border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              {slideItem ? slideItem.icon : <Layers className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {isChangingExistingSlide ? 'تغيير تنسيق شريحة' : 'اختر تنسيق شريحة'}:{' '}
                  <span className="text-blue-600 font-extrabold">{slideName}</span>
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  5 نماذج
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                انقر مباشرة على النموذج المطلوب لاعتماده فوراً
              </p>
            </div>
          </div>

          <button
            type="button"
            id="template-picker-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center border border-slate-200/60 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - 5 Templates Grid (Clicking any card selects and applies immediately) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-slate-200 bg-slate-50/55">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {templates.map((tpl) => {
              const isSelected = currentVariantId === tpl.variantId;
              return (
                <div
                  key={tpl.variantId}
                  id={`template-card-${slideType}-${tpl.variantId}`}
                  onClick={() => handleCardClick(tpl.variantId)}
                  className={`group relative rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] select-none ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-100'
                      : 'bg-white hover:bg-blue-50/20 border-slate-200 hover:border-blue-500/60 shadow-2xs hover:shadow-sm'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(tpl.variantId);
                    }
                  }}
                >
                  {/* Badge & Model Number & Selected Indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:border-blue-500/40 group-hover:text-blue-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{tpl.badge}</span>
                      {isSelected && <span className="text-[10px] font-normal mr-1">(المعتمد)</span>}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {tpl.tagline}
                    </span>
                  </div>

                  {/* Visual Wireframe Preview */}
                  <div className="w-full mb-3 rounded-xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-200 border border-slate-100">
                    <SlideTemplateWireframe slideType={slideType} variantId={tpl.variantId} />
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  {/* Subtle hover prompt bar instead of an add button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-blue-700 transition-colors">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
                      <span>{isSelected ? 'النموذج الحالي مفعل' : 'انقر للاختيار والتطبيق'}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 group-hover:bg-blue-50 border border-slate-200/50 text-slate-600 group-hover:text-blue-700">
                      اختيار
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            النقر على أي نموذج يطبقه فوراً ويغلق النافذة تلقائياً
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
