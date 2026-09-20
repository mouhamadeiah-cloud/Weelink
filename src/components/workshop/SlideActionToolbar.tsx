import React, { useState } from 'react';
import { Plus, Copy, Trash2, Check, X, Layers, LayoutTemplate, Sparkles } from 'lucide-react';
import { Slide, SlideType, ModularElement, ModularElementType, UserRegistrationData, PageColorScheme } from '../../types';
import { SLIDE_MENU_ITEMS } from '../../data/slideMenuItems';
import { AVAILABLE_ELEMENT_OPTIONS, createDefaultModularElement } from '../../data/modularElementsData';
import { AddElementFlyoutPanel } from './AddElementFlyoutPanel';

interface SlideActionToolbarProps {
  slide: Slide;
  isEditReady?: boolean;
  isSelected?: boolean;
  onSelectSlide?: () => void;
  onToggleEditReady?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  onAddSlideBelow: (slideType: SlideType) => void;
  onChangeLayout?: () => void;
  onAddElement?: (element: ModularElement) => void;
  user?: UserRegistrationData;
  colorScheme?: PageColorScheme;
}

export const SlideActionToolbar: React.FC<SlideActionToolbarProps> = ({
  slide,
  isEditReady = true,
  isSelected = false,
  onSelectSlide,
  onToggleEditReady,
  onDuplicate,
  onDelete,
  canDelete,
  onAddSlideBelow,
  onChangeLayout,
  onAddElement,
  user,
  colorScheme,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [copiedAnimation, setCopiedAnimation] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isAddElementMenuOpen, setIsAddElementMenuOpen] = useState(false);

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddMenuOpen(false);
    setIsAddElementMenuOpen(false);
    setCopiedAnimation(true);
    onDuplicate();
    setTimeout(() => setCopiedAnimation(false), 1000);
  };

  const handleDeleteTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddMenuOpen(false);
    setIsAddElementMenuOpen(false);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
    onDelete();
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };

  const handleToggleAddMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
    setIsAddElementMenuOpen(false);
    setIsAddMenuOpen((prev) => !prev);
  };

  const handleToggleAddElementMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
    setIsAddMenuOpen(false);
    setIsAddElementMenuOpen((prev) => !prev);
  };

  const handleSelectSlideType = (e: React.MouseEvent, type: SlideType) => {
    e.stopPropagation();
    setIsAddMenuOpen(false);
    if (typeof onAddSlideBelow === 'function') {
      onAddSlideBelow(type);
    }
  };

  const handleSelectElementType = (e: React.MouseEvent, type: ModularElementType) => {
    e.stopPropagation();
    setIsAddElementMenuOpen(false);
    if (typeof onAddElement === 'function') {
      const newElem = createDefaultModularElement(type, user, colorScheme);
      onAddElement(newElem);
    }
  };

  return (
    <>
      {/* 1. مسار الزر العائم الصغير + لإضافة عنصر: يبدأ في أعلى الشريحة وينزل مع التمرير حتى أسفل الشريحة (Sticky Track) */}
      {isEditReady && (
        <div className="absolute top-4 bottom-8 left-3 sm:left-4 z-[999] pointer-events-none w-fit">
          <div
            id={`slide-add-element-toolbar-${slide.id}`}
            data-slide-menu-open={isAddElementMenuOpen ? 'true' : 'false'}
            dir="rtl"
            onClick={(e) => {
              e.stopPropagation();
              onSelectSlide?.();
            }}
            className="sticky top-20 sm:top-24 pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#060e22]/98 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_20px_rgba(16,185,129,0.3)] text-white transition-all duration-200 animate-in fade-in zoom-in-95"
          >
            {typeof onAddElement === 'function' && (
              <div>
                <button
                  type="button"
                  id={`slide-add-element-btn-${slide.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSlide?.();
                    setIsAddElementMenuOpen(true);
                  }}
                  className="px-2.5 py-2 rounded-xl border bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-100 border-emerald-500/30 transition-all cursor-pointer active:scale-90 flex items-center gap-1.5"
                  title="إضافة عنصر لهذه الشريحة (نصوص، صور، أزرار، بطاقات...)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">عنصر</span>
                </button>

                {/* لوحة إضافة العناصر الكبيرة الشاملة (تغطي حوالي 40% من الصفحة مع نافبار يساري وتبويبات علوية) */}
                <AddElementFlyoutPanel
                  isOpen={isAddElementMenuOpen}
                  onClose={() => setIsAddElementMenuOpen(false)}
                  onAddElement={(newElem) => {
                    if (typeof onAddElement === 'function') {
                      onAddElement(newElem);
                    }
                    setIsAddElementMenuOpen(false);
                  }}
                  user={user}
                  colorScheme={colorScheme}
                  slideTitle={slide.title}
                />
              </div>
            )}

            {/* زر تغيير التنسيق (5 نماذج للتنسيق) */}
            {typeof onChangeLayout === 'function' && slide.type !== 'empty' && (
              <button
                type="button"
                id={`slide-change-layout-btn-${slide.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlide?.();
                  setIsAddMenuOpen(false);
                  setIsAddElementMenuOpen(false);
                  onChangeLayout();
                }}
                className="p-2 rounded-xl border bg-white/5 hover:bg-cyan-500/20 text-gray-200 hover:text-cyan-300 border-white/10 transition-all cursor-pointer active:scale-90"
                title={`تغيير تنسيق الشريحة (النموذج ${slide.layoutVariant || 1} من 5)`}
              >
                <LayoutTemplate className="w-4 h-4 text-cyan-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. شريط أدوات الشريحة السفلي (الحذف، النسخ، وإضافة شريحة) المتموضع عند الفاصل بين الشريحتين */}
      {isEditReady && (
        <>
          {/* خط إرشادي ومستشعر للمرور بالماوس على الفاصل السفلي */}
          <div className="absolute -bottom-3 left-0 right-0 h-6 z-[9997] transition-colors pointer-events-none" />
          <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-white/5 group-hover:bg-blue-500/40 transition-colors duration-300 z-[9998] pointer-events-none" />

          {/* الحاوية الأساسية للأدوات - تطفو فوق كل شيء عند الفاصل بين الشريحتين */}
          <div
            id={`slide-toolbar-${slide.id}`}
            data-slide-menu-open={isAddMenuOpen || showConfirmDelete ? 'true' : 'false'}
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-[9999] pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#060e22]/98 backdrop-blur-2xl border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(59,130,246,0.35)] text-white transition-all duration-300 ${
              isAddMenuOpen || showConfirmDelete
                ? 'opacity-100 scale-100'
                : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 focus-within:opacity-100 focus-within:scale-100'
            }`}
          >
            {/* زر إضافة شريحة تحت الحالية */}
            <div className="relative">
              <button
                type="button"
                id={`slide-add-below-btn-${slide.id}`}
                onClick={handleToggleAddMenu}
                className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-90 ${
                  isAddMenuOpen
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30 ring-2 ring-blue-400/50'
                    : 'bg-white/5 hover:bg-white/15 text-gray-200 hover:text-white border-white/10'
                }`}
                title="إضافة شريحة جديدة تحت هذه الشريحة"
              >
                <Plus className={`w-4 h-4 transition-transform duration-200 ${isAddMenuOpen ? 'rotate-45' : ''}`} />
              </button>

              {/* القائمة المنسدلة لإضافة الشريحة تفتح لأعلى لأن الأدوات في الأسفل */}
              {isAddMenuOpen && (
                <div
                  id={`slide-add-dropdown-${slide.id}`}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-[10000] w-72 sm:w-80 bg-[#071126]/99 border border-blue-500/50 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.98),0_0_25px_rgba(59,130,246,0.35)] p-2 backdrop-blur-2xl max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 animate-in fade-in slide-in-from-bottom-2 text-right"
                >
                  <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between mb-1.5 text-[11px] text-gray-300">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>إضافة شريحة تحت الحالية</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAddMenuOpen(false);
                      }}
                      className="text-gray-400 hover:text-white p-0.5 rounded hover:bg-white/10 cursor-pointer"
                      title="إغلاق"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {SLIDE_MENU_ITEMS.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={(e) => handleSelectSlideType(e, item.type)}
                        className="w-full p-2 rounded-xl hover:bg-white/10 transition-colors text-right flex items-start gap-2.5 group cursor-pointer border border-transparent hover:border-white/10"
                      >
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-blue-500/20 text-blue-400 shrink-0 transition-colors mt-0.5">
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-bold">
                              <Plus className="w-2.5 h-2.5" />
                              إضافة
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* زر نسخ الشريحة */}
            <button
              type="button"
              id={`slide-copy-btn-${slide.id}`}
              onClick={handleDuplicateClick}
              className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-90 ${
                copiedAnimation
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/15 text-gray-200 hover:text-white border-white/10'
              }`}
              title="نسخ الشريحة ووضع نسخة مماثلة تحتها"
            >
              {copiedAnimation ? (
                <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* زر حذف الشريحة */}
            {!showConfirmDelete ? (
              <button
                type="button"
                id={`slide-delete-btn-${slide.id}`}
                disabled={!canDelete}
                onClick={handleDeleteTrigger}
                className={`p-2 rounded-xl border transition-all ${
                  canDelete
                    ? 'bg-white/5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 border-white/10 cursor-pointer active:scale-90'
                    : 'bg-white/[0.02] text-gray-600 border-white/5 cursor-not-allowed opacity-40'
                }`}
                title={canDelete ? 'حذف هذه الشريحة' : 'لا يمكن حذف الشريحة الوحيدة'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-rose-950/80 border border-rose-500/50 animate-in fade-in zoom-in-95">
                <span className="text-[11px] font-bold text-rose-200 whitespace-nowrap">حذف؟</span>
                <button
                  type="button"
                  id={`slide-confirm-delete-btn-${slide.id}`}
                  onClick={handleConfirmDelete}
                  className="p-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-colors"
                  title="تأكيد الحذف"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id={`slide-cancel-delete-btn-${slide.id}`}
                  onClick={handleCancelDelete}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer transition-colors"
                  title="إلغاء"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

