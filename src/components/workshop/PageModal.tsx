import React, { useState, useEffect } from 'react';
import { X, Check, Palette, Layers, Trash2, Sparkles, Sliders } from 'lucide-react';
import { WebPage, PageColorScheme, SlideArrangement } from '../../types';
import { PRESET_COLOR_SCHEMES, createCustomColorScheme } from '../../data/colorSchemes';

interface PageModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  pageToEdit?: WebPage | null;
  canDelete?: boolean;
  onSave: (data: {
    title: string;
    colorScheme: PageColorScheme;
    arrangement: SlideArrangement;
  }) => void;
  onDelete?: (pageId: string) => void;
}

const PAGE_NAME_SUGGESTIONS = [
  'الرئيسية',
  'من نحن',
  'خدماتنا',
  'المعرض',
  'أعمالنا ومشاريعنا',
  'فريق العمل',
  'الأسئلة الشائعة',
  'تواصل معنا',
];

export const PageModal: React.FC<PageModalProps> = ({
  isOpen,
  onClose,
  mode,
  pageToEdit,
  canDelete = false,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<PageColorScheme>(PRESET_COLOR_SCHEMES[0]);
  const [colorTab, setColorTab] = useState<'presets' | 'custom'>('presets');
  const [customPrimary, setCustomPrimary] = useState('#8b5cf6');
  const [customAccent, setCustomAccent] = useState('#c084fc');
  const [arrangement, setArrangement] = useState<SlideArrangement>('straight');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      if (mode === 'edit' && pageToEdit) {
        setTitle(pageToEdit.title);
        const scheme = pageToEdit.colorScheme || PRESET_COLOR_SCHEMES[0];
        setSelectedScheme(scheme);
        if (scheme.isCustom) {
          setColorTab('custom');
          setCustomPrimary(scheme.primary);
          setCustomAccent(scheme.accent);
        } else {
          setColorTab('presets');
        }
        setArrangement(pageToEdit.arrangement || 'straight');
      } else {
        setTitle('');
        setSelectedScheme(PRESET_COLOR_SCHEMES[0]);
        setColorTab('presets');
        setArrangement('straight');
      }
    }
  }, [isOpen, mode, pageToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || (mode === 'create' ? 'صفحة جديدة' : 'صفحة');
    onSave({
      title: finalTitle,
      colorScheme: selectedScheme,
      arrangement,
    });
    onClose();
  };

  const handleDelete = () => {
    if (pageToEdit && onDelete) {
      onDelete(pageToEdit.id);
      onClose();
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="page-modal-card"
        className="w-full max-w-xl bg-[#fafbfc] text-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200/90 font-['Cairo',sans-serif] my-8 animate-in fade-in zoom-in duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              {mode === 'create' ? 'إضافة صفحة جديدة للموقع' : `تعديل إعدادات: ${pageToEdit?.title}`}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              حدد اسم الصفحة، نسق الألوان المقترح، ونمط ترتيب الشرائح
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors border border-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* 1. Page Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              اسم الصفحة في النافبار والموقع <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: من نحن، خدماتنا، المعرض..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
            />

            {/* Quick Suggestions */}
            <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-slate-500 ml-1">اقتراحات سريعة:</span>
              {PAGE_NAME_SUGGESTIONS.map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => setTitle(sug)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/60 text-[11px] text-slate-600 transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Coordinated Color Scheme (الألوان والنمط اللوني المتكامل) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-blue-600" />
                <span>النمط اللوني للصفحة بالكامل</span>
              </label>
              <span className="text-xs text-blue-600 font-medium">
                {selectedScheme.name}
              </span>
            </div>

            {/* Toggle between Presets and Custom 2 Colors */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs">
              <button
                type="button"
                onClick={() => {
                  setColorTab('presets');
                  if (selectedScheme.isCustom) {
                    setSelectedScheme(PRESET_COLOR_SCHEMES[0]);
                  }
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  colorTab === 'presets'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>نماذج ألوان متناسقة جاهزة</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setColorTab('custom');
                  const custom = createCustomColorScheme(customPrimary, customAccent);
                  setSelectedScheme(custom);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  colorTab === 'custom'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>تخصيص لونين بدرجاتهما</span>
              </button>
            </div>

            {/* View A: Ready Presets */}
            {colorTab === 'presets' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {PRESET_COLOR_SCHEMES.map((scheme) => {
                  const isSelected = selectedScheme.id === scheme.id;
                  return (
                    <button
                      type="button"
                      key={scheme.id}
                      onClick={() => setSelectedScheme(scheme)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/90 shadow-sm ring-1 ring-blue-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Swatch chips */}
                        <div className="flex -space-x-1.5 rtl:space-x-reverse items-center">
                          {scheme.previewColors.map((c, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full border border-white/85 shadow-sm"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 line-clamp-1">
                            {scheme.name}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* View B: Custom 2-Color Engine */}
            {colorTab === 'custom' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Color 1: Primary */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">
                      اللون الأساسي (للأزرار والرموز البارزة)
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
                      <input
                        type="color"
                        value={customPrimary}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomPrimary(val);
                          const custom = createCustomColorScheme(val, customAccent);
                          setSelectedScheme(custom);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={customPrimary}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomPrimary(val);
                          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                            const custom = createCustomColorScheme(val, customAccent);
                            setSelectedScheme(custom);
                          }
                        }}
                        className="flex-1 bg-transparent text-xs text-slate-800 uppercase font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Color 2: Secondary / Accent */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">
                      اللون الثانوي / التمييزي (للإطارات والنصوص والتوهج)
                    </label>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
                      <input
                        type="color"
                        value={customAccent}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomAccent(val);
                          const custom = createCustomColorScheme(customPrimary, val);
                          setSelectedScheme(custom);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={customAccent}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomAccent(val);
                          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                            const custom = createCustomColorScheme(customPrimary, val);
                            setSelectedScheme(custom);
                          }
                        }}
                        className="flex-1 bg-transparent text-xs text-slate-800 uppercase font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Harmonized Palette Preview Card */}
                <div
                  className="p-3.5 rounded-xl border space-y-2.5 transition-all bg-white"
                  style={{
                    borderColor: selectedScheme.borderColor || 'rgba(0,0,0,0.08)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold animate-pulse" style={{ color: selectedScheme.accent }}>
                      معاينة حية لتدرجات الصفحة والصناديق
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: selectedScheme.primary }}
                    >
                      زر أساسي
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    يتم تلقائياً حساب درجات الخلفية الداكنة، خلفية الصناديق والكروت، حدود الإطارات،
                    والنصوص لتتناسب وتتكامل بشكل متناسق مع اللونين المختارين.
                  </p>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: selectedScheme.primary }}
                      />
                      أساسي: {selectedScheme.primary}
                    </span>
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: selectedScheme.accent }}
                      />
                      تمييزي: {selectedScheme.accent}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Slide Stacking Arrangement (ترتيب الشرائح: مستقيم أو متداخلة) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>ترتيب الشرائح فوق بعضها</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: مستقيم (Straight) */}
              <button
                type="button"
                onClick={() => setArrangement('straight')}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                  arrangement === 'straight'
                    ? 'border-blue-500 bg-blue-50/90 shadow-sm ring-1 ring-blue-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    بشكل مستقيم (Straight)
                  </span>
                  {arrangement === 'straight' && (
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  شرائح متتالية مستوية تفصل بينها خطوط وفواصل هندسية أنيقة.
                </p>
                {/* Visual miniature */}
                <div className="space-y-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200">
                  <div className="h-3 rounded bg-blue-600/30 border border-blue-500/20" />
                  <div className="h-3 rounded bg-blue-600/20 border border-blue-500/20" />
                  <div className="h-3 rounded bg-blue-600/15 border border-blue-500/20" />
                </div>
              </button>

              {/* Option B: متداخلة (Overlapping) */}
              <button
                type="button"
                onClick={() => setArrangement('overlapping')}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                  arrangement === 'overlapping'
                    ? 'border-blue-500 bg-blue-50/90 shadow-sm ring-1 ring-blue-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    متداخلة (Overlapping)
                  </span>
                  {arrangement === 'overlapping' && (
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  شرائح متداخلة هرمياً، بانحناءات وزوايا وظلال تصعد فوق بعضها.
                </p>
                {/* Visual miniature with overlap */}
                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 relative h-[56px] overflow-hidden">
                  <div className="absolute top-1 right-2 left-2 h-5 rounded-t-lg bg-purple-600/40 border-t border-purple-400/40" />
                  <div className="absolute top-4 right-2 left-2 h-5 rounded-t-lg bg-purple-500/50 border-t border-purple-300/50 shadow-md" />
                  <div className="absolute top-7 right-2 left-2 h-5 rounded-t-lg bg-purple-400/60 border-t border-white/60 shadow-lg" />
                </div>
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            {mode === 'edit' && canDelete && (
              <div>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 py-2 px-3 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الصفحة</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-1.5 rounded-xl">
                    <span className="text-xs text-rose-700 font-bold px-1">تأكيد الحذف؟</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                    >
                      نعم، حذف
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 hover:text-slate-800"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2.5 mr-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                {mode === 'create' ? 'إنشاء وإضافة الصفحة' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
