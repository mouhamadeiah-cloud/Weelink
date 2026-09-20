import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Check,
  X,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Pipette,
  Highlighter,
  Link as LinkIcon,
  Italic,
  Bold,
  Underline,
  List,
  ListOrdered,
  Type,
  Square,
  Layers,
  Blend,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { useTextEdit } from '../../context/TextEditContext';
import { WebPage, PageColorScheme, TextFormattingStyle } from '../../types';
import { VisualEffectsModal } from './VisualEffectsModal';

// SVG Helpers matching BottomTextToolbar
const LayerTopBlueIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" stroke="#9ca3af" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" stroke="#9ca3af" />
    <path
      d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
      stroke="#2563eb"
      fill="#3b82f6"
      fillOpacity="0.25"
    />
  </svg>
);

const LayerBottomBlueIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path
      d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
      stroke="#9ca3af"
    />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" stroke="#9ca3af" />
    <path
      d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"
      stroke="#2563eb"
      fill="#3b82f6"
      fillOpacity="0.25"
    />
  </svg>
);

interface TextEditTopBarProps {
  pages: WebPage[];
  activePageId: string;
  colorScheme: PageColorScheme;
}

type ActivePopup =
  | null
  | 'align'
  | 'color'
  | 'backgroundColor'
  | 'textOpacity'
  | 'link'
  | 'fontFamily'
  | 'fontSize'
  | 'boxStyle'
  | 'layers';

const AVAILABLE_FONTS = [
  // --- خطوط عربية حديثة وسنس (Arabic Modern & Sans-Serif) ---
  { id: 'Cairo', name: 'القاهرة (Cairo) - خط واجهات حديث', family: "'Cairo', sans-serif" },
  { id: 'Tajawal', name: 'تجوال (Tajawal) - هندسي أنيق', family: "'Tajawal', sans-serif" },
  { id: 'Almarai', name: 'المراعي (Almarai) - خط رسمي متزن', family: "'Almarai', sans-serif" },
  { id: 'Alexandria', name: 'الإسكندرية (Alexandria) - عصري فخم', family: "'Alexandria', sans-serif" },
  { id: 'Zain', name: 'زين (Zain) - مقروء وناعم', family: "'Zain', sans-serif" },
  { id: 'Harmattan', name: 'حرمل (Harmattan) - مريح للعين', family: "'Harmattan', sans-serif" },

  // --- خطوط عربية فنية وتشكيلية (Arabic Artistic & Calligraphy) ---
  { id: 'Amiri', name: 'أميري الكلاسيكي (Amiri) - خط نسخ تراثي', family: "'Amiri', serif" },
  { id: 'Aref Ruqaa', name: 'عارف رقعة (Aref Ruqaa) - رقعة فني', family: "'Aref Ruqaa', serif" },
  { id: 'Reem Kufi', name: 'ريم الكوفي (Reem Kufi) - كوفي تاريخي', family: "'Reem Kufi', sans-serif" },
  { id: 'Lalezar', name: 'لاليزار (Lalezar) - عريض ووحشي جذاب', family: "'Lalezar', sans-serif" },
  { id: 'Changa', name: 'شانغا (Changa) - هندسي صلب ومضلع', family: "'Changa', sans-serif" },
  { id: 'Lemonada', name: 'ليمونادا (Lemonada) - انسيابي مرح', family: "'Lemonada', sans-serif" },
  { id: 'Lateef', name: 'لطيف (Lateef) - نستعليق مرن وسلس', family: "'Lateef', cursive" },
  { id: 'Marhey', name: 'مرحي (Marhey) - طفولي ترفيهي مبدع', family: "'Marhey', sans-serif" },
  { id: 'El Messiri', name: 'المسيري (El Messiri) - زخرفي ناعم', family: "'El Messiri', sans-serif" },
  { id: 'Kufam', name: 'كوفام (Kufam) - كوفي معاصر جريء', family: "'Kufam', sans-serif" },
  { id: 'Rakkas', name: 'رقاص (Rakkas) - راقص فني استثنائي', family: "'Rakkas', display" },
  { id: 'Jomhuria', name: 'جمهورية (Jomhuria) - عريض جداً ملفت', family: "'Jomhuria', display" },
  { id: 'Qahiri', name: 'قاهري (Qahiri) - مخطوطات أثرية', family: "'Qahiri', display" },

  // --- خطوط لاتينية فنية وعالمية (Latin Artistic & Display) ---
  { id: 'Playfair Display', name: 'Playfair Display - سيريف كلاسيكي فخم', family: "'Playfair Display', serif" },
  { id: 'Montserrat', name: 'Montserrat - هندسي مودرن شهير', family: "'Montserrat', sans-serif" },
  { id: 'Inter', name: 'Inter - تقني شديد الوضوح', family: "'Inter', sans-serif" },
  { id: 'Cinzel', name: 'Cinzel - ملكي روماني منحوت', family: "'Cinzel', serif" },
  { id: 'Cormorant Garamond', name: 'Cormorant Garamond - خط فاخر جداً', family: "'Cormorant Garamond', serif" },
  { id: 'Pacifico', name: 'Pacifico - كتابة يد انسيابية حيوية', family: "'Pacifico', cursive" },
  { id: 'Great Vibes', name: 'Great Vibes - كتابة رسمية فاخرة زفافية', family: "'Great Vibes', cursive" },
  { id: 'Sacramento', name: 'Sacramento - خط رفيع شاعري', family: "'Sacramento', cursive" },
  { id: 'Lobster', name: 'Lobster - خط ملصقات ريترو جريء', family: "'Lobster', cursive" },
  { id: 'Bebas Neue', name: 'Bebas Neue - عنوان رئيسي طويل صلب', family: "'Bebas Neue', sans-serif" },
  { id: 'Syne', name: 'Syne - خط تجريدي فني وعصري', family: "'Syne', sans-serif" },
  { id: 'Oswald', name: 'Oswald - خط إعلاني مضغوط قوي', family: "'Oswald', sans-serif" },
  { id: 'Unbounded', name: 'Unbounded - لاتيني وعربي فني عريض', family: "'Unbounded', sans-serif" },
  { id: 'Dancing Script', name: 'Dancing Script - خط مائل مرح وودود', family: "'Dancing Script', cursive" },
];

const AVAILABLE_FONT_SIZES = [
  { label: 'صغير جداً (12px)', value: '12px' },
  { label: 'صغير (14px)', value: '14px' },
  { label: 'عادي (16px)', value: '16px' },
  { label: 'متوسط (18px)', value: '18px' },
  { label: 'كبير (22px)', value: '22px' },
  { label: 'كبير جداً (28px)', value: '28px' },
  { label: 'عنوان بارز (36px)', value: '36px' },
  { label: 'عنوان ضخم (48px)', value: '48px' },
];

export const TextEditTopBar: React.FC<TextEditTopBarProps> = ({
  pages,
  activePageId,
  colorScheme,
}) => {
  const {
    activeSession,
    updateCurrentStyle,
    commitEditing,
    cancelEditing,
    performLayerAction,
  } = useTextEdit();

  const [activePopup, setActivePopup] = useState<ActivePopup>(null);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Link form state
  const [linkType, setLinkType] = useState<'internal' | 'url' | 'phone' | 'whatsapp' | 'email'>('internal');
  const [linkValue, setLinkValue] = useState('');

  // Close popup if clicking outside the popover container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Color palette derived from theme (deduplicated)
  const themeColors = useMemo(() => {
    const rawColors = [
      '#ffffff',
      '#000000',
      colorScheme.primary || '#3b82f6',
      colorScheme.accent || '#f59e0b',
      colorScheme.previewColors?.[0] || '#2563eb',
      colorScheme.previewColors?.[1] || '#d97706',
      colorScheme.previewColors?.[2] || '#10b981',
      '#ef4444',
      '#ec4899',
      '#8b5cf6',
      '#14b8a6',
      '#64748b',
    ];
    return Array.from(new Set(rawColors.map((c) => c.toLowerCase())));
  }, [colorScheme]);

  if (!activeSession) return null;

  const currentStyle = activeSession.currentStyle;

  const activeBgColor =
    currentStyle.boxStyle?.hasBackground && currentStyle.boxStyle?.backgroundColor
      ? currentStyle.boxStyle.backgroundColor
      : currentStyle.backgroundColor || undefined;

  const togglePopup = (popup: ActivePopup) => {
    if (activePopup === popup) {
      setActivePopup(null);
    } else {
      setActivePopup(popup);
      if (popup === 'link') {
        setLinkType(currentStyle.link?.type || 'internal');
        setLinkValue(currentStyle.link?.value || (pages[0]?.title || ''));
      }
    }
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  return (
    <div
      dir="rtl"
      ref={containerRef}
      id="slide-inline-edit-toolbar"
      data-text-edit-topbar="true"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="relative z-50 flex items-center gap-1 sm:gap-1.5 bg-black/40 p-1 sm:p-1.5 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-xs text-white"
    >
      {/* 1. Alignment Button */}
      <button
        type="button"
        id="toolbar-align-btn"
        onClick={() => togglePopup('align')}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          activePopup === 'align'
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="تنسيق المحاذاة"
      >
        {currentStyle.align === 'center' ? (
          <AlignCenter className="w-3.5 h-3.5" />
        ) : currentStyle.align === 'left' ? (
          <AlignLeft className="w-3.5 h-3.5" />
        ) : (
          <AlignRight className="w-3.5 h-3.5" />
        )}
      </button>

      {/* 2. Color Button (لون الخط) */}
      <button
        type="button"
        id="toolbar-color-btn"
        onClick={() => togglePopup('color')}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer relative ${
          activePopup === 'color'
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="لون النص"
      >
        <Pipette className="w-3.5 h-3.5" />
        {currentStyle.color && (
          <span
            className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full border border-black shadow"
            style={{ backgroundColor: currentStyle.color }}
          />
        )}
      </button>

      {/* 3. Background Color Button (لون خلفية النص) */}
      <button
        type="button"
        id="toolbar-bg-color-btn"
        onClick={() => togglePopup('backgroundColor')}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer relative ${
          activePopup === 'backgroundColor' || activeBgColor
            ? 'bg-amber-600/30 text-amber-300 border-amber-500/40 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="لون خلفية النص"
      >
        <Highlighter className="w-3.5 h-3.5" />
        {activeBgColor && activeBgColor !== 'transparent' && (
          <span
            className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full border border-black shadow"
            style={{ backgroundColor: activeBgColor }}
          />
        )}
      </button>

      {/* 3.1 Text Opacity Button (شفافية النص) */}
      <button
        type="button"
        id="toolbar-text-opacity-btn"
        onClick={() => togglePopup('textOpacity')}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer relative ${
          activePopup === 'textOpacity' || (currentStyle.opacity !== undefined && currentStyle.opacity < 1)
            ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="شفافية النص"
      >
        <Blend className="w-3.5 h-3.5" />
        {currentStyle.opacity !== undefined && currentStyle.opacity < 1 && (
          <span className="absolute -top-1 -right-1 text-[8px] font-mono font-bold bg-purple-600 text-white rounded-full px-0.5 border border-purple-300">
            {Math.round(currentStyle.opacity * 100)}%
          </span>
        )}
      </button>

      {/* 4. Link Button */}
      <button
        type="button"
        id="toolbar-link-btn"
        onClick={() => togglePopup('link')}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          currentStyle.link || activePopup === 'link'
            ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="إضافة رابط"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>

      {/* 5. Italic Button */}
      <button
        type="button"
        id="toolbar-italic-btn"
        onClick={() => updateCurrentStyle((s) => ({ ...s, italic: !s.italic }))}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          currentStyle.italic
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="مائل"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* 6. Bold Button */}
      <button
        type="button"
        id="toolbar-bold-btn"
        onClick={() => updateCurrentStyle((s) => ({ ...s, bold: !s.bold }))}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          currentStyle.bold
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="عريض"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* 7. Underline Button */}
      <button
        type="button"
        id="toolbar-underline-btn"
        onClick={() => updateCurrentStyle((s) => ({ ...s, underline: !s.underline }))}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          currentStyle.underline
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="تحته خط"
      >
        <Underline className="w-3.5 h-3.5" />
      </button>

      {/* 8. Bullet List Button */}
      <button
        type="button"
        id="toolbar-bullet-list-btn"
        onClick={() =>
          updateCurrentStyle((s) => ({
            ...s,
            listType: s.listType === 'bullet' ? 'none' : 'bullet',
          }))
        }
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          currentStyle.listType === 'bullet'
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="تعداد نقطي"
      >
        <List className="w-3.5 h-3.5" />
      </button>

      {/* 9. Numbered List Button */}
      <button
        type="button"
        id="toolbar-numbered-list-btn"
        onClick={() =>
          updateCurrentStyle((s) => ({
            ...s,
            listType: s.listType === 'numbered' ? 'none' : 'numbered',
          }))
        }
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          currentStyle.listType === 'numbered'
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="تعداد رقمي"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      {/* 10. Font Family Button */}
      <button
        type="button"
        id="toolbar-font-family-btn"
        onClick={() => togglePopup('fontFamily')}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          activePopup === 'fontFamily'
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="شكل الخط"
      >
        <span className="font-bold border border-current px-0.5 rounded text-[10px]">A</span>
      </button>

      {/* 11. Font Size Button */}
      <button
        type="button"
        id="toolbar-font-size-btn"
        onClick={() => togglePopup('fontSize')}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          activePopup === 'fontSize'
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="حجم الخط"
      >
        <Type className="w-3.5 h-3.5" />
      </button>

      {/* 12. Box Style Button */}
      <button
        type="button"
        id="toolbar-box-style-btn"
        onClick={() => togglePopup('boxStyle')}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          activePopup === 'boxStyle'
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="تنسيق إطار وخلفية المربع"
      >
        <Square className="w-3.5 h-3.5" />
      </button>

      {/* 13. Layers Button */}
      <button
        type="button"
        id="toolbar-layers-btn"
        onClick={() => togglePopup('layers')}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          activePopup === 'layers'
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="ترتيب الطبقات"
      >
        <Layers className="w-3.5 h-3.5" />
      </button>

      {/* 14. Visual Effects & Animations Button (تأثيرات بصرية للنص - مكتبة 25 حركة) */}
      <button
        type="button"
        id="toolbar-text-effects-btn"
        onClick={() => setIsEffectsModalOpen(true)}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          currentStyle.animation && currentStyle.animation.type && currentStyle.animation.type !== 'none'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md ring-1 ring-blue-300 font-bold'
            : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
        }`}
        title="تأثيرات بصرية وحركات للنص (مكتبة من 25 حركة كالجريان وتماوج الألوان)"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        {currentStyle.animation && currentStyle.animation.type && currentStyle.animation.type !== 'none' && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        )}
      </button>

      {/* ==================== POPOVERS (الظهور تحت الشريط دائماً في الأعلى) ==================== */}
      {activePopup && (
        <div
          data-text-edit-topbar="true"
          data-toolbar-popover="true"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full right-0 mt-2 w-72 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 fade-in duration-150 text-edit-popover"
          dir="rtl"
        >
          {/* A. POPOVER: ALIGN */}
          {activePopup === 'align' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-xs font-bold text-gray-900">محاذاة النص</span>
                <button type="button" onClick={closePopup} className="text-gray-400 hover:text-gray-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    updateCurrentStyle((s) => ({ ...s, align: 'right' }));
                    closePopup();
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-[11px] transition-all cursor-pointer ${
                    currentStyle.align === 'right' || !currentStyle.align
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                  <span>يمين</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateCurrentStyle((s) => ({ ...s, align: 'center' }));
                    closePopup();
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-[11px] transition-all cursor-pointer ${
                    currentStyle.align === 'center'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                  <span>وسط</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateCurrentStyle((s) => ({ ...s, align: 'left' }));
                    closePopup();
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-[11px] transition-all cursor-pointer ${
                    currentStyle.align === 'left'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>يسار</span>
                </button>
              </div>
            </div>
          )}

          {/* B. POPOVER: COLOR */}
          {activePopup === 'color' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-xs font-bold text-gray-900">لون النص</span>
                <button type="button" onClick={closePopup} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block mb-1">ألوان الهوية:</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {themeColors.map((c, idx) => (
                    <button
                      key={`top-theme-color-${c}-${idx}`}
                      type="button"
                      onClick={() => {
                        updateCurrentStyle((s) => ({ ...s, color: c }));
                      }}
                      className="w-7 h-7 rounded-lg border border-gray-200 shadow-xs hover:scale-110 transition-all flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: c }}
                      title={c}
                    >
                      {currentStyle.color === c && (
                        <Check className={`w-3 h-3 ${c === '#ffffff' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-600 font-semibold">درجة مخصصة:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={currentStyle.color || '#ffffff'}
                    onChange={(e) => {
                      updateCurrentStyle((s) => ({ ...s, color: e.target.value }));
                    }}
                    className="w-7 h-7 rounded cursor-pointer border border-gray-300 p-0"
                  />
                  <span className="text-[9px] font-mono text-gray-500 uppercase">
                    {currentStyle.color || '#FFFFFF'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* B2. POPOVER: BACKGROUND COLOR (تثبيت لون الخلفية المباشر وتنسيقه) */}
          {activePopup === 'backgroundColor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-xs font-bold text-gray-900">لون خلفية النص (تمييز)</span>
                <button type="button" onClick={closePopup} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* زر مسح الخلفية (شفاف) */}
              <button
                type="button"
                onClick={() => {
                  updateCurrentStyle((s) => ({
                    ...s,
                    backgroundColor: undefined,
                    boxStyle: {
                      ...s.boxStyle,
                      hasBackground: false,
                      transparent: true,
                      backgroundColor: undefined,
                    },
                  }));
                }}
                className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  !activeBgColor || activeBgColor === 'transparent'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <span>بدون خلفية (شفاف)</span>
              </button>

              {/* ألوان الهوية والتمييز */}
              <div>
                <span className="text-[10px] text-gray-500 block mb-1">ألوان التمييز والخلفية:</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {[
                    '#fef08a',
                    '#bbf7d0',
                    '#bfdbfe',
                    '#fed7aa',
                    '#fbcfe8',
                    '#ddd6fe',
                    ...themeColors,
                  ].slice(0, 12).map((c, idx) => (
                    <button
                      key={`bg-palette-${c}-${idx}`}
                      type="button"
                      onClick={() => {
                        updateCurrentStyle((s) => ({
                          ...s,
                          backgroundColor: c,
                          boxStyle: {
                            ...s.boxStyle,
                            hasBackground: true,
                            transparent: false,
                            backgroundColor: c,
                            backgroundOpacity: s.boxStyle?.backgroundOpacity !== undefined ? s.boxStyle.backgroundOpacity : 1,
                          },
                        }));
                      }}
                      className="w-7 h-7 rounded-lg border border-gray-200 shadow-xs hover:scale-110 transition-all flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: c }}
                      title={c}
                    >
                      {activeBgColor?.toLowerCase() === c.toLowerCase() && (
                        <Check className={`w-3 h-3 ${c === '#ffffff' || c === '#fef08a' || c === '#bbf7d0' || c === '#bfdbfe' || c === '#fed7aa' || c === '#fbcfe8' || c === '#ddd6fe' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* درجة مخصصة + الشفافية */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600 font-semibold">درجة مخصصة:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={activeBgColor && activeBgColor !== 'transparent' ? activeBgColor : '#fef08a'}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentStyle((s) => ({
                          ...s,
                          backgroundColor: val,
                          boxStyle: {
                            ...s.boxStyle,
                            hasBackground: true,
                            transparent: false,
                            backgroundColor: val,
                            backgroundOpacity: s.boxStyle?.backgroundOpacity !== undefined ? s.boxStyle.backgroundOpacity : 1,
                          },
                        }));
                      }}
                      className="w-7 h-7 rounded cursor-pointer border border-gray-300 p-0"
                    />
                    <span className="text-[9px] font-mono text-gray-500 uppercase">
                      {activeBgColor && activeBgColor !== 'transparent' ? activeBgColor : '#FEF08A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600 font-semibold">درجة الشفافية:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={Math.round((currentStyle.boxStyle?.backgroundOpacity !== undefined ? currentStyle.boxStyle.backgroundOpacity : 1) * 100)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) / 100;
                        updateCurrentStyle((s) => ({
                          ...s,
                          boxStyle: {
                            ...s.boxStyle,
                            hasBackground: true,
                            transparent: false,
                            backgroundColor: s.boxStyle?.backgroundColor || s.backgroundColor || '#fef08a',
                            backgroundOpacity: val,
                          },
                        }));
                      }}
                      className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-[9px] font-mono text-gray-500 w-7 text-left">
                      {Math.round((currentStyle.boxStyle?.backgroundOpacity !== undefined ? currentStyle.boxStyle.backgroundOpacity : 1) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* C2. POPOVER: TEXT OPACITY (شفافية النص) */}
          {activePopup === 'textOpacity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Blend className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-gray-900">شفافية النص</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                    {Math.round((currentStyle.opacity !== undefined ? currentStyle.opacity : 1) * 100)}%
                  </span>
                  <button type="button" onClick={closePopup} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* شريط السحب لدرجة الشفافية */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>درجة الشفافية:</span>
                  <span className="font-semibold text-gray-700">
                    {Math.round((currentStyle.opacity !== undefined ? currentStyle.opacity : 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={Math.round((currentStyle.opacity !== undefined ? currentStyle.opacity : 1) * 100)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) / 100;
                    updateCurrentStyle((s) => ({
                      ...s,
                      opacity: val,
                    }));
                  }}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* أزرار النسب السريعة */}
              <div className="grid grid-cols-5 gap-1 text-[10px] text-center">
                {[
                  { label: '100%', val: 1 },
                  { label: '80%', val: 0.8 },
                  { label: '60%', val: 0.6 },
                  { label: '40%', val: 0.4 },
                  { label: '20%', val: 0.2 },
                ].map((preset) => {
                  const currentPct = Math.round((currentStyle.opacity !== undefined ? currentStyle.opacity : 1) * 100);
                  const isSelected = currentPct === Math.round(preset.val * 100);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        updateCurrentStyle((s) => ({
                          ...s,
                          opacity: preset.val,
                        }));
                      }}
                      className={`py-1 rounded-md border font-medium cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* كارت المعاينة الحية */}
              <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-center">
                <span
                  style={{
                    color: currentStyle.color || '#1f2937',
                    opacity: currentStyle.opacity !== undefined ? currentStyle.opacity : 1,
                    fontFamily: currentStyle.fontFamily || "'Cairo', sans-serif",
                    fontWeight: currentStyle.bold ? 'bold' : 'normal',
                    fontStyle: currentStyle.italic ? 'italic' : 'normal',
                  }}
                  className="text-xs transition-opacity"
                >
                  معاينة درجة وضوح النص
                </span>
              </div>
            </div>
          )}

          {/* C. POPOVER: LINK */}
          {activePopup === 'link' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-xs font-bold text-gray-900">رابط العنصر (Link)</span>
                <button type="button" onClick={closePopup} className="text-gray-400 hover:text-gray-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-0.5 p-0.5 rounded-lg bg-gray-100 text-[9px] text-center font-bold">
                {[
                  { id: 'internal', label: 'صفحاتنا' },
                  { id: 'url', label: 'رابط' },
                  { id: 'whatsapp', label: 'واتس' },
                  { id: 'phone', label: 'هاتف' },
                  { id: 'email', label: 'بريد' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setLinkType(type.id as any)}
                    className={`py-0.5 rounded-md transition-all ${
                      linkType === type.id
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div>
                {linkType === 'internal' && (
                  <select
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-gray-200 text-gray-800 text-[11px] rounded-lg outline-none"
                  >
                    {pages.map((p) => (
                      <option key={p.id} value={`page:${p.id}`}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                )}

                {linkType === 'url' && (
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-gray-200 text-gray-800 text-[11px] rounded-lg outline-none text-left"
                    dir="ltr"
                  />
                )}

                {linkType === 'whatsapp' && (
                  <input
                    type="tel"
                    placeholder="+9639xxxxxxxx"
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-gray-200 text-gray-800 text-[11px] rounded-lg outline-none text-left"
                    dir="ltr"
                  />
                )}

                {linkType === 'phone' && (
                  <input
                    type="tel"
                    placeholder="09xxxxxxxx"
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-gray-200 text-gray-800 text-[11px] rounded-lg outline-none text-left"
                    dir="ltr"
                  />
                )}

                {linkType === 'email' && (
                  <input
                    type="email"
                    placeholder="info@example.com"
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-gray-200 text-gray-800 text-[11px] rounded-lg outline-none text-left"
                    dir="ltr"
                  />
                )}
              </div>

              {currentStyle.link && (
                <div className="pt-1.5 border-t border-gray-100 text-[10px] flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 truncate max-w-[170px]" dir="ltr">
                    {currentStyle.link.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateCurrentStyle((s) => ({ ...s, link: undefined }));
                      setLinkValue('');
                    }}
                    className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    إزالة الرابط
                  </button>
                </div>
              )}
            </div>
          )}

          {/* D. POPOVER: FONT FAMILY */}
          {activePopup === 'fontFamily' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-xs font-bold text-gray-900">شكل ونوع الخط</span>
                <button type="button" onClick={closePopup} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
                {AVAILABLE_FONTS.map((font) => {
                  const isCurrent = (currentStyle.fontFamily || '') === font.family;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => {
                        updateCurrentStyle((s) => ({ ...s, fontFamily: font.family }));
                      }}
                      style={{ fontFamily: font.family }}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-all border text-right cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                          : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{font.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* E. POPOVER: FONT SIZE */}
          {activePopup === 'fontSize' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-xs font-bold text-gray-900">حجم الخط المباشر</span>
                <button type="button" onClick={closePopup} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-0.5">
                {AVAILABLE_FONT_SIZES.map((fs) => {
                  const isCurrent = currentStyle.fontSize === fs.value;
                  return (
                    <button
                      key={fs.value}
                      type="button"
                      onClick={() => {
                        updateCurrentStyle((s) => ({ ...s, fontSize: fs.value }));
                      }}
                      className={`flex items-center justify-between p-1.5 rounded-lg text-[10px] transition-all border text-right cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                          : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{fs.label}</span>
                      {isCurrent && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* F. POPOVER: BOX STYLE (خلفية وحواف وإطار مربع النص) */}
          {activePopup === 'boxStyle' && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-0.5 text-right">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-xs font-bold text-gray-900">تنسيق المربع والحدود</span>
                <button type="button" onClick={closePopup} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1. خلفية المربع */}
              <div className="space-y-2 pb-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-700">خلفية المربع:</span>
                  <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(currentStyle.boxStyle?.hasBackground)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        updateCurrentStyle((s) => ({
                          ...s,
                          backgroundColor: checked ? (s.boxStyle?.backgroundColor || s.backgroundColor || '#ffffff') : undefined,
                          boxStyle: {
                            ...s.boxStyle,
                            hasBackground: checked,
                            transparent: !checked,
                            backgroundColor: checked ? (s.boxStyle?.backgroundColor || s.backgroundColor || '#ffffff') : undefined,
                            backgroundOpacity: s.boxStyle?.backgroundOpacity !== undefined ? s.boxStyle.backgroundOpacity : 1,
                          },
                        }));
                      }}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                    <span>تفعيل الخلفية</span>
                  </label>
                </div>

                {currentStyle.boxStyle?.hasBackground && (
                  <div className="space-y-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-medium text-gray-600">لون خلفية المربع:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentStyle.boxStyle?.backgroundColor || '#ffffff'}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentStyle((s) => ({
                              ...s,
                              backgroundColor: val,
                              boxStyle: {
                                ...s.boxStyle,
                                hasBackground: true,
                                transparent: false,
                                backgroundColor: val,
                              },
                            }));
                          }}
                          className="w-6 h-6 rounded-lg cursor-pointer border border-gray-300 p-0"
                        />
                        <span className="text-[10px] font-mono text-gray-600 uppercase font-semibold">
                          {currentStyle.boxStyle?.backgroundColor || '#ffffff'}
                        </span>
                      </div>
                    </div>

                    {/* تعديل الشفافية للخلفية تحت خلفية المربع */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-200/60">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[9px] font-semibold text-gray-700">شفافية خلفية المربع:</span>
                        <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          {Math.round((currentStyle.boxStyle?.backgroundOpacity !== undefined ? currentStyle.boxStyle.backgroundOpacity : 1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={Math.round((currentStyle.boxStyle?.backgroundOpacity !== undefined ? currentStyle.boxStyle.backgroundOpacity : 1) * 100)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) / 100;
                          updateCurrentStyle((s) => ({
                            ...s,
                            boxStyle: {
                              ...s.boxStyle,
                              hasBackground: true,
                              transparent: false,
                              backgroundOpacity: val,
                            },
                          }));
                        }}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      {/* أزرار النسب السريعة لشفافية الخلفية */}
                      <div className="grid grid-cols-5 gap-1 text-[9px] text-center pt-0.5">
                        {[100, 80, 60, 40, 20].map((pct) => {
                          const currentVal = Math.round((currentStyle.boxStyle?.backgroundOpacity !== undefined ? currentStyle.boxStyle.backgroundOpacity : 1) * 100);
                          const isSelected = currentVal === pct;
                          return (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                updateCurrentStyle((s) => ({
                                  ...s,
                                  boxStyle: {
                                    ...s.boxStyle,
                                    hasBackground: true,
                                    transparent: false,
                                    backgroundOpacity: pct / 100,
                                  },
                                }));
                              }}
                              className={`py-0.5 rounded border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                                  : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-600'
                              }`}
                            >
                              {pct}%
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. الإطار والسمك */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-700">إطار المربع:</span>
                  <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(currentStyle.boxStyle?.hasBorder)}
                      onChange={(e) => {
                        updateCurrentStyle((s) => ({
                          ...s,
                          boxStyle: {
                            ...s.boxStyle,
                            hasBorder: e.target.checked,
                            borderColor: s.boxStyle?.borderColor || '#3b82f6',
                            borderWidth: s.boxStyle?.borderWidth || 1,
                            borderRadius: s.boxStyle?.borderRadius || 8,
                          },
                        }));
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>تفعيل الإطار</span>
                  </label>
                </div>

                {currentStyle.boxStyle?.hasBorder && (
                  <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-100 space-y-1.5 text-[9px]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">لون الإطار:</span>
                      <input
                        type="color"
                        value={currentStyle.boxStyle?.borderColor || '#3b82f6'}
                        onChange={(e) => {
                          updateCurrentStyle((s) => ({
                            ...s,
                            boxStyle: {
                              ...s.boxStyle,
                              borderColor: e.target.value,
                            },
                          }));
                        }}
                        className="w-4 h-4 rounded cursor-pointer border border-gray-300 p-0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">سماكة الإطار:</span>
                      <select
                        value={currentStyle.boxStyle?.borderWidth || 1}
                        onChange={(e) => {
                          updateCurrentStyle((s) => ({
                            ...s,
                            boxStyle: {
                              ...s.boxStyle,
                              borderWidth: parseInt(e.target.value),
                            },
                          }));
                        }}
                        className="bg-white border border-gray-200 rounded p-0.5"
                      >
                        {[1, 2, 3, 4, 6].map((w) => (
                          <option key={w} value={w}>
                            {w}px
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">استدارة الحواف:</span>
                      <select
                        value={currentStyle.boxStyle?.borderRadius || 8}
                        onChange={(e) => {
                          updateCurrentStyle((s) => ({
                            ...s,
                            boxStyle: {
                              ...s.boxStyle,
                              borderRadius: parseInt(e.target.value),
                            },
                          }));
                        }}
                        className="bg-white border border-gray-200 rounded p-0.5"
                      >
                        {[0, 4, 8, 12, 16, 24, 99].map((r) => (
                          <option key={r} value={r}>
                            {r === 0 ? 'حادة' : r === 99 ? 'بيضاوي كامل' : `${r}px`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. الهوامش الداخلية (Padding) */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-gray-700 block">الهامش الداخلي (Padding):</span>
                <div className="grid grid-cols-4 gap-1 text-[9px] text-center">
                  {[
                    { id: 'none', label: 'بدون', padding: '4px 8px' },
                    { id: 'small', label: 'خفيف', padding: '8px 12px' },
                    { id: 'medium', label: 'متوسط', padding: '12px 20px' },
                    { id: 'large', label: 'كبير', padding: '20px 32px' },
                  ].map((p) => {
                    const isSelected =
                      currentStyle.boxStyle?.padding === p.padding ||
                      (!currentStyle.boxStyle?.padding && p.id === 'none');
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          updateCurrentStyle((s) => ({
                            ...s,
                            boxStyle: {
                              ...s.boxStyle,
                              padding: p.padding,
                            },
                          }));
                        }}
                        className={`py-1 rounded-md border font-medium cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. حجم المربع وعرضه */}
              <div className="space-y-1 pt-1.5 border-t border-gray-100">
                <span className="text-[10px] font-semibold text-gray-700 block">حجم عرض المربع:</span>
                <div className="grid grid-cols-4 gap-1 text-[9px] text-center">
                  {[
                    { id: 'auto', label: 'تلقائي', width: undefined, autoFit: true },
                    { id: 'half', label: 'نصف (50%)', width: '50%', autoFit: false },
                    { id: 'threeQuarter', label: 'ثلاثة أرباع', width: '75%', autoFit: false },
                    { id: 'full', label: 'كامل (100%)', width: '100%', autoFit: false },
                  ].map((w) => {
                    const isSelected =
                      (w.id === 'auto' && (currentStyle.boxStyle?.autoFit || !currentStyle.boxStyle?.width)) ||
                      (w.id !== 'auto' && currentStyle.boxStyle?.width === w.width && !currentStyle.boxStyle?.autoFit);
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          updateCurrentStyle((s) => ({
                            ...s,
                            boxStyle: {
                              ...s.boxStyle,
                              autoFit: w.autoFit,
                              width: w.width,
                            },
                          }));
                        }}
                        className={`py-1 rounded-md border font-medium cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* G. POPOVER: LAYERS */}
          {activePopup === 'layers' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>ترتيب الطبقات</span>
                </div>
                <button type="button" onClick={closePopup} className="text-gray-400 hover:text-gray-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {/* 1. فوق */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    performLayerAction('bringToFront');
                  }}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all cursor-pointer text-gray-700"
                  title="فوق الجميع"
                >
                  <LayerTopBlueIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold">فوق</span>
                </button>

                {/* 2. للأعلى */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    performLayerAction('bringForward');
                  }}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all cursor-pointer text-gray-700"
                  title="رفع طبقة"
                >
                  <ArrowUp className="w-4 h-4 text-gray-700" />
                  <span className="text-[10px] font-bold">للأعلى</span>
                </button>

                {/* 3. للأسفل */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    performLayerAction('sendBackward');
                  }}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all cursor-pointer text-gray-700"
                  title="تنزيل طبقة"
                >
                  <ArrowDown className="w-4 h-4 text-gray-700" />
                  <span className="text-[10px] font-bold">للأسفل</span>
                </button>

                {/* 4. في الأسفل */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    performLayerAction('sendToBack');
                  }}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all cursor-pointer text-gray-700"
                  title="أسفل الجميع"
                >
                  <LayerBottomBlueIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold">في الأسفل</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Effects Library Modal for Text */}
      <VisualEffectsModal
        isOpen={isEffectsModalOpen}
        onClose={() => setIsEffectsModalOpen(false)}
        targetType="text"
        targetTitle="النص المحدد"
        currentAnimation={currentStyle.animation}
        onApplyAnimation={(anim) => {
          if (!anim || anim.type === 'none') {
            updateCurrentStyle((s) => {
              const copy = { ...s };
              delete copy.animation;
              return { ...copy, animation: { type: 'none' } };
            });
          } else {
            updateCurrentStyle((s) => ({ ...s, animation: anim }));
          }
        }}
        onRemoveAnimation={() => {
          updateCurrentStyle((s) => {
            const copy = { ...s };
            delete copy.animation;
            return { ...copy, animation: { type: 'none' } };
          });
        }}
      />
    </div>
  );
};
