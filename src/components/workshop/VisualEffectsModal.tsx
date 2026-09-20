import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  Zap,
  Gauge,
  Check,
  PauseCircle,
  PlayCircle,
  Trash2,
  Sliders,
  Layers,
  Type,
  Image as ImageIcon,
  Square,
  Search,
} from 'lucide-react';
import { ElementAnimationConfig, AnimationSpeed } from '../../types';
import {
  VISUAL_EFFECTS_LIST,
  VISUAL_EFFECTS_CATEGORIES,
  EffectCategory,
  VisualEffectItem,
  getAnimationClasses,
  getAnimationCSSProperties,
} from '../../data/visualEffectsData';

interface VisualEffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'slide' | 'text' | 'button' | 'image';
  targetTitle?: string;
  currentAnimation?: ElementAnimationConfig;
  onApplyAnimation: (animation: ElementAnimationConfig) => void;
  onRemoveAnimation: () => void;
}

export const VisualEffectsModal: React.FC<VisualEffectsModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetTitle,
  currentAnimation,
  onApplyAnimation,
  onRemoveAnimation,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Keyboard escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Current active configuration
  const activeType = currentAnimation?.type || 'none';
  const activeSpeed: AnimationSpeed = currentAnimation?.speed || 'normal';
  const activePauseOnHover = currentAnimation?.pauseOnHover ?? true;

  if (!isOpen || !mounted) return null;

  // Filter effects by category and search
  const filteredEffects = VISUAL_EFFECTS_LIST.filter((effect) => {
    const matchesCategory = selectedCategory === 'all' || effect.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      effect.name.includes(searchQuery.trim()) ||
      effect.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      effect.description.includes(searchQuery.trim());
    return matchesCategory && matchesSearch;
  });

  const handleRemove = () => {
    onRemoveAnimation();
    onApplyAnimation({
      type: 'none',
      speed: 'normal',
      pauseOnHover: true,
    });
  };

  const handleSelectEffect = (effect: VisualEffectItem) => {
    if (effect.id === 'none') {
      handleRemove();
      return;
    }
    onApplyAnimation({
      type: effect.id,
      speed: activeSpeed,
      pauseOnHover: activePauseOnHover,
    });
  };

  const handleSpeedChange = (speed: AnimationSpeed) => {
    onApplyAnimation({
      type: activeType !== 'none' ? activeType : 'pulse',
      speed,
      pauseOnHover: activePauseOnHover,
    });
  };

  const handlePauseOnHoverToggle = () => {
    onApplyAnimation({
      type: activeType !== 'none' ? activeType : 'flow-left',
      speed: activeSpeed,
      pauseOnHover: !activePauseOnHover,
    });
  };

  const currentEffectItem = VISUAL_EFFECTS_LIST.find((e) => e.id === activeType);

  const getTargetIcon = () => {
    switch (targetType) {
      case 'slide':
        return <Layers className="w-3.5 h-3.5 text-purple-600" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-blue-600" />;
      case 'button':
        return <Square className="w-3.5 h-3.5 text-emerald-600" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const getTargetLabel = () => {
    switch (targetType) {
      case 'slide':
        return 'الشريحة الحالية';
      case 'text':
        return 'النص المحدد';
      case 'button':
        return 'الزر المحدد';
      case 'image':
        return 'الصورة المحددة';
    }
  };

  const modalContent = (
    <div
      id="visual-effects-modal-overlay"
      data-modal-portal="true"
      className="fixed inset-0 z-[999999] bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-5 overflow-hidden text-right"
      dir="rtl"
      onPointerDown={(e) => {
        if (e.target !== e.currentTarget) {
          e.stopPropagation();
        }
      }}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) {
          e.stopPropagation();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="visual-effects-modal-container"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-4xl h-[86vh] max-h-[720px] min-h-[460px] bg-[#fafbfc] text-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden text-right my-auto animate-in zoom-in-95 duration-200"
      >
        {/* ================= Header (Fixed Top, Always Visible) ================= */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  مكتبة التأثيرات والحركات البصرية
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  25 حركة تفاعلية
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>تطبيق الحركة على:</span>
                <span className="inline-flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                  {getTargetIcon()}
                  <span>{targetTitle || getTargetLabel()}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeType !== 'none' && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-all cursor-pointer shadow-2xs"
                title="إلغاء الحركة المطبقة وإبقاء العنصر ثابتاً"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">إلغاء الحركة (ثابت)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/60"
              title="إغلاق النافذة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= Current Active & Settings Bar ================= */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Active Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${activeType !== 'none' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">التأثير النشط حالياً:</span>
              <span className={`font-bold text-xs px-2.5 py-0.5 rounded-lg border ${
                activeType !== 'none'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}>
                {currentEffectItem ? currentEffectItem.name : 'بدون حركة (ثابت)'}
              </span>
            </div>
          </div>

          {/* Speed & Hover Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Speed Control */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 pl-1 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-blue-600" />
                <span>السرعة:</span>
              </span>
              {(['slow', 'normal', 'fast'] as AnimationSpeed[]).map((spd) => {
                const labels: Record<AnimationSpeed, string> = {
                  slow: 'بطيء',
                  normal: 'متوسط',
                  fast: 'سريع',
                };
                return (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      activeSpeed === spd
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {labels[spd]}
                  </button>
                );
              })}
            </div>

            {/* Pause on hover toggle */}
            <button
              type="button"
              onClick={handlePauseOnHoverToggle}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${
                activePauseOnHover
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="إيقاف الحركة مؤقتاً عند تمرير مؤشر الفأرة فوق العنصر"
            >
              <PauseCircle className="w-3.5 h-3.5 text-purple-600" />
              <span>إيقاف عند التمرير</span>
            </button>
          </div>
        </div>

        {/* ================= Filter Tabs & Search ================= */}
        <div className="px-5 sm:px-6 pt-3 pb-2.5 border-b border-slate-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs no-scrollbar">
            {VISUAL_EFFECTS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن حركة (جريان، تماوج، نبض...)"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* ================= Effects Grid (25 Cards with Live Previews) ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Default "No Effect" Option Card */}
            <div
              onClick={handleRemove}
              className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs ${
                activeType === 'none'
                  ? 'bg-blue-50/90 border-2 border-blue-500 shadow-sm ring-1 ring-blue-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">بدون حركة (ثابت)</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">إلغاء جميع المؤثرات وإبقاء العنصر ساكناً</p>
                </div>
              </div>
              {activeType === 'none' && (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* 25 Animated Effect Cards */}
            {filteredEffects.map((effect) => {
              const isSelected = activeType === effect.id;
              const previewStyles = getAnimationCSSProperties({
                type: effect.id,
                speed: activeSpeed,
              });

              return (
                <div
                  key={effect.id}
                  onClick={() => handleSelectEffect(effect)}
                  className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                    isSelected
                      ? 'bg-blue-50/90 border-2 border-blue-600 shadow-md ring-2 ring-blue-100'
                      : 'bg-white hover:bg-blue-50/20 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {/* Top: Badges & Select Indicator */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                      {effect.categoryName}
                    </span>
                    {effect.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        {effect.badge}
                      </span>
                    )}
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Middle: Live Animation Preview Box */}
                  <div className="w-full h-16 rounded-xl bg-slate-100/90 border border-slate-200 mb-2.5 flex items-center justify-center overflow-hidden p-2 relative shadow-inner">
                    {/* Background Wave Indicator if applicable */}
                    {(effect.id === 'gradient-wave-h' || effect.id === 'gradient-wave-v') ? (
                      <div
                        className={`w-full h-full rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm ${effect.cssClass}`}
                        style={previewStyles}
                      >
                        تماوج ألوان متصل ✦
                      </div>
                    ) : effect.id === 'flow-left' || effect.id === 'flow-right' ? (
                      <div className="w-full overflow-hidden whitespace-nowrap text-center">
                        <span
                          className={`inline-block font-bold text-xs text-blue-700 ${effect.cssClass}`}
                          style={previewStyles}
                        >
                          ✦ جريان البورصة والأخبار العاجلة ✦ تدفق سلس
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 ${effect.cssClass}`}
                        style={previewStyles}
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>معاينة الحركة</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Name & Description */}
                  <div>
                    <h4 className={`text-xs font-bold transition-colors ${isSelected ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-600'}`}>
                      {effect.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {effect.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= Footer ================= */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            <span>انقر على أي حركة لتطبيقها ومعاينتها فوراً، مع إمكانية التبديل بحرية.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            تم واعتمد الحركة
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
