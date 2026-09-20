import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Layers,
  Link as LinkIcon,
  Sun,
  Wand2,
  Shield,
  X,
  Check,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Sliders,
  Maximize2,
  FolderOpen,
  Search,
  Loader2,
  RotateCcw,
  Square,
  Blend,
} from 'lucide-react';
import {
  ModularElement,
  PageColorScheme,
  WebPage,
  ImageElementData,
  ImageLightingPosition,
  ImageEffectType,
  ImageShadowDirection,
} from '../../types';
import { EFFECTS_LIST } from '../../utils/imageElementUtils';
import { UnsplashGalleryModal } from './UnsplashGalleryModal';
import { VisualEffectsModal } from './VisualEffectsModal';
import { UnifiedShadowPopover } from './popovers/UnifiedShadowPopover';
import { UnifiedLightingPopover } from './popovers/UnifiedLightingPopover';
import { UnifiedOpacityPopover } from './popovers/UnifiedOpacityPopover';
import { UnifiedBorderPopover } from './popovers/UnifiedBorderPopover';
import { UnifiedLayersPopover } from './popovers/UnifiedLayersPopover';

interface ImageEditTopBarProps {
  element: ModularElement;
  pages: WebPage[];
  activePageId: string;
  colorScheme: PageColorScheme;
  onUpdateElement: (updated: ModularElement) => void;
  onDeleteElement?: () => void;
  onDuplicateElement?: () => void;
  onLayerAction?: (action: 'bringToFront' | 'bringForward' | 'sendBackward' | 'sendToBack') => void;
  onClose: () => void;
  onSwitchToSlideEdit?: () => void;
  onSwitchToPageEdit?: () => void;
}

type ActivePopoverType = 'upload' | 'opacity' | 'border' | 'link' | 'lighting' | 'effect' | 'shadow' | 'layers' | null;

export const ImageEditTopBar: React.FC<ImageEditTopBarProps> = ({
  element,
  pages,
  activePageId,
  colorScheme,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onLayerAction,
  onClose,
  onSwitchToSlideEdit,
  onSwitchToPageEdit,
}) => {
  const [activePopover, setActivePopover] = useState<ActivePopoverType>(null);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unsplash gallery modal
  const [isUnsplashModalOpen, setIsUnsplashModalOpen] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashPhotos, setUnsplashPhotos] = useState<Array<{ id: string | number; url: string; thumb: string; alt: string; photographer: string }>>([]);
  const [isUnsplashLoading, setIsUnsplashLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // Direct image URL input
  const [directUrlInput, setDirectUrlInput] = useState('');

  // Link state
  const imgData: ImageElementData = (element.data || {}) as ImageElementData;
  const currentLink = imgData.link;
  const [linkType, setLinkType] = useState<'internal' | 'url' | 'whatsapp' | 'phone' | 'email'>(
    currentLink?.type || 'internal'
  );
  const [linkValue, setLinkValue] = useState<string>(
    currentLink?.value || (pages[0] ? `page:${pages[0].id}` : '')
  );
  const [linkNewTab, setLinkNewTab] = useState<boolean>(currentLink?.openInNewTab ?? true);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isUnsplashModalOpen ||
        target?.closest?.('.unsplash-modal') ||
        target?.closest?.('[data-unsplash-modal]') ||
        target?.closest?.('#unsplash-gallery-modal') ||
        target?.closest?.('[data-modal-portal]')
      ) {
        return;
      }
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
  }, [activePopover, isUnsplashModalOpen]);

  // Sync link state when element changes
  useEffect(() => {
    if (imgData.link) {
      setLinkType(imgData.link.type);
      setLinkValue(imgData.link.value);
      setLinkNewTab(imgData.link.openInNewTab ?? true);
    } else {
      setLinkType('internal');
      setLinkValue(pages[0] ? `page:${pages[0].id}` : '');
      setLinkNewTab(true);
    }
  }, [element.id, imgData.link, pages]);

  // Helper to update image data cleanly
  const updateImageData = (updater: (prev: ImageElementData) => Partial<ImageElementData>) => {
    const prev = (element.data || {}) as ImageElementData;
    const partial = updater(prev);
    const nextData: ImageElementData = {
      ...prev,
      ...partial,
    };
    onUpdateElement({
      ...element,
      data: nextData,
    });
  };

  // 1. Image upload handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.src = result;
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.76);
          updateImageData(() => ({
            imageUrl: compressed,
            isColorPlaceholder: false,
          }));
        } else {
          updateImageData(() => ({
            imageUrl: result,
            isColorPlaceholder: false,
          }));
        }
      };
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Fetch Unsplash photos
  const fetchUnsplashPhotos = async (q: string = '') => {
    setIsUnsplashLoading(true);
    try {
      const endpoint =
        q.trim() && q !== 'الكل'
          ? `/api/unsplash/search?q=${encodeURIComponent(q.trim())}`
          : '/api/unsplash/curated';
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setUnsplashPhotos(data.photos || []);
      }
    } catch (e) {
      console.warn('Failed to fetch Unsplash photos:', e);
    } finally {
      setIsUnsplashLoading(false);
    }
  };

  // Fetch initial curated photos when upload popover opens
  useEffect(() => {
    if (activePopover === 'upload' && unsplashPhotos.length === 0) {
      fetchUnsplashPhotos();
    }
  }, [activePopover]);

  // Current values
  const currentOpacity = imgData.opacity !== undefined ? imgData.opacity : 1;
  const currentLighting = imgData.lighting || {
    enabled: false,
    position: 'center',
    intensity: 0.7,
    color: '#ffffff',
    spread: 60,
  };
  const currentEffect = imgData.effect || {
    type: 'none',
    intensity: 0.8,
  };
  const currentShadow = imgData.shadow || {
    enabled: false,
    direction: 'bottom',
    blur: 25,
    spread: 0,
    intensity: 0.6,
  };

  const hasActiveLighting = currentLighting.enabled && currentLighting.position !== 'none';
  const hasActiveEffect = currentEffect.type !== 'none';
  const hasActiveShadow = currentShadow.enabled && currentShadow.direction !== 'none';
  const hasActiveLink = Boolean(currentLink?.value);

  return (
    <div
      id="image-edit-toolbar"
      ref={popoverRef}
      className="relative z-50 flex items-center gap-1 sm:gap-1.5 bg-black/40 p-1 sm:p-1.5 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-xs text-white"
    >
      {/* 1. أداة رفع الصورة (وكالعادة من الجهاز او المعرض) */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-image-upload-btn"
          onClick={() => setActivePopover((prev) => (prev === 'upload' ? null : 'upload'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'upload'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="رفع صورة من الجهاز أو اختيار من المعرض"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'upload' && (
          <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white text-gray-900 border border-gray-200 rounded-2xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>رفع الصورة أو اختيار من المعرض</span>
              </div>
              <button
                type="button"
                onClick={() => setActivePopover(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions: الجهاز أو المعرض */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 transition-all cursor-pointer group"
              >
                <FolderOpen className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">من جهازي</span>
                <span className="text-[10px] text-emerald-700/80">رفع ملف صورة</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUnsplashModalOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-900 transition-all cursor-pointer group"
              >
                <Maximize2 className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">معرض الصور</span>
                <span className="text-[10px] text-blue-700/80">آلاف الصور المجانية</span>
              </button>
            </div>

            {/* Unsplash Quick Search & Picks */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="ابحث في المعرض (طبيعة، أعمال، فضاء...)"
                    value={unsplashQuery}
                    onChange={(e) => setUnsplashQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUnsplashPhotos(unsplashQuery)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none text-right focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="button"
                  onClick={() => fetchUnsplashPhotos(unsplashQuery)}
                  className="px-2.5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs rounded-lg font-bold cursor-pointer transition-colors"
                >
                  بحث
                </button>
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                {['الكل', 'أعمال', 'طبيعة', 'تكنولوجيا', 'فن', 'عمارة'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      fetchUnsplashPhotos(cat === 'الكل' ? '' : cat);
                    }}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Quick Thumbnails */}
              <div className="relative min-h-[90px] max-h-[140px] overflow-y-auto rounded-xl border border-gray-100 p-1 bg-gray-50/50">
                {isUnsplashLoading ? (
                  <div className="flex items-center justify-center py-6 text-gray-400 text-xs gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>جاري تحميل الصور...</span>
                  </div>
                ) : unsplashPhotos.length > 0 ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    {unsplashPhotos.slice(0, 8).map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => {
                          updateImageData(() => ({
                            imageUrl: photo.url,
                            url: photo.url,
                            isColorPlaceholder: false,
                            alt: photo.alt || 'صورة من المعرض',
                          }));
                          setActivePopover(null);
                        }}
                        className="group relative aspect-video rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-500 transition-all cursor-pointer"
                      >
                        <img
                          src={photo.thumb}
                          alt={photo.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-xs">
                    انقر على بحث أو اختر تصنيفاً لعرض الصور
                  </div>
                )}
              </div>
            </div>

            {/* Direct URL Input */}
            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 block">
                أو رابط مباشر للصورة (URL)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={directUrlInput}
                  onChange={(e) => setDirectUrlInput(e.target.value)}
                  className="flex-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none text-left"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (directUrlInput.trim()) {
                      updateImageData(() => ({
                        imageUrl: directUrlInput.trim(),
                        isColorPlaceholder: false,
                      }));
                      setDirectUrlInput('');
                      setActivePopover(null);
                    }
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  تطبيق
                </button>
              </div>
            </div>

            {/* Reset to brand placeholder */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  updateImageData(() => ({
                    imageUrl: undefined,
                    isColorPlaceholder: true,
                  }));
                  setActivePopover(null);
                }}
                className="text-gray-500 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>العودة للمظهر الافتراضي (ألوان الهوية)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. أيقونة الشفافية الموحدة */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-image-opacity-btn"
          onClick={() => setActivePopover((prev) => (prev === 'opacity' ? null : 'opacity'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'opacity'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : currentOpacity < 1
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title={`التحكم بشفافية الصورة (${Math.round(currentOpacity * 100)}%)`}
        >
          <Blend className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'opacity' && (
          <UnifiedOpacityPopover
            opacity={currentOpacity}
            onUpdate={(val) => updateImageData(() => ({ opacity: val }))}
            onClose={() => setActivePopover(null)}
            title="شفافية الصورة"
          />
        )}
      </div>

      {/* 3. الإطار وحواف الصورة الموحدة */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-image-border-btn"
          onClick={() => setActivePopover((prev) => (prev === 'border' ? null : 'border'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'border'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : (imgData.borderWidth && imgData.borderWidth > 0 && imgData.borderStyle !== 'none') || (imgData.borderRadius !== undefined && imgData.borderRadius > 0)
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="إطار وحواف الصورة"
        >
          <Square className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'border' && (
          <UnifiedBorderPopover
            currentBorder={{
              borderWidth: imgData.borderWidth ?? 0,
              borderColor: imgData.borderColor || '#3b82f6',
              borderRadius: imgData.borderRadius ?? 16,
              borderStyle: imgData.borderStyle || 'solid',
            }}
            onUpdate={(cfg) =>
              updateImageData(() => ({
                borderWidth: cfg.borderWidth,
                borderColor: cfg.borderColor,
                borderRadius: cfg.borderRadius,
                borderStyle: cfg.borderStyle,
              }))
            }
            onClose={() => setActivePopover(null)}
            title="إطار وحواف الصورة"
          />
        )}
      </div>

      {/* 4. أيقونة الربط مع link */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-image-link-btn"
          onClick={() => setActivePopover((prev) => (prev === 'link' ? null : 'link'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'link'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : hasActiveLink
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title={hasActiveLink ? `مرتبط بـ: ${linkValue}` : "إضافة رابط ذكي للصورة"}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'link' && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-600" />
                <span>رابط الصورة (Link)</span>
              </span>
              <button
                type="button"
                onClick={() => setActivePopover(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Type selector (صفحاتنا | رابط | واتس | هاتف | بريد) */}
            <div className="grid grid-cols-5 gap-0.5 p-0.5 rounded-lg bg-gray-100 text-[9px] text-center font-bold mb-2.5">
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
                      ? 'bg-cyan-600 text-white font-bold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Inputs based on type */}
            <div className="mb-2.5">
              {linkType === 'internal' && (
                <select
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-lg outline-none"
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
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-lg outline-none text-left"
                  dir="ltr"
                />
              )}

              {linkType === 'whatsapp' && (
                <input
                  type="tel"
                  placeholder="+9639xxxxxxxx"
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-lg outline-none text-left"
                  dir="ltr"
                />
              )}

              {linkType === 'phone' && (
                <input
                  type="tel"
                  placeholder="09xxxxxxxx"
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-lg outline-none text-left"
                  dir="ltr"
                />
              )}

              {linkType === 'email' && (
                <input
                  type="email"
                  placeholder="info@example.com"
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-lg outline-none text-left"
                  dir="ltr"
                />
              )}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between py-1.5 border-t border-gray-100 text-xs">
              <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-[11px]">فتح في نافذة جديدة</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  if (linkValue.trim()) {
                    updateImageData(() => ({
                      link: {
                        type: linkType,
                        value: linkValue.trim(),
                        openInNewTab: linkNewTab,
                      },
                    }));
                    setActivePopover(null);
                  }
                }}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                حفظ
              </button>
            </div>

            {imgData.link && (
              <div className="pt-2 border-t border-gray-100 text-[10px] flex items-center justify-between">
                <span className="text-[10px] text-gray-500 truncate max-w-[170px]" dir="ltr">
                  {imgData.link.value}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    updateImageData(() => ({ link: undefined }));
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
      </div>

      {/* 5. الإضاءة والتوهج الموحدة */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-image-lighting-btn"
          onClick={() => setActivePopover((prev) => (prev === 'lighting' ? null : 'lighting'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'lighting'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : hasActiveLighting
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="إضاءة وتوهج الصورة"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'lighting' && (
          <UnifiedLightingPopover
            currentLighting={currentLighting}
            onUpdate={(cfg) =>
              updateImageData((prev) => ({
                lighting: {
                  ...(prev.lighting || {}),
                  enabled: cfg.enabled,
                  position: cfg.position || 'center',
                  intensity: cfg.intensity ?? 0.7,
                  color: cfg.color || '#ffffff',
                  spread: cfg.spread ?? 60,
                },
              }))
            }
            onClose={() => setActivePopover(null)}
            title="إضاءة وتوهج الصورة"
          />
        )}
      </div>

      {/* 6. تأثيرات وفلاتر الصورة */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-image-effect-btn"
          onClick={() => setActivePopover((prev) => (prev === 'effect' ? null : 'effect'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'effect'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : hasActiveEffect
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تأثيرات وفلاتر الصورة (Effekt)"
        >
          <Wand2 className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'effect' && (
          <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <Wand2 className="w-4 h-4 text-purple-600" />
                <span>تأثيرات الصورة الفنية (Effekt)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateImageData(() => ({
                    effect: { type: 'none', intensity: 1 },
                  }));
                }}
                className="text-[10px] text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                إلغاء التأثير
              </button>
            </div>

            {/* Effects Grid */}
            <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-0.5 mb-3">
              {EFFECTS_LIST.map((eff) => {
                const isSelected = currentEffect.type === eff.id;
                return (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() => {
                      updateImageData((prev) => ({
                        effect: {
                          type: eff.id,
                          intensity: prev.effect?.intensity !== undefined ? prev.effect.intensity : 0.85,
                        },
                      }));
                    }}
                    className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded-md bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 shadow-xs"
                      style={{ filter: eff.previewFilter }}
                    />
                    <span className="text-[10px] leading-tight">{eff.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Effect Intensity slider if active */}
            {hasActiveEffect && (
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-gray-600">شدة التأثير:</span>
                  <span className="font-mono font-bold text-purple-600">
                    {Math.round((currentEffect.intensity || 0.8) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={currentEffect.intensity || 0.8}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateImageData((prev) => ({
                      effect: {
                        ...(prev.effect || { type: 'grayscale' }),
                        intensity: val,
                      },
                    }));
                  }}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. ظل الصورة ثلاثي الأبعاد الموحد */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-image-shadow-btn"
          onClick={() => setActivePopover((prev) => (prev === 'shadow' ? null : 'shadow'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'shadow'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : hasActiveShadow
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="ظل الصورة ثلاثي الأبعاد"
        >
          <Shield className="w-3.5 h-3.5 text-purple-300" />
        </button>

        {activePopover === 'shadow' && (
          <UnifiedShadowPopover
            currentShadow={currentShadow}
            onUpdate={(cfg) =>
              updateImageData((prev) => ({
                shadow: {
                  ...(prev.shadow || {}),
                  enabled: cfg.enabled,
                  direction: cfg.direction || 'bottom',
                  blur: cfg.blur ?? 25,
                  intensity: cfg.intensity ?? 0.6,
                  color: cfg.color || '#000000',
                },
              }))
            }
            onClose={() => setActivePopover(null)}
            title="ظل الصورة ثلاثي الأبعاد"
          />
        )}
      </div>

      {/* 8. ترتيب طبقات الصورة الموحد */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-image-layers-btn"
          onClick={() => setActivePopover((prev) => (prev === 'layers' ? null : 'layers'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'layers'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="ترتيب طبقات الصورة"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'layers' && (
          <UnifiedLayersPopover
            onLayerAction={(action) => {
              if (onLayerAction) onLayerAction(action);
              setActivePopover(null);
            }}
            onClose={() => setActivePopover(null)}
            title="ترتيب طبقات الصورة"
          />
        )}
      </div>

      {/* Visual Effects & Animations Button (تأثيرات بصرية للصورة - مكتبة الـ 25 حركة) */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-image-effects-btn"
          onClick={() => setIsEffectsModalOpen(true)}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            element.animation && element.animation.type && element.animation.type !== 'none'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md ring-1 ring-blue-300 font-bold'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تأثيرات بصرية وحركات للصورة (مكتبة من 25 حركة)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          {element.animation && element.animation.type && element.animation.type !== 'none' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>
      </div>

      {/* Close / Done Button */}
      <button
        type="button"
        onClick={onClose}
        className="flex items-center justify-center p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-sm cursor-pointer ml-0.5"
        title="إنهاء التعديل"
      >
        <Check className="w-3.5 h-3.5" />
      </button>

      {/* Full Unsplash Gallery Modal if opened */}
      <UnsplashGalleryModal
        isOpen={isUnsplashModalOpen}
        onClose={() => setIsUnsplashModalOpen(false)}
        onSelectPhoto={(photoUrl) => {
          updateImageData(() => ({
            imageUrl: photoUrl,
            url: photoUrl,
            isColorPlaceholder: false,
          }));
          setIsUnsplashModalOpen(false);
          setActivePopover(null);
        }}
        currentBackgroundUrl={imgData.imageUrl}
      />

      {/* Visual Effects Modal for Image */}
      <VisualEffectsModal
        isOpen={isEffectsModalOpen}
        onClose={() => setIsEffectsModalOpen(false)}
        targetType="image"
        targetTitle={imgData.alt || 'الصورة المحددة'}
        currentAnimation={element.animation}
        onApplyAnimation={(anim) => {
          if (!anim || anim.type === 'none') {
            const copy = { ...element };
            delete copy.animation;
            onUpdateElement(copy);
          } else {
            onUpdateElement({ ...element, animation: anim });
          }
        }}
        onRemoveAnimation={() => {
          const copy = { ...element };
          delete copy.animation;
          onUpdateElement(copy);
        }}
      />
    </div>
  );
};
