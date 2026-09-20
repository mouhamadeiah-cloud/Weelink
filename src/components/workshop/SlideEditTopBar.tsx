import React, { useState, useRef, useEffect } from 'react';
import {
  Pencil,
  Palette,
  Image as ImageIcon,
  Square,
  LayoutGrid,
  Copy,
  Plus,
  Trash2,
  Check,
  X,
  ChevronDown,
  Sparkles,
  Upload,
  EyeOff,
  Layers,
  Shapes,
  Settings,
  RefreshCw,
  Sliders,
  Sun,
  Activity,
  Maximize2,
  Search,
  Loader2,
  Navigation,
  Shield,
} from 'lucide-react';
import { Slide, SlideType, SlideStyle, SlideCornerShape, PageColorScheme } from '../../types';
import { SLIDE_MENU_ITEMS } from '../../data/slideMenuItems';
import { PRESET_COLOR_SCHEMES, createCustomColorScheme } from '../../data/colorSchemes';
import { UnsplashGalleryModal } from './UnsplashGalleryModal';
import { VisualEffectsModal } from './VisualEffectsModal';
import { UnifiedShadowPopover } from './popovers/UnifiedShadowPopover';
import { UnifiedLightingPopover } from './popovers/UnifiedLightingPopover';
import { UnifiedOpacityPopover } from './popovers/UnifiedOpacityPopover';
import { UnifiedBorderPopover } from './popovers/UnifiedBorderPopover';

interface SlideEditTopBarProps {
  slide: Slide;
  colorScheme: PageColorScheme;
  pageTitle: string;
  canDelete: boolean;
  onUpdateSlideName: (name: string) => void;
  onUpdateSlideStyle: (style: Partial<SlideStyle>) => void;
  onDuplicateSlide: () => void;
  onDeleteSlide: () => void;
  onAddSlideBelow: (type: SlideType) => void;
  onChangeLayout?: () => void;
  onSwitchToPageEdit: () => void;
  onSwitchToNavbarEdit?: () => void;
}

const PRESET_SLIDE_COLORS = [
  { name: 'افتراضي الصفحة', value: 'transparent', isPageBg: true },
  { name: 'كحلي ليلي', value: '#081329' },
  { name: 'أزرق داكن', value: '#0f172a' },
  { name: 'فحمي عميق', value: '#18181b' },
  { name: 'بنفسجي داكن', value: '#1e1b4b' },
  { name: 'رمادي حجري', value: '#1f2937' },
  { name: 'أبيض ناصع', value: '#ffffff' },
  { name: 'أبيض لؤلؤي', value: '#f8fafc' },
  { name: 'عاجي دافئ', value: '#fafaf9' },
  { name: 'أزرق سماوي ناعم', value: '#eff6ff' },
  { name: 'زمردي داكن', value: '#064e3b' },
  { name: 'عنابي داكن', value: '#4c0519' },
];

const BORDER_STYLES: { id: SlideStyle['borderStyle']; label: string }[] = [
  { id: 'none', label: 'بدون إطار' },
  { id: 'solid', label: 'مستمر (Solid)' },
  { id: 'dashed', label: 'متقطع (Dashed)' },
  { id: 'dotted', label: 'منقط (Dotted)' },
  { id: 'double', label: 'مزدوج (Double)' },
  { id: 'groove', label: 'محفور (Groove)' },
  { id: 'ridge', label: 'بارز (Ridge)' },
];

const BORDER_WIDTHS = [0, 1, 2, 3, 4, 6, 8];

const BORDER_RADII = [
  { value: 0, label: '0px (حادة)' },
  { value: 8, label: '8px (خفيف)' },
  { value: 16, label: '16px (متوسط)' },
  { value: 24, label: '24px (كبير)' },
  { value: 36, label: '36px (بيضاوي)' },
  { value: 48, label: '48px (فائق)' },
];

// أشكال حواف الإطار (Corner Shapes)
const CORNER_SHAPES: {
  id: SlideCornerShape;
  label: string;
  sub: string;
  previewClass: string;
  computeRadius: (baseRadius: number) => string;
}[] = [
  {
    id: 'rounded',
    label: 'متناسقة دائرية',
    sub: 'حواف مستديرة بانتظام في جميع الزوايا',
    previewClass: 'rounded-lg',
    computeRadius: (r) => `${r || 16}px`,
  },
  {
    id: 'sharp',
    label: 'حادة ومستقيمة',
    sub: 'زوايا هندسية مستقيمة كلاسيكية (90°)',
    previewClass: 'rounded-none',
    computeRadius: () => '0px',
  },
  {
    id: 'leaf',
    label: 'ورقة شجر قطري',
    sub: 'زاويتان متقابلتان دائريتان والأخريان حادتان',
    previewClass: 'rounded-tr-2xl rounded-bl-2xl rounded-tl-none rounded-br-none',
    computeRadius: (r) => {
      const val = Math.max(r || 24, 20);
      return `0px ${val}px 0px ${val}px`;
    },
  },
  {
    id: 'scoop',
    label: 'طرف علوي مقوس',
    sub: 'الحافة العلوية دائرية بالكامل والسفلية حادة',
    previewClass: 'rounded-t-2xl rounded-b-none',
    computeRadius: (r) => {
      const val = Math.max(r || 24, 24);
      return `${val}px ${val}px 0px 0px`;
    },
  },
  {
    id: 'pill',
    label: 'شكل كبسولة',
    sub: 'استدارة كاملة بيضاوية في الأطراف الجانبية',
    previewClass: 'rounded-full',
    computeRadius: () => '9999px',
  },
  {
    id: 'ticket',
    label: 'قسيمة / بطاقة طرفية',
    sub: 'استدارة طرفية واحدة معتدلة تمنح طابع التذكرة',
    previewClass: 'rounded-tl-2xl rounded-tr-none rounded-br-2xl rounded-bl-none',
    computeRadius: (r) => {
      const val = Math.max(r || 24, 20);
      return `${val}px 0px ${val}px 0px`;
    },
  },
];

export const SlideEditTopBar: React.FC<SlideEditTopBarProps> = ({
  slide,
  colorScheme,
  pageTitle,
  canDelete,
  onUpdateSlideName,
  onUpdateSlideStyle,
  onDuplicateSlide,
  onDeleteSlide,
  onAddSlideBelow,
  onChangeLayout,
  onSwitchToPageEdit,
  onSwitchToNavbarEdit,
}) => {
  // Popovers state
  const [activePopover, setActivePopover] = useState<'mode' | 'color' | 'image' | 'border' | 'add' | 'layout' | null>(null);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const [copiedAnimation, setCopiedAnimation] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(slide.style?.backgroundImage || '');

  const popoverRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [colorTab, setColorTab] = useState<'presets' | 'custom' | 'free'>(
    slide.style?.colorScheme
      ? slide.style.colorScheme.isCustom ? 'custom' : 'presets'
      : slide.style?.gradientColorStart ? 'free' : 'free'
  );

  const [customPrimary, setCustomPrimary] = useState<string>(
    slide.style?.colorScheme?.primary || '#1e3a8a'
  );
  const [customAccent, setCustomAccent] = useState<string>(
    slide.style?.colorScheme?.accent || '#f59e0b'
  );

  const [bgTab, setBgTab] = useState<'color' | 'image'>(
    slide.style?.backgroundImage ? 'image' : 'color'
  );
  const [isSettingsExpanded, setIsSettingsExpanded] = useState<boolean>(false);
  const [imageSubTab, setImageSubTab] = useState<'upload' | 'gallery'>('gallery');
  const [showAdvancedToast, setShowAdvancedToast] = useState<boolean>(false);

  // Unsplash integration states
  const [isUnsplashModalOpen, setIsUnsplashModalOpen] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashPhotos, setUnsplashPhotos] = useState<Array<{ id: string | number; url: string; thumb: string; alt: string; photographer: string }>>([]);
  const [isUnsplashLoading, setIsUnsplashLoading] = useState(false);
  const [unsplashHasKey, setUnsplashHasKey] = useState(true);
  const [selectedUnsplashCategory, setSelectedUnsplashCategory] = useState('الكل');

  const fetchUnsplashPhotos = async (q: string = '') => {
    setIsUnsplashLoading(true);
    try {
      const endpoint = q.trim() && q !== 'الكل'
        ? `/api/unsplash/search?q=${encodeURIComponent(q.trim())}` 
        : '/api/unsplash/curated';
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setUnsplashPhotos(data.photos || []);
        setUnsplashHasKey(data.hasKey ?? true);
      }
    } catch (e) {
      console.error('Failed to fetch Unsplash photos:', e);
    } finally {
      setIsUnsplashLoading(false);
    }
  };

  // Fetch initial curated photos when image tab is opened
  useEffect(() => {
    if (activePopover === 'image' && bgTab === 'image' && imageSubTab === 'gallery' && unsplashPhotos.length === 0) {
      fetchUnsplashPhotos();
    }
  }, [activePopover, bgTab, imageSubTab]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    if (activePopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopover]);

  const slideStyle = slide.style || {};
  const currentBg = slideStyle.transparent ? 'transparent' : slideStyle.backgroundColor || 'transparent';

  const handleDuplicate = () => {
    setCopiedAnimation(true);
    onDuplicateSlide();
    setTimeout(() => setCopiedAnimation(false), 1200);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const img = new Image();
          img.src = reader.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Downscale to max 1280px to save Firestore storage
            const MAX_DIM = 1280;
            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              // Compress to JPEG with 0.72 quality
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.72);
              onUpdateSlideStyle({ backgroundImage: compressedBase64, transparent: false });
              setImageUrlInput('');
              // Keep popover active so user can adjust opacity and attachment controls
            } else {
              // Fallback if canvas context fails
              onUpdateSlideStyle({ backgroundImage: reader.result as string, transparent: false });
              setImageUrlInput('');
              // Keep popover active so user can adjust opacity and attachment controls
            }
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const slideItem = SLIDE_MENU_ITEMS.find((item) => item.type === slide.type);
  const slideTypeName = slideItem ? slideItem.label : 'شريحة';

  return (
    <div
      id="slide-inline-edit-toolbar"
      ref={popoverRef}
      className="relative z-50 flex items-center gap-1 sm:gap-1.5 bg-black/40 p-1 sm:p-1.5 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-xs text-white"
    >
      {/* 1. Switcher Dropdown (تعديل الشريحة <-> تعديل الصفحة) */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-mode-dropdown-btn"
          onClick={() => setActivePopover((prev) => (prev === 'mode' ? null : 'mode'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'mode'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="التبديل بين تعديل الشريحة وتعديل الصفحة"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {/* Mode Switcher Popover (White clean card) */}
        {activePopover === 'mode' && (
          <div
            id="toolbar-mode-switcher-popover"
            className="absolute top-full right-0 mt-2 w-56 bg-white text-gray-900 border border-gray-200 rounded-2xl p-2 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 fade-in duration-150"
          >
            <div className="px-2 py-1.5 border-b border-gray-100 text-[11px] font-bold text-gray-500">
              اختر نطاق شريط الأدوات
            </div>
            <div className="space-y-1 mt-1">
              <button
                type="button"
                onClick={() => setActivePopover(null)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>تعديل الشريحة المحددة</span>
                </div>
                <Check className="w-3.5 h-3.5 text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePopover(null);
                  onSwitchToPageEdit();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 text-gray-700 text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-gray-500" />
                  <span>تعديل الصفحة ({pageTitle || 'الصفحة'})</span>
                </div>
              </button>

              {onSwitchToNavbarEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setActivePopover(null);
                    onSwitchToNavbarEdit();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 text-gray-700 text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <span>تعديل نافبار الموقع</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-3.5 bg-white/10" />

      {/* 2. Slide Name Input (تغيير اسم الشريحة) */}
      <div className="relative flex items-center group" title="اسم الشريحة - انقر للتعديل">
        <input
          type="text"
          id="toolbar-active-slide-name-input"
          value={slide.name || slideTypeName}
          onChange={(e) => onUpdateSlideName(e.target.value)}
          className="w-20 sm:w-28 md:w-32 px-2 py-1 text-xs font-bold text-white bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/15 focus:border-blue-400 rounded-lg outline-none transition-all text-right truncate"
          placeholder="اسم الشريحة..."
        />
        <Pencil className="w-2.5 h-2.5 text-gray-400 absolute left-2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* 3. Color & Transparency Popover (Removed) */}


      {/* 4. Background Customization Popover (تخصيص خلفية الشريحة: اللون، الصورة، التأثيرات، الإضاءة) */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-slide-image-btn"
          onClick={() => setActivePopover((prev) => (prev === 'image' ? null : 'image'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            slideStyle.backgroundImage || (slideStyle.backgroundColor && slideStyle.backgroundColor !== 'transparent')
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : activePopover === 'image'
              ? 'bg-white/20 text-blue-300 border-blue-400/50'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="خلفية الشريحة (ألوان وصور ومؤثرات)"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {/* White Floating Background Popover */}
        {activePopover === 'image' && (
          <div
            id="toolbar-slide-image-popover"
            className="absolute top-full right-0 mt-2 w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 fade-in duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>إعدادات خلفية الشريحة</span>
              </span>
              <button
                type="button"
                onClick={() => setActivePopover(null)}
                className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top Tabs (اللون / اضافة صورة) */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-3 border border-gray-200/40">
              <button
                type="button"
                onClick={() => setBgTab('color')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                  bgTab === 'color'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                اللون
              </button>
              <button
                type="button"
                onClick={() => setBgTab('image')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                  bgTab === 'image'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                اضافة صورة
              </button>
            </div>

            {/* TAB CONTENT: Color */}
            {bgTab === 'color' && (
              <div className="space-y-3">
                {/* Preset Colors Grid */}
                <div>
                  <span className="text-[10px] font-bold text-gray-500 block mb-1.5">ألوان جاهزة:</span>
                  <div className="grid grid-cols-6 gap-1.5 mb-2.5">
                    {PRESET_SLIDE_COLORS.map((col) => {
                      const isSelected = !slideStyle.backgroundImage && !slideStyle.gradientColorStart && slideStyle.backgroundColor === col.value;
                      return (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => {
                            onUpdateSlideStyle({
                              backgroundColor: col.value,
                              transparent: col.value === 'transparent',
                              backgroundImage: undefined,
                              gradientColorStart: undefined,
                            });
                          }}
                          className={`w-8 h-8 rounded-full border transition-all hover:scale-110 cursor-pointer flex items-center justify-center relative shadow-xs ${
                            isSelected ? 'ring-2 ring-blue-500 ring-offset-1 border-transparent' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: col.value === 'transparent' ? '#f3f4f6' : col.value }}
                          title={col.name}
                        >
                          {col.value === 'transparent' && <span className="text-[8px] text-gray-500 font-bold">شفاف</span>}
                          {isSelected && col.value !== 'transparent' && (
                            <Check className={`w-3 h-3 ${col.value === '#ffffff' || col.value === '#f8fafc' || col.value === '#fafaf9' || col.value === '#eff6ff' ? 'text-black' : 'text-white'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Selector */}
                <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-xl border border-gray-100 mb-2.5">
                  <span className="text-[10px] font-bold text-gray-600">لوحة درجات الألوان:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={slideStyle.backgroundColor && slideStyle.backgroundColor !== 'transparent' ? slideStyle.backgroundColor : '#3b82f6'}
                      onChange={(e) => {
                        onUpdateSlideStyle({
                          backgroundColor: e.target.value,
                          transparent: false,
                          backgroundImage: undefined,
                          gradientColorStart: undefined,
                        });
                      }}
                      className="w-5 h-5 rounded cursor-pointer border border-gray-300 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={slideStyle.backgroundColor || ''}
                      placeholder="#FFFFFF"
                      onChange={(e) => {
                        if (e.target.value.startsWith('#') || e.target.value === '') {
                          onUpdateSlideStyle({
                            backgroundColor: e.target.value || undefined,
                            transparent: e.target.value === '',
                            backgroundImage: undefined,
                            gradientColorStart: undefined,
                          });
                        }
                      }}
                      className="w-16 text-center text-[9px] font-mono border border-gray-200 rounded p-0.5 bg-white text-gray-700 uppercase"
                    />
                  </div>
                </div>

                {/* Color Preview Square with small Gear (Settings) & Switch (تبديل) */}
                <div className="border border-gray-100 rounded-xl p-2 bg-gray-50/50 flex flex-col items-center justify-center">
                  <div 
                    className="w-full h-10 rounded-lg border border-gray-200/50 shadow-inner flex items-center justify-center"
                    style={{ 
                      backgroundColor: slideStyle.backgroundColor || 'transparent',
                    }}
                  >
                    {!slideStyle.backgroundColor && (
                      <span className="text-[9px] text-gray-400 font-bold">لا يوجد لون خلفية (شفاف)</span>
                    )}
                  </div>

                  {/* Icon Actions */}
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsSettingsExpanded(prev => !prev)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSettingsExpanded 
                          ? 'bg-blue-50 text-blue-600 border-blue-200' 
                          : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200/80 shadow-xs'
                      }`}
                      title="خيارات إعدادات الخلفية"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        // Cycles random premium solid colors
                        const colors = ['#081329', '#0f172a', '#18181b', '#1e1b4b', '#ffffff', '#eff6ff', '#064e3b', '#4c0519'];
                        const nextColor = colors[Math.floor(Math.random() * colors.length)];
                        onUpdateSlideStyle({
                          backgroundColor: nextColor,
                          transparent: false,
                          backgroundImage: undefined,
                          gradientColorStart: undefined,
                        });
                      }}
                      className="p-1.5 rounded-lg border bg-white hover:bg-gray-50 text-gray-600 border-gray-200/80 shadow-xs transition-all cursor-pointer"
                      title="تبديل لون عشوائي"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Image */}
            {bgTab === 'image' && (
              <div className="space-y-3">
                {/* Photo Presets vs Upload options */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setImageSubTab('gallery');
                      setActivePopover(null);
                      setIsUnsplashModalOpen(true);
                    }}
                    className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      imageSubTab === 'gallery'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>صورة من المعرض</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageSubTab('upload');
                      fileInputRef.current?.click();
                    }}
                    className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      imageSubTab === 'upload'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>صورة من الجهاز</span>
                  </button>
                </div>

                {/* Sub Tab: Gallery Presets & Unsplash Search */}
                {imageSubTab === 'gallery' && (
                  <div className="space-y-2 mb-2.5">
                    {/* Big Open Gallery Card Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setActivePopover(null);
                        setIsUnsplashModalOpen(true);
                      }}
                      className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-[11px] font-bold">تصفح معرض Unsplash الكامل</span>
                      </div>
                      <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-white/30 transition-colors">
                        <Maximize2 className="w-2.5 h-2.5" />
                        <span>شاشة كبيرة</span>
                      </span>
                    </button>

                    {/* Search Bar */}
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={unsplashQuery}
                        onChange={(e) => setUnsplashQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            fetchUnsplashPhotos(unsplashQuery);
                          }
                        }}
                        placeholder="بحث سريع في صور Unsplash..."
                        className="w-full pl-8 pr-3 py-1.5 text-[10px] bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 focus:border-blue-400 rounded-lg outline-none transition-all text-right"
                      />
                      <button
                        type="button"
                        onClick={() => fetchUnsplashPhotos(unsplashQuery)}
                        className="absolute left-1.5 p-1 text-gray-400 hover:text-blue-600 cursor-pointer"
                        title="بحث"
                      >
                        {isUnsplashLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        ) : (
                          <Search className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Category Chips */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-right scrollbar-none">
                      {['الكل', 'طبيعة', 'أعمال', 'فضاء', 'تجريدي', 'رخام', 'تقنية', 'داكن'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedUnsplashCategory(cat);
                            const q = cat === 'الكل' ? '' : cat;
                            setUnsplashQuery(q);
                            fetchUnsplashPhotos(q);
                          }}
                          className={`px-2 py-0.5 text-[9px] rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                            selectedUnsplashCategory === cat
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Photos Grid */}
                    {isUnsplashLoading ? (
                      <div className="h-24 flex flex-col items-center justify-center text-gray-400 gap-1 bg-gray-50 rounded-xl border border-gray-100">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-[9px] font-bold">جاري تحميل صور Unsplash...</span>
                      </div>
                    ) : unsplashPhotos.length > 0 ? (
                      <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                        {unsplashPhotos.map((img) => {
                          const isSelected = slideStyle.backgroundImage === img.url;
                          return (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => {
                                onUpdateSlideStyle({
                                  backgroundImage: img.url,
                                  transparent: false,
                                  backgroundColor: undefined,
                                  gradientColorStart: undefined,
                                });
                              }}
                              className={`h-11 rounded-lg overflow-hidden border relative group transition-all hover:scale-105 cursor-pointer ${
                                isSelected ? 'ring-2 ring-blue-500 border-transparent shadow-xs' : 'border-gray-200'
                              }`}
                              title={`${img.alt} - تصوير: ${img.photographer || 'Unsplash'}`}
                            >
                              <img src={img.thumb || img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-blue-600/35 flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                                </div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[7px] truncate px-0.5 py-0.2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {img.photographer}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-gray-400 text-[10px] bg-gray-50 rounded-xl border border-gray-100">
                        لم يتم العثور على نتائج.
                      </div>
                    )}

                    {/* Attribution footer with expand action */}
                    <div className="flex items-center justify-between text-[8px] text-gray-400 px-0.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActivePopover(null);
                          setIsUnsplashModalOpen(true);
                        }}
                        className="text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-2.5 h-2.5" />
                        <span>فتح المعرض الكبير</span>
                      </button>
                      <span className="font-semibold text-gray-500">Photos by Unsplash</span>
                    </div>
                  </div>
                )}

                {/* File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileUpload}
                />

                {/* Current Image Preview Square with small Gear (Settings) & Switch (تبديل) */}
                <div className="border border-gray-100 rounded-xl p-2 bg-gray-50/50 flex flex-col items-center justify-center">
                  <div className="w-full h-12 rounded-lg border border-gray-200/50 overflow-hidden relative bg-gray-100">
                    {slideStyle.backgroundImage ? (
                      <div className="w-full h-full relative group">
                        <img src={slideStyle.backgroundImage} alt="Background" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSlideStyle({
                              backgroundImage: undefined,
                              backgroundImageOpacity: undefined,
                              backgroundAttachment: undefined
                            });
                            setImageUrlInput('');
                          }}
                          className="absolute z-[20] top-1 left-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded shadow-sm text-xs cursor-pointer transition-colors"
                          title="إزالة صورة الخلفية"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[9px] text-gray-400 font-bold">لا يوجد صورة خلفية</span>
                      </div>
                    )}
                  </div>

                  {/* Icon Actions below Preview Box */}
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsSettingsExpanded(prev => !prev)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSettingsExpanded 
                          ? 'bg-blue-50 text-blue-600 border-blue-200' 
                          : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200/80 shadow-xs'
                      }`}
                      title="خيارات إعدادات الخلفية"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePopover(null);
                        setIsUnsplashModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border bg-white hover:bg-gray-50 text-gray-600 border-gray-200/80 shadow-xs transition-all cursor-pointer"
                      title="تبديل الصورة من معرض Unsplash"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EXPANDED SETTINGS (يتطاول الصندوق إلى أسفل) */}
            {isSettingsExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 text-right animate-in slide-in-from-top-2 duration-200">
                
                {/* 1. Opacity Slider (درجة شفافية الخلفية) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-700">
                    <span>درجة شفافية الخلفية:</span>
                    <span className="font-mono text-blue-600">
                      {Math.round((slideStyle.backgroundImageOpacity !== undefined ? slideStyle.backgroundImageOpacity : 1) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((slideStyle.backgroundImageOpacity !== undefined ? slideStyle.backgroundImageOpacity : 1) * 100)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) / 100;
                      onUpdateSlideStyle({ backgroundImageOpacity: val });
                    }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* 2. Background Lighting (اضافة إضاءة من زوايا مختلفة) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-700 block mb-1">اضافة إضاءة من زوايا مختلفة:</span>
                  <div className="grid grid-cols-5 gap-1 text-center bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                    {[
                      { key: 'none', label: 'بدون' },
                      { key: 'top-left', label: 'أعلى يسار' },
                      { key: 'top-right', label: 'أعلى يمين' },
                      { key: 'center', label: 'مركزية' },
                      { key: 'bottom', label: 'سفلية' }
                    ].map((light) => {
                      const isSelected = (slideStyle.backgroundLightingAngle || 'none') === light.key;
                      return (
                        <button
                          key={light.key}
                          type="button"
                          onClick={() => onUpdateSlideStyle({ backgroundLightingAngle: light.key as any })}
                          className={`py-1 px-0.5 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                          }`}
                        >
                          {light.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Background Effect (اضافة Effekt) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-700 block mb-1">اضافة تأثير فني (Effekt):</span>
                  <div className="grid grid-cols-3 gap-1 text-center bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                    {[
                      { key: 'none', label: 'بدون' },
                      { key: 'blur', label: 'تغبيش' },
                      { key: 'grain', label: 'حبيبي' },
                      { key: 'vintage', label: 'دافئ' },
                      { key: 'glow', label: 'توهج' },
                      { key: 'neon', label: 'نيون' }
                    ].map((eff) => {
                      const isSelected = (slideStyle.backgroundEffect || 'none') === eff.key;
                      return (
                        <button
                          key={eff.key}
                          type="button"
                          onClick={() => onUpdateSlideStyle({ backgroundEffect: eff.key as any })}
                          className={`py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                          }`}
                        >
                          {eff.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Background Attachment (ثبات الخلفية أو تحركها) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-700 block mb-1">حركة الخلفية مع التمرير:</span>
                  <div className="grid grid-cols-2 gap-1 bg-gray-150 p-0.5 rounded-lg text-center border border-gray-200/50">
                    <button
                      type="button"
                      onClick={() => onUpdateSlideStyle({ backgroundAttachment: 'scroll' })}
                      className={`py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                        (slideStyle.backgroundAttachment || 'scroll') === 'scroll'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      تتحرك مع الصفحة
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSlideStyle({ backgroundAttachment: 'fixed' })}
                      className={`py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                        slideStyle.backgroundAttachment === 'fixed'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      ثابتة (تأثير موازي)
                    </button>
                  </div>
                </div>

                {/* 5. Advanced Options (خيارات متقدمة تفتح لوحة التحكم من اليمين) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvancedToast(true);
                    setTimeout(() => setShowAdvancedToast(false), 3000);
                  }}
                  className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>خيارات متقدمة (لوحة التحكم من اليمين)</span>
                </button>

                {showAdvancedToast && (
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white text-[9px] text-center font-bold animate-pulse">
                    جاري فتح لوحة الخلفية المتقدمة الشاملة من اليمين...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Border Controls Popover (التحكم بإطار الشريحة) */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-slide-border-btn"
          onClick={() => setActivePopover((prev) => (prev === 'border' ? null : 'border'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'border' || (slideStyle.borderWidth && slideStyle.borderWidth > 0) || (slideStyle.borderRadius && slideStyle.borderRadius > 0)
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="إطار وزوايا الشريحة"
        >
          <Square className="w-3.5 h-3.5" />
        </button>

        {/* Unified Border Popover */}
        {activePopover === 'border' && (
          <UnifiedBorderPopover
            currentBorder={{
              borderWidth: slideStyle.borderWidth,
              borderColor: slideStyle.borderColor,
              borderRadius: slideStyle.borderRadius,
              borderStyle: slideStyle.borderStyle,
            }}
            onUpdate={(b) => {
              onUpdateSlideStyle({
                borderWidth: b.borderWidth,
                borderColor: b.borderColor,
                borderRadius: b.borderRadius,
                borderStyle: b.borderStyle as any,
              });
            }}
            onClose={() => setActivePopover(null)}
            title="إطار وزوايا الشريحة"
          />
        )}
      </div>

      {/* 6. Opacity Popover (شفافية خلفية الشريحة) */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-slide-opacity-btn"
          onClick={() => setActivePopover((prev) => (prev === 'opacity' ? null : 'opacity'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'opacity' || (slideStyle.backgroundImageOpacity !== undefined && slideStyle.backgroundImageOpacity < 0.99)
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="شفافية خلفية الشريحة"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Unified Opacity Popover */}
        {activePopover === 'opacity' && (
          <UnifiedOpacityPopover
            opacity={slideStyle.backgroundImageOpacity !== undefined ? slideStyle.backgroundImageOpacity : 1}
            onUpdate={(op) => onUpdateSlideStyle({ backgroundImageOpacity: op })}
            onClose={() => setActivePopover(null)}
            title="شفافية خلفية الشريحة"
            subtitle="الشفافية تُطبق على الصورة والخلفية وتبقى عناصر ومحتويات الشريحة واضحة 100%"
          />
        )}
      </div>

      {/* 7. Lighting Popover (إضاءة وتوهج الشريحة) */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-slide-lighting-btn"
          onClick={() => setActivePopover((prev) => (prev === 'lighting' ? null : 'lighting'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'lighting' || (slideStyle.lightingEffect && slideStyle.lightingEffect !== 'none')
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="إضاءة وتوهج الشريحة"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        {/* Unified Lighting Popover */}
        {activePopover === 'lighting' && (
          <UnifiedLightingPopover
            currentLighting={slideStyle.lightingEffect || 'none'}
            onUpdate={(cfg) => {
              onUpdateSlideStyle({ lightingEffect: cfg.enabled ? (cfg.preset || 'glow-amber') : 'none' });
            }}
            onClose={() => setActivePopover(null)}
            title="إضاءة وتوهج الشريحة"
          />
        )}
      </div>

      {/* 8. Shadow Popover (ظلال الشريحة) */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-slide-shadow-btn"
          onClick={() => setActivePopover((prev) => (prev === 'shadow' ? null : 'shadow'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'shadow' || (slideStyle.shadow && slideStyle.shadow !== 'none')
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="ظلال وعمق الشريحة"
        >
          <Shield className="w-3.5 h-3.5" />
        </button>

        {/* Unified Shadow Popover */}
        {activePopover === 'shadow' && (
          <UnifiedShadowPopover
            currentShadow={slideStyle.shadow || 'none'}
            onUpdate={(cfg) => {
              onUpdateSlideStyle({ shadow: cfg.enabled ? (cfg.preset || 'soft') : 'none' });
            }}
            onClose={() => setActivePopover(null)}
            title="ظلال وعمق الشريحة"
          />
        )}
      </div>

      {/* 9. Visual Effects & Animations Button (تأثيرات بصرية للشريحة - مكتبة الـ 25 حركة) */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-slide-effects-btn"
          onClick={() => setIsEffectsModalOpen(true)}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            slideStyle.animation && slideStyle.animation.type && slideStyle.animation.type !== 'none'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md ring-1 ring-blue-300 font-bold'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تأثيرات بصرية وحركات للشريحة (مكتبة من 25 حركة)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {slideStyle.animation && slideStyle.animation.type && slideStyle.animation.type !== 'none' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>
      </div>

      {/* Visual Effects Library Modal for Slide */}
      <VisualEffectsModal
        isOpen={isEffectsModalOpen}
        onClose={() => setIsEffectsModalOpen(false)}
        targetType="slide"
        targetTitle={slide.name || 'الشريحة الحالية'}
        currentAnimation={slideStyle.animation}
        onApplyAnimation={(anim) => {
          if (!anim || anim.type === 'none') {
            onUpdateSlideStyle({ animation: undefined });
          } else {
            onUpdateSlideStyle({ animation: anim });
          }
        }}
        onRemoveAnimation={() => onUpdateSlideStyle({ animation: undefined })}
      />

      {/* Large Unsplash Gallery Modal */}
      <UnsplashGalleryModal
        isOpen={isUnsplashModalOpen}
        onClose={() => setIsUnsplashModalOpen(false)}
        onSelectPhoto={(photoUrl) => {
          onUpdateSlideStyle({
            backgroundImage: photoUrl,
            transparent: false,
            backgroundColor: undefined,
            gradientColorStart: undefined,
          });
        }}
        currentBackgroundUrl={slideStyle.backgroundImage}
      />
    </div>
  );
};
