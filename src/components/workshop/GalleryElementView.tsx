import React, { useState } from 'react';
import { Link2Off, ChevronLeft, ChevronRight, ImageIcon, Link as LinkIcon, Trash2, Lock, Unlock } from 'lucide-react';
import { ModularElement } from '../../types';
import { getImageFilterCSS, getImageShadowCSS, getImageLightingStyle } from '../../utils/imageElementUtils';

interface GalleryElementViewProps {
  el: ModularElement;
  primaryColor: string;
  accentColor: string;
  isSelected: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (elementId: string) => void;
  onUpdateElement?: (element: ModularElement) => void;
}

export const GalleryElementView: React.FC<GalleryElementViewProps> = ({
  el,
  primaryColor,
  accentColor,
  isSelected,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
}) => {
  const getGalleryImages = (element: ModularElement) => {
    if (element.data?.images && Array.isArray(element.data.images)) {
      return element.data.images;
    }
    return [
      { id: 'img-1', url: '', isColorPlaceholder: true },
      { id: 'img-2', url: '', isColorPlaceholder: true },
      { id: 'img-3', url: '', isColorPlaceholder: true },
      { id: 'img-4', url: '', isColorPlaceholder: true },
      { id: 'img-5', url: '', isColorPlaceholder: true },
    ];
  };

  const images = getGalleryImages(el);
  const currentLayout = el.data?.layout || 'grid';
  const isUnlinked = !!el.data?.unlinked;
  const itemHeight = el.data?.itemHeight !== undefined ? el.data.itemHeight : 144;
  const imageFit = el.data?.imageFit || 'cover';

  // Dynamic Height calculation: when resized on canvas or set with explicit height,
  // the gallery container and its layouts adapt proportionally!
  const rawElHeight = el.height ?? el.position?.height;
  const numericElHeight = typeof rawElHeight === 'number'
    ? rawElHeight
    : typeof rawElHeight === 'string' && !isNaN(parseFloat(rawElHeight))
    ? parseFloat(rawElHeight)
    : null;

  // Available height for the gallery content area after subtracting p-6 (24px top + 24px bottom = 48px)
  const availableContentHeight = numericElHeight ? Math.max(80, numericElHeight - 48) : null;

  // Safe Carousel state strictly inside its own component block
  const [activeIdx, setActiveIdx] = useState(0);

  const handleToggleLockSubImage = (subImgId: string) => {
    const currentImages = getGalleryImages(el);
    const updatedImages = currentImages.map((img: any) => {
      if (img.id !== subImgId) return img;
      return {
        ...img,
        isLocked: !img.isLocked,
      };
    });
    onUpdateElement?.({
      ...el,
      data: {
        ...el.data,
        images: updatedImages,
      },
    });
  };

  const handleDeleteSubImage = (subImgId: string) => {
    const currentImages = getGalleryImages(el);
    const updatedImages = currentImages.filter((img: any) => img.id !== subImgId);
    onUpdateElement?.({
      ...el,
      data: {
        ...el.data,
        images: updatedImages,
      },
    });
    onSelectElement?.(el.id);
  };

  const containerStyle: React.CSSProperties = {
    borderStyle: el.data?.style?.borderStyle || 'none',
    borderWidth: el.data?.style?.borderStyle !== 'none' ? `${el.data?.style?.borderWidth ?? 1}px` : '0px',
    borderColor: el.data?.style?.borderColor || 'transparent',
    borderRadius: `${el.data?.style?.borderRadius ?? 24}px`,
    backgroundColor: el.data?.backgroundColor || 'transparent',
  };

  let shadowStyle = '';
  if (el.data?.shadow?.enabled && el.data?.shadow?.direction !== 'none') {
    const blur = el.data.shadow.blur ?? 15;
    const intensity = el.data.shadow.intensity ?? 0.4;
    const color = (el.data.shadow.color || 'rgba(0,0,0,VAR_OPACITY)').replace('VAR_OPACITY', String(intensity));
    
    let offsetX = 0;
    let offsetY = 8;
    if (el.data.shadow.direction === 'top') { offsetX = 0; offsetY = -8; }
    else if (el.data.shadow.direction === 'bottom') { offsetX = 0; offsetY = 8; }
    else if (el.data.shadow.direction === 'left') { offsetX = -8; offsetY = 0; }
    else if (el.data.shadow.direction === 'right') { offsetX = 8; offsetY = 0; }
    else if (el.data.shadow.direction === 'center') { offsetX = 0; offsetY = 0; }
    
    shadowStyle = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
  }

  let lightingGlow = '';
  if (el.data?.lighting?.enabled && el.data?.lighting?.position !== 'none') {
    const spread = el.data.lighting.spread ?? 60;
    const intensity = el.data.lighting.intensity ?? 0.5;
    const color = el.data.lighting.color || '#ffffff';
    
    let offsetX = 0;
    let offsetY = -4;
    if (el.data.lighting.position === 'top') { offsetX = 0; offsetY = -12; }
    else if (el.data.lighting.position === 'bottom') { offsetX = 0; offsetY = 12; }
    else if (el.data.lighting.position === 'left') { offsetX = -12; offsetY = 0; }
    else if (el.data.lighting.position === 'right') { offsetX = 12; offsetY = 0; }
    else if (el.data.lighting.position === 'center') { offsetX = 0; offsetY = 0; }
    
    lightingGlow = `${offsetX}px ${offsetY}px ${spread}px ${intensity * 1.5}px ${color}`;
  }

  const combinedBoxShadow = [shadowStyle, lightingGlow].filter(Boolean).join(', ');
  if (combinedBoxShadow) {
    containerStyle.boxShadow = combinedBoxShadow;
  }

  // Reusable card renderer for gallery sub-images
  const renderImageCard = (
    img: any,
    idx: number,
    heightPx: number,
    extraWrapperClasses: string = ''
  ) => {
    const isSubSelected = selectedElementId === `${el.id}::sub::${img.id}`;
    const imgUrl = img.imageUrl || img.url;
    const hasCustomImage = Boolean(imgUrl) && !img.isColorPlaceholder;
    const opacity = img.opacity !== undefined ? img.opacity : 1;
    const filterCSS = getImageFilterCSS(img.effect);
    const shadowCSS = getImageShadowCSS(img.shadow, primaryColor);
    const lightingOverlayStyle = getImageLightingStyle(img.lighting);

    return (
      <div
        key={img.id}
        data-gallery-sub-image="true"
        data-sub-selectable="true"
        onPointerDown={(e) => {
          // Stop propagation so FreeformGridContainer does not mark pointerDown for container
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement?.(`${el.id}::sub::${img.id}`);
        }}
        className={`rounded-2xl overflow-hidden relative cursor-pointer border group/img transition-all hover:scale-102 flex items-center justify-center bg-gray-900/50 ${extraWrapperClasses} ${
          isSubSelected
            ? 'border-blue-500 ring-4 ring-blue-500/40 shadow-xl z-20'
            : 'border-white/10 hover:border-white/20'
        }`}
        style={{
          height: `${heightPx}px`,
          boxShadow: shadowCSS !== 'none' ? shadowCSS : undefined,
        }}
      >
        {hasCustomImage ? (
          <img
            src={imgUrl}
            alt={img.alt || `صورة ${idx + 1}`}
            className="w-full h-full select-none pointer-events-none transition-transform duration-300"
            style={{
              objectFit: imageFit as any,
              opacity: opacity,
              filter: filterCSS !== 'none' ? filterCSS : undefined,
            }}
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-white font-bold select-none p-3 relative overflow-hidden"
            style={{
              background: `linear-gradient(${((idx + 1) * 45)}deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              opacity: opacity,
              filter: filterCSS !== 'none' ? filterCSS : undefined,
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/25 backdrop-blur-sm flex items-center justify-center mb-1 text-white shadow-sm">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold drop-shadow">صورة {idx + 1}</span>
          </div>
        )}

        {/* Lighting overlay if configured */}
        {lightingOverlayStyle && (
          <div
            style={{
              ...lightingOverlayStyle,
              borderRadius: 'inherit',
            }}
          />
        )}

        {/* Link indicator badge */}
        {img.link?.value && (
          <div
            className="absolute bottom-2 left-2 z-10 p-1 rounded-md bg-black/60 text-cyan-400 backdrop-blur-md border border-white/10 opacity-80 group-hover/img:opacity-100 transition-opacity"
            title={`مرتبط برابط: ${img.link.value}`}
          >
            <LinkIcon className="w-2.5 h-2.5" />
          </div>
        )}

        {/* Selection indicator overlay badge */}
        {isSubSelected && (
          <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 rounded-2xl ring-2 ring-blue-500/40 z-30 flex items-start justify-end p-1.5">
            <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
              محددة للتعديل
            </span>
          </div>
        )}

        {/* الأدوات المعلقة على الصورة المحددة: قفل، وحذف */}
        {isSubSelected && (
          <div
            className="absolute top-2 left-2 z-40 flex items-center gap-1 bg-[#08152e] border border-white/20 rounded-lg p-0.5 shadow-lg pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* زر قفل / فك قفل الصورة */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLockSubImage(img.id);
              }}
              className={`p-1 rounded transition-colors cursor-pointer ${
                img.isLocked
                  ? 'text-amber-400 hover:text-amber-300 bg-amber-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title={img.isLocked ? 'الصورة مقفلة (انقر لإلغاء القفل)' : 'قفل الصورة (منع التعديل)'}
            >
              {img.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>

            {/* زر حذف الصورة */}
            <button
              type="button"
              disabled={img.isLocked}
              onClick={(e) => {
                e.stopPropagation();
                if (img.isLocked) return;
                handleDeleteSubImage(img.id);
              }}
              className={`p-1 rounded cursor-pointer ${
                img.isLocked
                  ? 'text-gray-500 opacity-40 cursor-not-allowed'
                  : 'text-rose-400 hover:text-rose-200 hover:bg-rose-500/20'
              }`}
              title={img.isLocked ? 'الصورة مقفلة - قم بإلغاء القفل أولاً للحذف' : 'حذف هذه الصورة'}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelectElement?.(el.id);
      }}
      className="w-full h-full relative group/gallery p-6 min-h-[220px] transition-all flex flex-col justify-center overflow-hidden cursor-pointer"
      style={{
        ...containerStyle,
        height: '100%',
        minHeight: numericElHeight ? `${numericElHeight}px` : '220px',
      }}
    >
      {el.data?.bgType === 'image' && el.data?.backgroundImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${el.data.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: el.data?.backgroundImageOpacity !== undefined ? el.data.backgroundImageOpacity : 1,
            borderRadius: containerStyle.borderRadius,
            zIndex: 0,
          }}
        />
      )}

      {isSelected && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onUpdateElement?.({
              ...el,
              data: {
                ...el.data,
                unlinked: !isUnlinked,
              },
            });
          }}
          className={`absolute top-2 right-2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border shadow-md transition-all cursor-pointer ${
            isUnlinked
              ? 'bg-amber-500 text-white border-amber-400'
              : 'bg-[#09152b] text-gray-200 hover:text-white border-white/20'
          }`}
          title={isUnlinked ? 'ربط عناصر المجموعة' : 'فك الارتباط بين عناصر المجموعة'}
        >
          <Link2Off className="w-3.5 h-3.5" />
          <span>{isUnlinked ? 'مفكك الارتباط' : 'فك الارتباط'}</span>
        </button>
      )}

      <div className="w-full h-full flex-1 relative z-10 flex flex-col justify-center">
        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs font-bold">
            لا توجد صور في المعرض حالياً. يمكنك إضافة صور بالنقر على شريط التعديل.
          </div>
        ) : currentLayout === 'carousel' ? (
          /* Carousel / Slider Layout */
          (() => {
            const safeIdx = activeIdx >= images.length ? 0 : activeIdx;
            const activeImg = images[safeIdx];

            const prevSlide = (e: React.MouseEvent) => {
              e.stopPropagation();
              setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
            };

            const nextSlide = (e: React.MouseEvent) => {
              e.stopPropagation();
              setActiveIdx((prev) => (prev + 1) % images.length);
            };

            const isSubSelected = selectedElementId === `${el.id}::sub::${activeImg.id}`;
            const dynamicCarouselHeight = availableContentHeight
              ? Math.max(120, availableContentHeight - 64)
              : Math.round(itemHeight * 1.8);

            const activeImgUrl = activeImg.imageUrl || activeImg.url;
            const hasActiveCustomImage = Boolean(activeImgUrl) && !activeImg.isColorPlaceholder;
            const activeOpacity = activeImg.opacity !== undefined ? activeImg.opacity : 1;
            const activeFilterCSS = getImageFilterCSS(activeImg.effect);
            const activeShadowCSS = getImageShadowCSS(activeImg.shadow, primaryColor);
            const activeLightingOverlayStyle = getImageLightingStyle(activeImg.lighting);

            return (
              <div className="w-full h-full flex flex-col justify-between space-y-4">
                <div 
                  data-gallery-sub-image="true"
                  data-sub-selectable="true"
                  className={`relative w-full flex-1 rounded-2xl overflow-hidden group/active shadow-md border bg-gray-900/50 flex items-center justify-center cursor-pointer transition-all ${
                    isSubSelected ? 'border-blue-500 ring-4 ring-blue-500/40 shadow-xl' : 'border-white/10'
                  }`}
                  style={{
                    height: `${dynamicCarouselHeight}px`,
                    boxShadow: activeShadowCSS !== 'none' ? activeShadowCSS : undefined,
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectElement?.(`${el.id}::sub::${activeImg.id}`);
                  }}
                >
                  {hasActiveCustomImage ? (
                    <img
                      src={activeImgUrl}
                      alt={activeImg.alt || 'Active Carousel Image'}
                      className="w-full h-full select-none pointer-events-none transition-transform duration-300"
                      style={{
                        objectFit: imageFit as any,
                        opacity: activeOpacity,
                        filter: activeFilterCSS !== 'none' ? activeFilterCSS : undefined,
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center text-white font-bold select-none p-4"
                      style={{
                        background: `linear-gradient(${((safeIdx + 1) * 45)}deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                        opacity: activeOpacity,
                        filter: activeFilterCSS !== 'none' ? activeFilterCSS : undefined,
                      }}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/25 backdrop-blur-sm flex items-center justify-center mb-1 text-white shadow-sm">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-sm drop-shadow">صورة {safeIdx + 1}</span>
                    </div>
                  )}

                  {activeLightingOverlayStyle && (
                    <div
                      style={{
                        ...activeLightingOverlayStyle,
                        borderRadius: 'inherit',
                      }}
                    />
                  )}

                  {activeImg.link?.value && (
                    <div
                      className="absolute bottom-2 left-2 z-10 p-1.5 rounded-md bg-black/60 text-cyan-400 backdrop-blur-md border border-white/10 opacity-80 group-hover/active:opacity-100 transition-opacity"
                      title={`مرتبط برابط: ${activeImg.link.value}`}
                    >
                      <LinkIcon className="w-3 h-3" />
                    </div>
                  )}

                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={prevSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer transition-colors z-20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={nextSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer transition-colors z-20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {isSubSelected && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 rounded-2xl z-20 ring-4 ring-blue-500/30 flex items-start justify-end p-2">
                      <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        محددة للتعديل
                      </span>
                    </div>
                  )}

                  {/* الأدوات المعلقة على الصورة المحددة في الكاروسيل: قفل، وحذف */}
                  {isSubSelected && (
                    <div
                      className="absolute top-2 left-2 z-40 flex items-center gap-1 bg-[#08152e] border border-white/20 rounded-lg p-0.5 shadow-lg pointer-events-auto"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {/* زر قفل / فك قفل الصورة */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLockSubImage(activeImg.id);
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          activeImg.isLocked
                            ? 'text-amber-400 hover:text-amber-300 bg-amber-500/25'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                        title={activeImg.isLocked ? 'الصورة مقفلة (انقر لإلغاء القفل)' : 'قفل الصورة (منع التعديل)'}
                      >
                        {activeImg.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>

                      {/* زر حذف الصورة */}
                      <button
                        type="button"
                        disabled={activeImg.isLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeImg.isLocked) return;
                          handleDeleteSubImage(activeImg.id);
                        }}
                        className={`p-1 rounded cursor-pointer ${
                          activeImg.isLocked
                            ? 'text-gray-500 opacity-40 cursor-not-allowed'
                            : 'text-rose-400 hover:text-rose-200 hover:bg-rose-500/20'
                        }`}
                        title={activeImg.isLocked ? 'الصورة مقفلة - قم بإلغاء القفل أولاً للحذف' : 'حذف هذه الصورة'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-center overflow-x-auto py-1 shrink-0">
                  {images.map((img, idx) => {
                    const isActive = idx === safeIdx;
                    const thumbUrl = img.imageUrl || img.url;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIdx(idx);
                        }}
                        className={`w-12 h-10 rounded-lg border overflow-hidden relative shrink-0 transition-all cursor-pointer ${
                          isActive ? 'border-blue-500 scale-105 ring-2 ring-blue-500/20' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        {thumbUrl && !img.isColorPlaceholder ? (
                          <img src={thumbUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{
                              background: `linear-gradient(${((idx + 1) * 45)}deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()
        ) : currentLayout === 'rows' ? (
          /* Horizontal Rows Layout */
          (() => {
            const dynamicRowsHeight = availableContentHeight || itemHeight;
            return (
              <div className="flex flex-row flex-wrap sm:flex-nowrap gap-4 w-full h-full items-center justify-center">
                {images.map((img, idx) =>
                  renderImageCard(img, idx, dynamicRowsHeight, 'flex-1')
                )}
              </div>
            );
          })()
        ) : currentLayout === 'masonry' ? (
          /* Masonry Layout */
          (() => {
            const baseMasonryHeight = availableContentHeight || itemHeight;
            return (
              <div className="flex gap-4 w-full h-full items-center">
                {images.map((img, idx) => {
                  const heightVal = idx % 3 === 0
                    ? Math.round(baseMasonryHeight * 1.15)
                    : idx % 3 === 1
                    ? Math.round(baseMasonryHeight * 0.88)
                    : Math.round(baseMasonryHeight * 1.0);
                  return renderImageCard(img, idx, heightVal, 'flex-1');
                })}
              </div>
            );
          })()
        ) : currentLayout === 'spread' ? (
          /* Bento / Staggered Spread Grid Layout */
          (() => {
            const bentoRowHeight = availableContentHeight
              ? Math.max(70, Math.round((availableContentHeight - 16) / 2))
              : itemHeight;

            return (
              <div className="grid grid-cols-6 gap-4 w-full h-full">
                {images.map((img, idx) => {
                  let colSpan = 'col-span-2';
                  let baseHeight = bentoRowHeight;
                  if (idx === 0) {
                    colSpan = 'col-span-4';
                    baseHeight = Math.round(bentoRowHeight * 1.08);
                  } else if (idx === 1) {
                    colSpan = 'col-span-2';
                    baseHeight = Math.round(bentoRowHeight * 1.08);
                  } else {
                    colSpan = 'col-span-2';
                    baseHeight = Math.round(bentoRowHeight * 0.92);
                  }
                  return renderImageCard(img, idx, baseHeight, colSpan);
                })}
              </div>
            );
          })()
        ) : (
          /* Regular Grid Layout */
          (() => {
            const isMultiRow = images.length > 5;
            const gridRows = isMultiRow ? 2 : 1;
            const dynamicGridItemHeight = availableContentHeight
              ? Math.max(60, Math.round((availableContentHeight - (gridRows - 1) * 16) / gridRows))
              : itemHeight;

            return (
              <div
                className="grid gap-4 w-full h-full animate-in fade-in duration-200"
                style={{
                  gridTemplateColumns: `repeat(${images.length || 1}, minmax(0, 1fr))`,
                }}
              >
                {images.map((img, idx) =>
                  renderImageCard(img, idx, dynamicGridItemHeight)
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};
