import React, { useState, useRef, useEffect } from 'react';
import {
  Navigation,
  Layers,
  Square,
  Sparkles,
  Sun,
  Shield,
  Pin,
  PinOff,
  LayoutGrid,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Eye,
  Sliders,
  Maximize2,
  Palette
} from 'lucide-react';
import { NavbarStyle, PageColorScheme } from '../../types';
import { NavbarTemplatesModal, NavbarTemplatePreset } from './NavbarTemplatesModal';
import { UnifiedShadowPopover } from './popovers/UnifiedShadowPopover';
import { UnifiedLightingPopover } from './popovers/UnifiedLightingPopover';
import { UnifiedOpacityPopover } from './popovers/UnifiedOpacityPopover';
import { UnifiedBorderPopover } from './popovers/UnifiedBorderPopover';

interface NavbarEditTopBarProps {
  navbarStyle: NavbarStyle;
  colorScheme: PageColorScheme;
  pageTitle: string;
  onUpdateNavbarStyle: (updates: Partial<NavbarStyle>) => void;
  onSwitchToSlideEdit?: () => void;
  onSwitchToPageEdit?: () => void;
  onClose?: () => void;
}

const PRESET_NAVBAR_COLORS = [
  { name: 'شفاف', value: 'transparent' },
  { name: 'أزرق ليلي', value: '#081329' },
  { name: 'كحلي داكن', value: '#0a192f' },
  { name: 'سليت رمادي', value: '#1e293b' },
  { name: 'فحمي فاخر', value: '#18181b' },
  { name: 'أسود نقي', value: '#030712' },
  { name: 'أزرق كلاسيكي', value: '#1e3a8a' },
  { name: 'بنفسجي ملكي', value: '#2e1065' },
  { name: 'أخضر داكن', value: '#064e3b' },
  { name: 'عنابي داكن', value: '#4c0519' },
  { name: 'أبيض ناصع', value: '#ffffff' },
  { name: 'أوف وايت ناعم', value: '#f8fafc' },
];

const PRESET_BORDER_COLORS = [
  { name: 'أبيض شفاف', value: 'rgba(255, 255, 255, 0.15)' },
  { name: 'أبيض ناصع', value: '#ffffff' },
  { name: 'أزرق سماوي', value: '#38bdf8' },
  { name: 'أزرق ملكي', value: '#3b82f6' },
  { name: 'أرجواني', value: '#a855f7' },
  { name: 'ذهبي عنبري', value: '#f59e0b' },
  { name: 'زمردي', value: '#10b981' },
  { name: 'رمادي داكن', value: 'rgba(255, 255, 255, 0.4)' },
];

const CURATED_NAVBAR_PHOTOS = [
  {
    name: 'تدرج تقني داكن',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'أمواج ليلية',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'سطح رخامي ناعم',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'أفق ضوئي مبهر',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  },
];

export const NavbarEditTopBar: React.FC<NavbarEditTopBarProps> = ({
  navbarStyle,
  colorScheme,
  pageTitle,
  onUpdateNavbarStyle,
  onSwitchToSlideEdit,
  onSwitchToPageEdit,
  onClose,
}) => {
  // Popover State: 'color' | 'border' | 'opacity' | 'lighting' | 'shadow' | null
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [bgTab, setBgTab] = useState<'color' | 'image'>('color');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopover(null);
        setIsModeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        if (result) {
          onUpdateNavbarStyle({
            backgroundImage: result,
            transparent: false,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isSticky = navbarStyle.isSticky !== false; // Default is true (sticky)

  return (
    <div
      ref={popoverRef}
      id="navbar-edit-topbar"
      dir="rtl"
      className="relative z-50 flex items-center gap-1 sm:gap-1.5 bg-black/40 p-1 sm:p-1.5 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-xs text-white animate-in fade-in zoom-in-95 duration-150"
    >
      {/* 1. Mode Switcher Dropdown (تعديل النافبار <-> تعديل الشريحة <-> تعديل الصفحة) */}
      <div className="relative">
        <button
          type="button"
          id="navbar-mode-dropdown-btn"
          onClick={() => setIsModeDropdownOpen((prev) => !prev)}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            isModeDropdownOpen
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تغيير نطاق شريط الأدوات (النافبار / الشريحة / الصفحة)"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>

        {isModeDropdownOpen && (
          <div
            id="navbar-mode-popover"
            className="absolute top-full right-0 mt-2 w-56 bg-white text-gray-900 border border-gray-200 rounded-2xl p-2 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 fade-in duration-150 space-y-1"
          >
            <div className="px-2 py-1 border-b border-gray-100 text-[10px] font-bold text-gray-400">
              اختر نطاق شريط الأدوات
            </div>
            <button
              type="button"
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-blue-700 bg-blue-50 border border-blue-200 font-bold cursor-default"
            >
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>تعديل النافبار (نشط)</span>
              </div>
              <Check className="w-3.5 h-3.5 text-blue-600" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsModeDropdownOpen(false);
                onSwitchToSlideEdit?.();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>تعديل الشريحة</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsModeDropdownOpen(false);
                onSwitchToPageEdit?.();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>تعديل الصفحة</span>
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-white/10 my-auto" />

      {/* ================= 2. أداة اللون والخلفية (Color & Image Popover) ================= */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-navbar-color-btn"
          onClick={() => setActivePopover((prev) => (prev === 'color' ? null : 'color'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'color' || navbarStyle.backgroundImage || (navbarStyle.backgroundColor && navbarStyle.backgroundColor !== 'transparent')
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="اللون وخلفية النافبار"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {/* White Floating Background Popover - Same format as Slide Background "بدون إعدادات" */}
        {activePopover === 'color' && (
          <div
            id="toolbar-navbar-color-popover"
            className="absolute top-full right-0 mt-2 w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>إعدادات خلفية النافبار</span>
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
                  bgTab === 'color' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                اللون
              </button>
              <button
                type="button"
                onClick={() => setBgTab('image')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                  bgTab === 'image' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500 hover:text-gray-800'
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
                    {PRESET_NAVBAR_COLORS.map((col) => {
                      const isSelected = !navbarStyle.backgroundImage && navbarStyle.backgroundColor === col.value;
                      return (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => {
                            onUpdateNavbarStyle({
                              backgroundColor: col.value,
                              transparent: col.value === 'transparent',
                              backgroundImage: undefined,
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
                            <Check className={`w-3 h-3 ${col.value === '#ffffff' || col.value === '#f8fafc' ? 'text-black' : 'text-white'}`} />
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
                      value={navbarStyle.backgroundColor && navbarStyle.backgroundColor !== 'transparent' ? navbarStyle.backgroundColor : '#081329'}
                      onChange={(e) => {
                        onUpdateNavbarStyle({
                          backgroundColor: e.target.value,
                          transparent: false,
                          backgroundImage: undefined,
                        });
                      }}
                      className="w-5 h-5 rounded cursor-pointer border border-gray-300 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={navbarStyle.backgroundColor || ''}
                      placeholder="#081329"
                      onChange={(e) => {
                        if (e.target.value.startsWith('#') || e.target.value === '') {
                          onUpdateNavbarStyle({
                            backgroundColor: e.target.value || undefined,
                            transparent: e.target.value === '',
                            backgroundImage: undefined,
                          });
                        }
                      }}
                      className="w-16 text-center text-[9px] font-mono border border-gray-200 rounded p-0.5 bg-white text-gray-700 uppercase"
                    />
                  </div>
                </div>

                {/* Color Preview Square with Random Cycle */}
                <div className="border border-gray-100 rounded-xl p-2 bg-gray-50/50 flex flex-col items-center justify-center">
                  <div
                    className="w-full h-9 rounded-lg border border-gray-200/50 shadow-inner flex items-center justify-center"
                    style={{
                      backgroundColor: navbarStyle.backgroundColor || 'transparent',
                    }}
                  >
                    {!navbarStyle.backgroundColor && (
                      <span className="text-[9px] text-gray-400 font-bold">لا يوجد لون خلفية (شفاف)</span>
                    )}
                  </div>

                  {/* Random Color Cycle */}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const colors = ['#081329', '#0a192f', '#1e293b', '#18181b', '#030712', '#1e3a8a', '#2e1065', '#064e3b', '#ffffff'];
                        const nextColor = colors[Math.floor(Math.random() * colors.length)];
                        onUpdateNavbarStyle({
                          backgroundColor: nextColor,
                          transparent: false,
                          backgroundImage: undefined,
                        });
                      }}
                      className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                      title="تبديل لون عشوائي"
                    >
                      <RefreshCw className="w-3 h-3 text-blue-600" />
                      <span>لون عشوائي</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Image */}
            {bgTab === 'image' && (
              <div className="space-y-3">
                {/* Image Upload Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة من جهازك</span>
                  </button>
                  {navbarStyle.backgroundImage && (
                    <button
                      type="button"
                      onClick={() => onUpdateNavbarStyle({ backgroundImage: undefined })}
                      className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                      title="إزالة الصورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Ready Photos */}
                <div>
                  <span className="text-[10px] font-bold text-gray-500 block mb-1.5">صور وتدرجات مقترحة:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CURATED_NAVBAR_PHOTOS.map((item) => (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => {
                          onUpdateNavbarStyle({
                            backgroundImage: item.url,
                            transparent: false,
                          });
                        }}
                        className={`relative h-12 rounded-lg overflow-hidden border transition-all cursor-pointer group ${
                          navbarStyle.backgroundImage === item.url ? 'ring-2 ring-blue-600 border-transparent' : 'border-gray-200 hover:opacity-90'
                        }`}
                      >
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] py-0.5 px-1 truncate text-center">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL Input */}
                <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                  <input
                    type="url"
                    placeholder="رابط صورة مباشر..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 text-[10px] bg-white border border-gray-200 rounded px-2 py-1 text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customImageUrl.trim()) {
                        onUpdateNavbarStyle({
                          backgroundImage: customImageUrl.trim(),
                          transparent: false,
                        });
                        setCustomImageUrl('');
                      }
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded cursor-pointer"
                  >
                    تطبيق
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= 3. أيقونة الإطار (Border & Corner Radius) ================= */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-navbar-border-btn"
          onClick={() => setActivePopover((prev) => (prev === 'border' ? null : 'border'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'border' || (navbarStyle.borderWidth && navbarStyle.borderWidth > 0) || (navbarStyle.borderRadius && navbarStyle.borderRadius > 0)
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تعديل الإطار وزوايا الإطار"
        >
          <Square className="w-3.5 h-3.5" />
        </button>

        {/* Unified Border Popover */}
        {activePopover === 'border' && (
          <UnifiedBorderPopover
            currentBorder={{
              borderWidth: navbarStyle.borderWidth,
              borderColor: navbarStyle.borderColor,
              borderRadius: navbarStyle.borderRadius,
              borderStyle: navbarStyle.borderStyle,
            }}
            onUpdate={(b) => {
              onUpdateNavbarStyle({
                borderWidth: b.borderWidth,
                borderColor: b.borderColor,
                borderRadius: b.borderRadius,
                borderStyle: b.borderStyle as any,
              });
            }}
            onClose={() => setActivePopover(null)}
            title="إطار وزوايا النافبار"
          />
        )}
      </div>

      {/* ================= 4. أيقونة الشفافية (Opacity & Blur) ================= */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-navbar-opacity-btn"
          onClick={() => setActivePopover((prev) => (prev === 'opacity' ? null : 'opacity'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'opacity' || (navbarStyle.backgroundOpacity !== undefined && navbarStyle.backgroundOpacity < 0.99)
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="شفافية الخلفية فقط مع وضوح النصوص"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Unified Opacity Popover */}
        {activePopover === 'opacity' && (
          <UnifiedOpacityPopover
            opacity={navbarStyle.backgroundOpacity ?? 0.95}
            onUpdate={(op) => onUpdateNavbarStyle({ backgroundOpacity: op })}
            onClose={() => setActivePopover(null)}
            title="شفافية خلفية النافبار"
            subtitle="تبقى نصوص الروابط والشعار والأزرار واضحة وحادة بنسبة 100%"
          />
        )}
      </div>

      {/* ================= 5. أيقونة الإضاءة (Lighting Effect) ================= */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-navbar-lighting-btn"
          onClick={() => setActivePopover((prev) => (prev === 'lighting' ? null : 'lighting'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'lighting' || (navbarStyle.lightingEffect && navbarStyle.lightingEffect !== 'none')
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="مؤثرات الإضاءة والتوهج"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        {/* Unified Lighting Popover */}
        {activePopover === 'lighting' && (
          <UnifiedLightingPopover
            currentLighting={navbarStyle.lightingEffect || 'none'}
            onUpdate={(cfg) => {
              onUpdateNavbarStyle({ lightingEffect: cfg.enabled ? (cfg.preset as any || 'glow-amber') : 'none' });
            }}
            onClose={() => setActivePopover(null)}
            title="إضاءة وتوهج النافبار"
          />
        )}
      </div>

      {/* ================= 6. أيقونة الظلال (Shadows) ================= */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-navbar-shadow-btn"
          onClick={() => setActivePopover((prev) => (prev === 'shadow' ? null : 'shadow'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'shadow' || (navbarStyle.shadow && navbarStyle.shadow !== 'none')
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تعديل الظلال"
        >
          <Shield className="w-3.5 h-3.5" />
        </button>

        {/* Unified Shadow Popover */}
        {activePopover === 'shadow' && (
          <UnifiedShadowPopover
            currentShadow={navbarStyle.shadow || 'soft'}
            onUpdate={(cfg) => {
              onUpdateNavbarStyle({ shadow: cfg.enabled ? (cfg.preset as any || 'soft') : 'none' });
            }}
            onClose={() => setActivePopover(null)}
            title="ظلال وعمق النافبار"
          />
        )}
      </div>

      {/* ================= 7. أيقونة تثبيت 📌 (Pin / Sticky / Floating) ================= */}
      <button
        type="button"
        id="toolbar-navbar-pin-btn"
        onClick={() => {
          onUpdateNavbarStyle({ isSticky: !isSticky });
        }}
        className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
          isSticky
            ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'
        }`}
        title={isSticky ? 'النافبار مثبت عائم أعلى الصفحة أثناء التمرير (انقر للإلغاء)' : 'النافبار متحرك مع الصفحة (انقر للتثبيت)'}
      >
        {isSticky ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
      </button>

      {/* ================= 8. أيقونة تنسيق (10 Pre-designed Templates Modal) ================= */}
      <button
        type="button"
        id="toolbar-navbar-templates-btn"
        onClick={() => setIsTemplatesModalOpen(true)}
        className="flex items-center justify-center p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg border border-blue-400/50 shadow-md transition-all active:scale-95 cursor-pointer"
        title="تنسيقات نافبار جاهزة (10 نماذج مقترحة)"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>

      {/* Close Toolbar Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-1.5 rounded-lg border border-transparent text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer mr-auto"
          title="إغلاق شريط التعديل"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 10 Layouts Floating White Modal */}
      <NavbarTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        currentVariant={navbarStyle.layoutVariant || 1}
        colorScheme={colorScheme}
        onSelectTemplate={(tmpl: NavbarTemplatePreset) => {
          onUpdateNavbarStyle(tmpl.style);
        }}
      />
    </div>
  );
};
