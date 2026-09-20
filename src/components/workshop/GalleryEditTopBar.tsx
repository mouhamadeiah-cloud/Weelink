import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Images,
  Plus,
  FolderOpen,
  Maximize2,
  Lock,
  Unlock,
  Palette,
  Grid,
  Square,
  Sun,
  Shield,
  Layers,
  X,
  Check,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Sparkles,
  Upload,
  Trash2,
  RefreshCw,
  Settings,
} from 'lucide-react';
import {
  ModularElement,
  PageColorScheme,
  WebPage,
  ImageLightingConfig,
  ImageShadowConfig,
} from '../../types';
import { UnsplashGalleryModal } from './UnsplashGalleryModal';
import {
  UnifiedBorderPopover,
  UnifiedLightingPopover,
  UnifiedShadowPopover,
  UnifiedLayersPopover,
} from './popovers';

interface GalleryEditTopBarProps {
  element: ModularElement;
  pages: WebPage[];
  activePageId: string;
  colorScheme: PageColorScheme;
  onUpdateElement: (updated: ModularElement) => void;
  onLayerAction?: (action: 'bringToFront' | 'bringForward' | 'sendBackward' | 'sendToBack') => void;
  onClose?: () => void;
  onSelectElement?: (elementId: string) => void;
}

type ActivePopoverType =
  | 'images'
  | 'background'
  | 'layout'
  | 'size'
  | 'border'
  | 'lighting'
  | 'shadow'
  | 'layers'
  | null;

export const GalleryEditTopBar: React.FC<GalleryEditTopBarProps> = ({
  element,
  pages,
  activePageId,
  colorScheme,
  onUpdateElement,
  onLayerAction,
  onClose,
  onSelectElement,
}) => {
  const [activePopover, setActivePopover] = useState<ActivePopoverType>(null);
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false);
  const [unsplashTarget, setUnsplashTarget] = useState<'background' | 'add_image'>('add_image');
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPhotoFileInputRef = useRef<HTMLInputElement>(null);

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
            
            // Downscale to max 1280px to save Firestore storage space
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
              updateBackground({ backgroundImage: compressedBase64, bgType: 'image' });
            }
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const galleryData = element.data || {};
  const galleryStyle = galleryData.style || {};

  const currentGalleryImages = Array.isArray(galleryData.images) && galleryData.images.length > 0
    ? galleryData.images
    : [
        { id: 'img-1', url: '', imageUrl: '', isColorPlaceholder: true },
        { id: 'img-2', url: '', imageUrl: '', isColorPlaceholder: true },
        { id: 'img-3', url: '', imageUrl: '', isColorPlaceholder: true },
        { id: 'img-4', url: '', imageUrl: '', isColorPlaceholder: true },
        { id: 'img-5', url: '', imageUrl: '', isColorPlaceholder: true },
      ];

  const handleAddImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.72);
              handleAddPhotoToGallery(compressedBase64);
            }
          };
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleAddPhotoToGallery = (photoUrl: string) => {
    const placeholderIndex = currentGalleryImages.findIndex(
      (item: any) => item.isColorPlaceholder || (!item.url && !item.imageUrl)
    );

    let nextImages: any[];
    if (placeholderIndex !== -1) {
      nextImages = currentGalleryImages.map((img: any, idx: number) => {
        if (idx !== placeholderIndex) return img;
        return {
          ...img,
          url: photoUrl,
          imageUrl: photoUrl,
          isColorPlaceholder: false,
        };
      });
    } else {
      nextImages = [
        ...currentGalleryImages,
        {
          id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          url: photoUrl,
          imageUrl: photoUrl,
          isColorPlaceholder: false,
        },
      ];
    }

    onUpdateElement({
      ...element,
      data: {
        ...galleryData,
        images: nextImages,
      },
    });
  };

  const handleAddNewEmptySlot = () => {
    const nextImages = [
      ...currentGalleryImages,
      {
        id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        url: '',
        imageUrl: '',
        isColorPlaceholder: true,
      },
    ];
    onUpdateElement({
      ...element,
      data: {
        ...galleryData,
        images: nextImages,
      },
    });
  };

  const handleDeleteGalleryImage = (imgId: string) => {
    if (currentGalleryImages.length <= 1) return;
    const nextImages = currentGalleryImages.filter((item: any) => item.id !== imgId);
    onUpdateElement({
      ...element,
      data: {
        ...galleryData,
        images: nextImages,
      },
    });
  };

  const handleToggleLockGalleryImage = (imgId: string) => {
    const nextImages = currentGalleryImages.map((item: any) => {
      if (item.id !== imgId) return item;
      return {
        ...item,
        isLocked: !item.isLocked,
      };
    });
    onUpdateElement({
      ...element,
      data: {
        ...galleryData,
        images: nextImages,
      },
    });
  };

  // Background values
  const bgType = galleryData.bgType || 'color';
  const bgColor = galleryData.backgroundColor || '#1e293b';
  const bgImage = galleryData.backgroundImage || '';
  const bgOpacity = galleryData.backgroundImageOpacity !== undefined ? galleryData.backgroundImageOpacity : 1;

  // Layout value
  const currentLayout = galleryData.layout || 'grid';
  const itemHeight = galleryData.itemHeight !== undefined ? galleryData.itemHeight : 144;
  const imageFit = galleryData.imageFit || 'cover';

  // Border values
  const borderStyle = galleryStyle.borderStyle || 'solid';
  const borderWidth = galleryStyle.borderWidth !== undefined ? galleryStyle.borderWidth : 1;
  const borderColor = galleryStyle.borderColor || colorScheme.accent;
  const borderRadius = galleryStyle.borderRadius !== undefined ? galleryStyle.borderRadius : 24;

  // Status indicators
  const hasActiveLighting = !!galleryData.lighting?.enabled && galleryData.lighting?.position !== 'none';
  const hasActiveShadow = !!galleryData.shadow?.enabled && galleryData.shadow?.direction !== 'none';

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isUnsplashOpen ||
        target?.closest?.('.unsplash-modal') ||
        target?.closest?.('[data-unsplash-modal]') ||
        target?.closest?.('#unsplash-gallery-modal') ||
        target?.closest?.('[data-modal-portal]')
      ) {
        return;
      }
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUnsplashOpen]);

  // Update background state helper
  const updateBackground = (updates: Record<string, any>) => {
    onUpdateElement({
      ...element,
      data: {
        ...galleryData,
        ...updates,
      },
    });
  };

  // Update style state helper
  const updateGalleryStyle = (styleUpdates: Record<string, any>) => {
    onUpdateElement({
      ...element,
      data: {
        ...galleryData,
        style: {
          ...galleryStyle,
          ...styleUpdates,
        },
      },
    });
  };

  // Lighting Saver
  const updateLightingConfig = (lightingUpdates: Partial<ImageLightingConfig>) => {
    const currentLighting: ImageLightingConfig = galleryData.lighting || {
      enabled: false,
      position: 'none',
      intensity: 0.5,
      color: '#ffffff',
      spread: 60,
    };
    onUpdateElement({
      ...element,
      data: {
        ...galleryData,
        lighting: {
          ...currentLighting,
          ...lightingUpdates,
        },
      },
    });
  };

  // Shadow Saver
  const updateShadowConfig = (shadowUpdates: Partial<ImageShadowConfig>) => {
    const currentShadow: ImageShadowConfig = galleryData.shadow || {
      enabled: false,
      direction: 'none',
      blur: 15,
      spread: 0,
      intensity: 0.4,
      color: 'rgba(0, 0, 0, 0.4)',
    };
    onUpdateElement({
      ...element,
      data: {
        ...galleryData,
        shadow: {
          ...currentShadow,
          ...shadowUpdates,
        },
      },
    });
  };

  const presetBgColors = [
    colorScheme.primary,
    colorScheme.accent,
    '#0f172a',
    '#1e293b',
    '#09152b',
    '#1e1b4b',
    '#ffffff',
    '#f8fafc',
  ];

  return (
    <div
      id="gallery-edit-toolbar"
      ref={popoverRef}
      className="relative z-50 flex items-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/15 shadow-sm text-xs text-white"
    >
      {/* 0. صور المعرض (إضافة وإدارة الصور) */}
      <div className="relative">
        <input
          ref={addPhotoFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAddImageFileUpload}
        />
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'images' ? null : 'images'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'images'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="صور المعرض (إضافة وإدارة الصور)"
        >
          <Images className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'images' && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <Images className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-bold text-gray-900">صور المعرض</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {currentGalleryImages.length} صور
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePopover(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions: إضافة صورة من الجهاز أو من Unsplash */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => addPhotoFileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 transition-all cursor-pointer group"
              >
                <FolderOpen className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">من جهازي</span>
                <span className="text-[10px] text-emerald-700/80">رفع ملف صورة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUnsplashTarget('add_image');
                  setIsUnsplashOpen(true);
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-900 transition-all cursor-pointer group"
              >
                <Maximize2 className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">معرض الصور</span>
                <span className="text-[10px] text-blue-700/80">آلاف الصور المجانية</span>
              </button>
            </div>

            {/* زر إضافة خانة فارغة جديدة */}
            <button
              type="button"
              onClick={handleAddNewEmptySlot}
              className="w-full py-1.5 px-3 rounded-xl border border-dashed border-gray-300 hover:border-blue-500 bg-gray-50/60 hover:bg-blue-50/50 text-gray-700 hover:text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة خانة صورة جديدة</span>
            </button>

            {/* قائمة الصور الحالية في المعرض */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <div className="text-[11px] font-bold text-gray-500 flex justify-between items-center">
                <span>الصور الحالية بالمعرض:</span>
                <span className="text-[10px] text-gray-400">انقر للتعديل أو الحذف</span>
              </div>
              {currentGalleryImages.map((img: any, idx: number) => {
                const imgUrl = img.imageUrl || img.url;
                const hasImage = Boolean(imgUrl) && !img.isColorPlaceholder;

                return (
                  <div
                    key={img.id || idx}
                    className="flex items-center justify-between p-1.5 rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-gray-100/80 transition-all"
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1 overflow-hidden"
                      onClick={() => {
                        onSelectElement?.(`${element.id}::sub::${img.id}`);
                        setActivePopover(null);
                      }}
                      title="انقر لتعديل هذه الصورة بالتفصيل"
                    >
                      <div className="w-9 h-7 rounded-lg overflow-hidden border border-gray-200 bg-gray-200 shrink-0 relative">
                        {hasImage ? (
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden text-right">
                        <div className="text-xs font-bold text-gray-800 truncate">
                          صورة {idx + 1}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">
                          {hasImage ? 'صورة مخصصة' : 'عنصر نائب تلقائي'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleLockGalleryImage(img.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          img.isLocked
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 border-gray-200'
                        }`}
                        title={img.isLocked ? 'الصورة مقفلة' : 'قفل الصورة'}
                      >
                        {img.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>

                      <button
                        type="button"
                        disabled={currentGalleryImages.length <= 1}
                        onClick={() => handleDeleteGalleryImage(img.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          currentGalleryImages.length <= 1
                            ? 'opacity-40 cursor-not-allowed text-gray-300 border-gray-100 bg-gray-50'
                            : 'bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border-gray-200 cursor-pointer'
                        }`}
                        title="حذف هذه الصورة من المعرض"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 1. خلفية المعرض (خلفية بلون أو صورة Unsplash مثل الشريحة) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'background' ? null : 'background'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'background'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="خلفية معرض الصور"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'background' && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>تعديل خلفية المعرض</span>
              </span>
              <button type="button" onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Background Type Switcher */}
            <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-gray-100 text-[10px] text-center font-bold">
              <button
                type="button"
                onClick={() => updateBackground({ bgType: 'color' })}
                className={`py-1 rounded-md transition-all cursor-pointer ${
                  bgType === 'color' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                لون مخصص
              </button>
              <button
                type="button"
                onClick={() => updateBackground({ bgType: 'image' })}
                className={`py-1 rounded-md transition-all cursor-pointer ${
                  bgType === 'image' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                صورة خلفية
              </button>
            </div>

            {/* Background Color Content */}
            {bgType === 'color' ? (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 mb-1.5">اختر لوناً:</div>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    <button
                      type="button"
                      onClick={() => updateBackground({ backgroundColor: 'transparent', bgType: 'color' })}
                      className={`w-7 h-7 rounded-lg border border-gray-200 shrink-0 transition-transform hover:scale-110 flex items-center justify-center relative overflow-hidden bg-white cursor-pointer ${
                        bgColor === 'transparent' ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      }`}
                      title="بدون لون"
                    >
                      <span className="text-[9px] text-gray-400 font-bold z-10">بدون</span>
                      <div className="absolute w-[141%] h-[1px] bg-red-500 rotate-45 transform-gpu pointer-events-none" />
                    </button>
                    {presetBgColors.map((color, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => updateBackground({ backgroundColor: color, bgType: 'color' })}
                        className={`w-7 h-7 rounded-lg border border-gray-200 shrink-0 transition-transform hover:scale-110 cursor-pointer ${
                          bgColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor.startsWith('#') && bgColor.length === 7 ? bgColor : '#1e293b'}
                    onChange={(e) => updateBackground({ backgroundColor: e.target.value, bgType: 'color' })}
                    className="w-7 h-7 rounded-md border border-gray-200 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-gray-500">{bgColor}</span>
                </div>
              </div>
            ) : (
              /* Background Image Content */
              <div className="space-y-3 text-right">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileUpload}
                />

                {/* Photo Presets vs Upload options */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUnsplashTarget('background');
                      setIsUnsplashOpen(true);
                    }}
                    className="flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>صورة من المعرض</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 text-[10px] font-bold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3 h-3" />
                    <span>صورة من الجهاز</span>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="أو الصق رابط صورة هنا..."
                  value={bgImage}
                  onChange={(e) => updateBackground({ backgroundImage: e.target.value, bgType: 'image' })}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-xl outline-none text-left"
                  dir="ltr"
                />

                {/* Current Image Preview Square with small Gear (Settings) & Switch (تبديل) */}
                <div className="border border-gray-100 rounded-xl p-2 bg-gray-50/50 flex flex-col items-center justify-center">
                  <div className="w-full h-12 rounded-lg border border-gray-200/50 overflow-hidden relative bg-gray-100">
                    {bgImage ? (
                      <div className="w-full h-full relative group">
                        <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            updateBackground({
                              backgroundImage: '',
                              backgroundImageOpacity: undefined,
                              backgroundAttachment: undefined,
                              bgType: 'color',
                            });
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
                        setUnsplashTarget('background');
                        setIsUnsplashOpen(true);
                      }}
                      className="p-1.5 rounded-lg border bg-white hover:bg-gray-50 text-gray-600 border-gray-200/80 shadow-xs transition-all cursor-pointer"
                      title="تبديل الصورة من معرض Unsplash"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* EXPANDED SETTINGS (يتطاول الصندوق إلى أسفل) */}
                {isSettingsExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 text-right animate-in slide-in-from-top-2 duration-200">
                    
                    {/* 1. Opacity Slider (درجة شفافية الخلفية) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-700">
                        <span>درجة شفافية الخلفية:</span>
                        <span className="font-mono text-blue-600">
                          {Math.round(bgOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={Math.round(bgOpacity * 100)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) / 100;
                          updateBackground({ backgroundImageOpacity: val });
                        }}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    {/* 2. Scroll/Fixed Attachment Selector */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-700 block mb-1">حركة الخلفية مع التمرير:</span>
                      <div className="grid grid-cols-2 gap-1 bg-gray-150 p-0.5 rounded-lg text-center border border-gray-200/50">
                        <button
                          type="button"
                          onClick={() => updateBackground({ backgroundAttachment: 'scroll' })}
                          className={`py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                            (galleryData.backgroundAttachment || 'scroll') === 'scroll'
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          تتحرك مع الصفحة
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBackground({ backgroundAttachment: 'fixed' })}
                          className={`py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                            galleryData.backgroundAttachment === 'fixed'
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          ثابتة (تأثير البارالاكس)
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. تنسيق المعرض (Layout / Format Selector) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'layout' ? null : 'layout'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'layout'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تغيير تنسيق وترتيب الصور"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'layout' && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2.5">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-blue-600" />
                <span>تنسيقات صور المعرض</span>
              </span>
              <button type="button" onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'grid', label: 'شبكة منتظمة (Grid)', desc: 'عرض الصور كشبكة متساوية الأبعاد متناسبة' },
                { id: 'rows', label: 'أفقي متصل (Horizontal Rows)', desc: 'شريط صور ممتد بشكل أفقي منسق' },
                { id: 'masonry', label: 'شلال غير منتظم (Masonry)', desc: 'توزيع فني بارتفاعات متفاوتة وعصرية' },
                { id: 'carousel', label: 'معرض تفاعلي (Interactive Carousel)', desc: 'سلايدر مع أزرار تنقل للصور المتبقية' },
                { id: 'spread', label: 'تخطيط مائل فاخر (Premium Bento)', desc: 'لوحة شبكة متباينة الأوزان والمساحات' },
              ].map((lay) => (
                <button
                  key={lay.id}
                  type="button"
                  onClick={() => {
                    updateBackground({ layout: lay.id });
                    setActivePopover(null);
                  }}
                  className={`w-full text-right p-2 rounded-xl border transition-all cursor-pointer ${
                    currentLayout === lay.id
                      ? 'bg-blue-50 border-blue-400 text-blue-900'
                      : 'border-transparent hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="text-[10px] font-bold">{lay.label}</div>
                  <div className="text-[8px] text-gray-400 mt-0.5">{lay.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2.5. حجم وارتفاع المعرض وملائمة الصور */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'size' ? null : 'size'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'size'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="ارتفاع المعرض وحجم الصور"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'size' && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                <span>ارتفاع صور المعرض والملاءمة</span>
              </span>
              <button type="button" onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Height Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-700">
                <span>الارتفاع الطولي للصور:</span>
                <span className="font-mono text-blue-600">{itemHeight}px</span>
              </div>
              <input
                type="range"
                min="80"
                max="600"
                step="10"
                value={itemHeight}
                onChange={(e) => updateBackground({ itemHeight: parseInt(e.target.value) })}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Object Fit Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-700 block">طريقة ملاءمة الصور (Object Fit):</span>
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-0.5 rounded-lg text-center text-[10px] font-bold">
                {[
                  { id: 'cover', label: 'تعبئة' },
                  { id: 'contain', label: 'احتواء' },
                  { id: 'fill', label: 'تمدد' }
                ].map((fit) => (
                  <button
                    key={fit.id}
                    type="button"
                    onClick={() => updateBackground({ imageFit: fit.id })}
                    className={`py-1 rounded-md transition-all cursor-pointer ${
                      imageFit === fit.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {fit.label}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-gray-400 text-right">
                {imageFit === 'cover' && '• تقوم "التعبئة" بقص الصورة لتملأ المساحة المحددة بالكامل مع الحفاظ على الأبعاد.'}
                {imageFit === 'contain' && '• يقوم "الاحتواء" بإظهار كامل الصورة دون قصها مع ترك هوامش فارغة إذا تطلب الأمر.'}
                {imageFit === 'fill' && '• يقوم "التمدد" بمط الصورة لتملأ العرض والارتفاع المحددين بالكامل دون قص.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. إطار المعرض */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'border' ? null : 'border'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'border'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="إطار وزوايا المعرض"
        >
          <Square className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'border' && (
          <UnifiedBorderPopover
            currentBorder={{
              style: borderStyle,
              width: borderWidth,
              color: borderColor,
              radius: borderRadius,
            }}
            onUpdate={(cfg) => {
              updateGalleryStyle({
                ...(cfg.style !== undefined ? { borderStyle: cfg.style } : {}),
                ...(cfg.width !== undefined ? { borderWidth: cfg.width } : {}),
                ...(cfg.color !== undefined ? { borderColor: cfg.color } : {}),
                ...(cfg.radius !== undefined ? { borderRadius: cfg.radius } : {}),
              });
            }}
            onClose={() => setActivePopover(null)}
            title="تعديل إطار وحواف المعرض"
          />
        )}
      </div>

      {/* 4. أيقونة الإضاءة */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'lighting' ? null : 'lighting'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'lighting'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : hasActiveLighting
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="وهج وإضاءة المعرض"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'lighting' && (
          <UnifiedLightingPopover
            currentLighting={galleryData.lighting}
            onUpdate={(cfg) => updateLightingConfig(cfg)}
            onClose={() => setActivePopover(null)}
            title="إضاءة وتوهج المعرض"
          />
        )}
      </div>

      {/* 5. أيقونة الظل */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-gallery-shadow-btn"
          onClick={() => setActivePopover((prev) => (prev === 'shadow' ? null : 'shadow'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'shadow'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : hasActiveShadow
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="العمق والظل ثلاثي الأبعاد"
        >
          <Shield className="w-3.5 h-3.5 text-purple-300" />
        </button>

        {activePopover === 'shadow' && (
          <UnifiedShadowPopover
            currentShadow={galleryData.shadow}
            onUpdate={(cfg) => updateShadowConfig(cfg)}
            onClose={() => setActivePopover(null)}
            title="إعدادات ظل المعرض"
          />
        )}
      </div>

      {/* 6. ترتيب طبقات المعرض */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'layers' ? null : 'layers'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'layers'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="ترتيب طبقات المعرض"
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
            title="ترتيب طبقات المعرض"
          />
        )}
      </div>

      {/* 9. زر إنهاء التعديل */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-sm cursor-pointer ml-0.5"
          title="إنهاء التعديل"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Unsplash Modal Portal */}
      {isUnsplashOpen && (
        <UnsplashGalleryModal
          isOpen={isUnsplashOpen}
          onClose={() => setIsUnsplashOpen(false)}
          onSelectPhoto={(photoUrl) => {
            if (unsplashTarget === 'add_image') {
              handleAddPhotoToGallery(photoUrl);
            } else {
              updateBackground({
                backgroundImage: photoUrl,
                bgType: 'image',
              });
            }
            setIsUnsplashOpen(false);
          }}
          currentBackgroundUrl={unsplashTarget === 'background' ? bgImage : undefined}
        />
      )}
    </div>
  );
};
