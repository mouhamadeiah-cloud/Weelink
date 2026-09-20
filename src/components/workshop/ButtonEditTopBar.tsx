import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Type,
  Palette,
  Square,
  Link as LinkIcon,
  Blend,
  Sun,
  Shield,
  Layers,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import { VisualEffectsModal } from './VisualEffectsModal';
import {
  ModularElement,
  PageColorScheme,
  WebPage,
  ImageLightingConfig,
  ImageShadowConfig,
} from '../../types';
import { UnifiedBorderPopover } from './popovers/UnifiedBorderPopover';
import { UnifiedOpacityPopover } from './popovers/UnifiedOpacityPopover';
import { UnifiedLightingPopover } from './popovers/UnifiedLightingPopover';
import { UnifiedShadowPopover } from './popovers/UnifiedShadowPopover';
import { UnifiedLayersPopover } from './popovers/UnifiedLayersPopover';

interface ButtonEditTopBarProps {
  element: ModularElement;
  pages: WebPage[];
  activePageId: string;
  colorScheme: PageColorScheme;
  onUpdateElement: (updated: ModularElement) => void;
  onLayerAction?: (action: 'bringToFront' | 'bringForward' | 'sendBackward' | 'sendToBack') => void;
  onClose?: () => void;
}

type ActivePopoverType =
  | 'label'
  | 'color'
  | 'border'
  | 'link'
  | 'opacity'
  | 'lighting'
  | 'shadow'
  | 'layers'
  | 'icon'
  | null;

export const ButtonEditTopBar: React.FC<ButtonEditTopBarProps> = ({
  element,
  pages,
  activePageId,
  colorScheme,
  onUpdateElement,
  onLayerAction,
  onClose,
}) => {
  const [activePopover, setActivePopover] = useState<ActivePopoverType>(null);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Extracted elements data
  const btnData = element.data || {};
  const btnStyle = btnData.style || {};

  const currentLabel = btnData.label || 'زر';
  const currentBgColor = btnStyle.backgroundColor || colorScheme.primary;
  const currentTextColor = btnStyle.color || '#ffffff';
  const currentBorderStyle = btnStyle.borderStyle || 'solid';
  const currentBorderWidth = btnStyle.borderWidth !== undefined ? btnStyle.borderWidth : 1;
  const currentBorderColor = btnStyle.borderColor || colorScheme.accent;
  const currentBorderRadius = btnStyle.borderRadius !== undefined ? btnStyle.borderRadius : 12;
  const currentOpacity = btnStyle.opacity !== undefined ? btnStyle.opacity : 1;
  const currentFontSize = btnStyle.fontSize ? parseInt(String(btnStyle.fontSize)) : 14;

  // Active States for styles
  const hasActiveLink = !!btnData.link?.value;
  const hasActiveLighting = !!btnData.lighting?.enabled && btnData.lighting?.position !== 'none';
  const hasActiveShadow = !!btnData.shadow?.enabled && btnData.shadow?.direction !== 'none';

  // State values for live inputs inside popovers to feel snappy
  const [liveLabel, setLiveLabel] = useState(currentLabel);
  const [iconEditSearch, setIconEditSearch] = useState('');
  const [linkType, setLinkType] = useState<'internal' | 'url' | 'phone' | 'whatsapp' | 'email'>(
    btnData.link?.type || 'internal'
  );
  const [linkValue, setLinkValue] = useState(btnData.link?.value || '');
  const [openInNewTab, setOpenInNewTab] = useState(btnData.link?.openInNewTab || false);

  // Sync state if element prop changes
  useEffect(() => {
    setLiveLabel(currentLabel);
  }, [currentLabel]);

  useEffect(() => {
    if (btnData.link) {
      setLinkType(btnData.link.type || 'internal');
      setLinkValue(btnData.link.value || '');
      setOpenInNewTab(btnData.link.openInNewTab || false);
    }
  }, [btnData.link]);

  // Click outside listener to close active popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update helper
  const updateButtonStyle = (styleUpdates: Record<string, any>) => {
    onUpdateElement({
      ...element,
      data: {
        ...btnData,
        style: {
          ...btnStyle,
          ...styleUpdates,
        },
      },
    });
  };

  // Link Saver
  const saveLink = (type: string, value: string, newTab: boolean) => {
    onUpdateElement({
      ...element,
      data: {
        ...btnData,
        link: value ? { type, value, openInNewTab: newTab } : null,
      },
    });
  };

  // Shadow Saver
  const updateShadowConfig = (shadowUpdates: Partial<ImageShadowConfig>) => {
    const currentShadow: ImageShadowConfig = btnData.shadow || {
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
        ...btnData,
        shadow: {
          ...currentShadow,
          ...shadowUpdates,
        },
      },
    });
  };

  // Lighting Saver
  const updateLightingConfig = (lightingUpdates: Partial<ImageLightingConfig>) => {
    const currentLighting: ImageLightingConfig = btnData.lighting || {
      enabled: false,
      position: 'none',
      intensity: 0.5,
      color: '#ffffff',
      spread: 60,
    };
    onUpdateElement({
      ...element,
      data: {
        ...btnData,
        lighting: {
          ...currentLighting,
          ...lightingUpdates,
        },
      },
    });
  };

  // Predefined color palette
  const presetColors = [
    colorScheme.primary,
    colorScheme.accent,
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#ffffff',
    '#000000',
  ];

  return (
    <div
      id="button-edit-toolbar"
      ref={popoverRef}
      className="relative z-50 flex items-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/15 shadow-sm text-xs text-white"
    >
      {/* 1. تغيير اسم الزر */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'label' ? null : 'label'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'label'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تغيير اسم الزر"
        >
          <Type className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'label' && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-600" />
                <span>اسم الزر</span>
              </span>
              <button type="button" onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500">نص الزر</label>
                <input
                  type="text"
                  value={liveLabel}
                  onChange={(e) => {
                    setLiveLabel(e.target.value);
                    onUpdateElement({
                      ...element,
                      data: { ...btnData, label: e.target.value },
                    });
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-xl outline-none"
                  placeholder="أدخل نص الزر..."
                />
              </div>

              <div className="space-y-2 pt-2.5 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-gray-500">حجم خط الزر</label>
                  <span className="text-[10px] font-bold text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {currentFontSize}px
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextSize = Math.max(10, currentFontSize - 1);
                      onUpdateElement({
                        ...element,
                        data: {
                          ...btnData,
                          style: {
                            ...btnStyle,
                            fontSize: `${nextSize}px`,
                          },
                        },
                      });
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={currentFontSize}
                    onChange={(e) => {
                      const nextSize = parseInt(e.target.value);
                      onUpdateElement({
                        ...element,
                        data: {
                          ...btnData,
                          style: {
                            ...btnStyle,
                            fontSize: `${nextSize}px`,
                          },
                        },
                      });
                    }}
                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nextSize = Math.min(60, currentFontSize + 1);
                      onUpdateElement({
                        ...element,
                        data: {
                          ...btnData,
                          style: {
                            ...btnStyle,
                            fontSize: `${nextSize}px`,
                          },
                        },
                      });
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* خيارات سريعة للأحجام الشائعة */}
                <div className="flex items-center gap-1 justify-between pt-1">
                  {[12, 14, 16, 18, 22, 28].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        onUpdateElement({
                          ...element,
                          data: {
                            ...btnData,
                            style: {
                              ...btnStyle,
                              fontSize: `${size}px`,
                            },
                          },
                        });
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono transition-all cursor-pointer ${
                        currentFontSize === size
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* قسم المعاينة المباشرة للزر */}
              <div className="pt-2.5 border-t border-gray-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>المعاينة المباشرة للزر</span>
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">
                    {currentFontSize}px
                  </span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-center justify-center min-h-[64px] overflow-hidden">
                  <div
                    style={{
                      backgroundColor: currentBgColor,
                      color: currentTextColor,
                      fontSize: `${currentFontSize}px`,
                      borderRadius: `${currentBorderRadius}px`,
                      borderStyle: currentBorderStyle === 'none' ? 'none' : currentBorderStyle,
                      borderWidth: currentBorderStyle === 'none' ? '0px' : `${currentBorderWidth}px`,
                      borderColor: currentBorderColor,
                      opacity: currentOpacity,
                      padding: '8px 16px',
                      maxWidth: '100%',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    }}
                  >
                    {liveLabel || 'زر'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. اللون ويشمل النص والخلفية */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'color' ? null : 'color'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'color'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="اللون (النص والخلفية)"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'color' && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>تعديل ألوان الزر</span>
              </span>
              <button type="button" onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Background Color Section */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 mb-1.5">لون الخلفية:</div>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {presetColors.map((color, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => updateButtonStyle({ backgroundColor: color })}
                    className={`w-6 h-6 rounded-full border border-gray-200 relative shrink-0 transition-transform hover:scale-110 cursor-pointer ${
                      currentBgColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentBgColor.startsWith('#') && currentBgColor.length === 7 ? currentBgColor : '#3b82f6'}
                  onChange={(e) => updateButtonStyle({ backgroundColor: e.target.value })}
                  className="w-7 h-7 rounded-md border border-gray-200 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-gray-500">{currentBgColor}</span>
              </div>
            </div>

            {/* Text Color Section */}
            <div>
              <div className="text-[10px] font-bold text-gray-500 mb-1.5">لون النص:</div>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {['#ffffff', '#000000', colorScheme.primary, colorScheme.accent, '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#4b5563', '#9ca3af'].map((color, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => updateButtonStyle({ color: color })}
                    className={`w-6 h-6 rounded-full border border-gray-200 relative shrink-0 transition-transform hover:scale-110 cursor-pointer ${
                      currentTextColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentTextColor.startsWith('#') && currentTextColor.length === 7 ? currentTextColor : '#ffffff'}
                  onChange={(e) => updateButtonStyle({ color: e.target.value })}
                  className="w-7 h-7 rounded-md border border-gray-200 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-gray-500">{currentTextColor}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. الاطار والزوايا (الموحد) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'border' ? null : 'border'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'border'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تعديل الإطار والزوايا"
        >
          <Square className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'border' && (
          <UnifiedBorderPopover
            currentBorder={{
              style: currentBorderStyle,
              width: currentBorderWidth,
              color: currentBorderColor,
              radius: currentBorderRadius,
            }}
            onUpdate={(cfg) => {
              updateButtonStyle({
                ...(cfg.style !== undefined ? { borderStyle: cfg.style } : {}),
                ...(cfg.width !== undefined ? { borderWidth: cfg.width } : {}),
                ...(cfg.color !== undefined ? { borderColor: cfg.color } : {}),
                ...(cfg.radius !== undefined ? { borderRadius: cfg.radius } : {}),
              });
            }}
            onClose={() => setActivePopover(null)}
            title="إطار وزوايا الزر"
          />
        )}
      </div>

      {/* 4.5. أيقونة الزر (Button Icon with live Lucide Search) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'icon' ? null : 'icon'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'icon'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : btnData.icon
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تغيير أو إزالة أيقونة الزر"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'icon' && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>أيقونة الزر</span>
              </span>
              <button type="button" onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Search Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500">ابحث عن أيقونة</label>
              <input
                type="text"
                value={iconEditSearch}
                onChange={(e) => setIconEditSearch(e.target.value)}
                placeholder="اسم الأيقونة (مثال: Phone, Star)..."
                className="w-full px-3 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-xl outline-none"
              />
            </div>

            {/* Quick Presets Grid */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500">أيقونات شائعة:</span>
                {btnData.icon && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateElement({
                        ...element,
                        data: {
                          ...btnData,
                          icon: undefined,
                        },
                      });
                    }}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    إزالة الأيقونة ✖
                  </button>
                )}
              </div>
              <div className="grid grid-cols-6 gap-1.5 max-h-[150px] overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-100">
                {(() => {
                  const q = iconEditSearch.toLowerCase().trim();
                  const presets = [
                    'Phone', 'PhoneCall', 'Smartphone', 'MessageCircle', 'MessageSquare', 'Send', 'Mail',
                    'MapPin', 'Map', 'Compass', 'Globe', 'Home', 'Building', 'Star', 'Heart', 'ThumbsUp',
                    'Award', 'Trophy', 'Crown', 'Gift', 'Search', 'Settings', 'Check', 'X', 'AlertTriangle',
                    'Info', 'User', 'Users', 'ShoppingCart', 'ShoppingBag', 'CreditCard', 'Tag', 'DollarSign',
                    'Camera', 'Image', 'Video', 'Play', 'Tv', 'Music', 'Calendar', 'Clock', 'File', 'Link',
                    'Coffee', 'Car', 'Plane', 'Dumbbell', 'Zap', 'Lightbulb', 'Download', 'Upload', 'Save',
                    'Trash2', 'Edit2', 'Smile', 'Bell', 'Plus', 'Minus', 'ChevronRight', 'ChevronLeft'
                  ];

                  const filtered = presets.filter(p => p.toLowerCase().includes(q));

                  return filtered.map((p) => {
                    const IconComp = (LucideIcons as any)[p];
                    if (!IconComp) return null;
                    const isSelected = btnData.icon === p;

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          onUpdateElement({
                            ...element,
                            data: {
                              ...btnData,
                              icon: p,
                            },
                          });
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 border-amber-400 text-white animate-pulse'
                            : 'bg-white border-gray-100 hover:border-amber-400 hover:bg-amber-50/50 text-gray-700'
                        }`}
                        title={p}
                      >
                        <IconComp className="w-4 h-4 shrink-0" />
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Link */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'link' ? null : 'link'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'link'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : hasActiveLink
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title={hasActiveLink ? `مرتبط بـ: ${linkValue}` : 'ربط الزر بصفحة أو رابط خارجي'}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'link' && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-[9999] text-right animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2.5">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-600" />
                <span>رابط الزر (Link)</span>
              </span>
              <button type="button" onClick={() => setActivePopover(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Link Type Selector */}
            <div className="grid grid-cols-5 gap-0.5 p-0.5 rounded-lg bg-gray-100 text-[9px] text-center font-bold mb-3">
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
                  onClick={() => {
                    setLinkType(type.id as any);
                    setLinkValue('');
                    saveLink(type.id, '', openInNewTab);
                  }}
                  className={`py-0.5 rounded-md transition-all cursor-pointer ${
                    linkType === type.id
                      ? 'bg-cyan-600 text-white font-bold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Live inputs based on type */}
            <div className="mb-3">
              {linkType === 'internal' && (
                <select
                  value={linkValue}
                  onChange={(e) => {
                    setLinkValue(e.target.value);
                    saveLink('internal', e.target.value, openInNewTab);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-xl outline-none"
                >
                  <option value="">-- اختر صفحة --</option>
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
                  onChange={(e) => {
                    setLinkValue(e.target.value);
                    saveLink('url', e.target.value, openInNewTab);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-xl outline-none text-left"
                  dir="ltr"
                />
              )}

              {linkType === 'whatsapp' && (
                <input
                  type="tel"
                  placeholder="+9639xxxxxxxx"
                  value={linkValue}
                  onChange={(e) => {
                    setLinkValue(e.target.value);
                    saveLink('whatsapp', e.target.value, openInNewTab);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-xl outline-none text-left"
                  dir="ltr"
                />
              )}

              {linkType === 'phone' && (
                <input
                  type="tel"
                  placeholder="09xxxxxxxx"
                  value={linkValue}
                  onChange={(e) => {
                    setLinkValue(e.target.value);
                    saveLink('phone', e.target.value, openInNewTab);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-xl outline-none text-left"
                  dir="ltr"
                />
              )}

              {linkType === 'email' && (
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={linkValue}
                  onChange={(e) => {
                    setLinkValue(e.target.value);
                    saveLink('email', e.target.value, openInNewTab);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs rounded-xl outline-none text-left"
                  dir="ltr"
                />
              )}
            </div>

            {/* Checkbox to open in new tab for external URLs */}
            {linkType === 'url' && (
              <label className="flex items-center gap-2 text-[10px] text-gray-600 font-bold select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={openInNewTab}
                  onChange={(e) => {
                    setOpenInNewTab(e.target.checked);
                    saveLink(linkType, linkValue, e.target.checked);
                  }}
                  className="rounded border-gray-300 accent-cyan-600"
                />
                <span>فتح الرابط في علامة تبويب جديدة</span>
              </label>
            )}

            {/* Reset button */}
            {linkValue && (
              <button
                type="button"
                onClick={() => {
                  setLinkValue('');
                  saveLink(linkType, '', openInNewTab);
                }}
                className="w-full mt-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                إلغاء ربط الزر
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. الشفافية (الموحد) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'opacity' ? null : 'opacity'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'opacity'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : currentOpacity < 1
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title={`شفافية الزر (${Math.round(currentOpacity * 100)}%)`}
        >
          <Blend className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'opacity' && (
          <UnifiedOpacityPopover
            currentOpacity={currentOpacity}
            onUpdate={(opacity) => updateButtonStyle({ opacity })}
            onClose={() => setActivePopover(null)}
            title="شفافية الزر"
          />
        )}
      </div>

      {/* 6. الإضاءة (الموحد) */}
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
          title="توهج وإضاءة الزر"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        {activePopover === 'lighting' && (
          <UnifiedLightingPopover
            currentLighting={btnData.lighting}
            onUpdate={(cfg) => updateLightingConfig(cfg)}
            onClose={() => setActivePopover(null)}
            title="إضاءة وتوهج الزر"
          />
        )}
      </div>

      {/* 7. الظل (الموحد) */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-button-shadow-btn"
          onClick={() => setActivePopover((prev) => (prev === 'shadow' ? null : 'shadow'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'shadow'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : hasActiveShadow
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="ظل ثلاثي الأبعاد للزر"
        >
          <Shield className="w-3.5 h-3.5 text-purple-300" />
        </button>

        {activePopover === 'shadow' && (
          <UnifiedShadowPopover
            currentShadow={btnData.shadow}
            onUpdate={(cfg) => updateShadowConfig(cfg)}
            onClose={() => setActivePopover(null)}
            title="ظل ثلاثي الأبعاد للزر"
          />
        )}
      </div>

      {/* 8. ترتيب الطبقات للزر (الموحد) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopover((prev) => (prev === 'layers' ? null : 'layers'))}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            activePopover === 'layers'
              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="ترتيب طبقات الزر"
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
            title="ترتيب طبقات الزر"
          />
        )}
      </div>

      {/* 9. Visual Effects & Animations Button */}
      <div className="relative">
        <button
          type="button"
          id="toolbar-btn-effects-btn"
          onClick={() => setIsEffectsModalOpen(true)}
          className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
            element.animation && element.animation.type && element.animation.type !== 'none'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md ring-1 ring-blue-300 font-bold'
              : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
          }`}
          title="تأثيرات بصرية وحركات للزر (مكتبة من 25 حركة)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          {element.animation && element.animation.type && element.animation.type !== 'none' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>
      </div>

      {/* 10. زر إنهاء التعديل (Check / Done) */}
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

      {/* Visual Effects Modal for Button */}
      <VisualEffectsModal
        isOpen={isEffectsModalOpen}
        onClose={() => setIsEffectsModalOpen(false)}
        targetType="button"
        targetTitle={btnData.label || 'الزر المحدد'}
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
