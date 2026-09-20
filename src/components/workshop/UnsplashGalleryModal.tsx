import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  Loader2,
  Check,
  Eye,
  ExternalLink,
  Sparkles,
  Maximize2,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

export interface UnsplashPhoto {
  id: string | number;
  url: string;
  thumb: string;
  full?: string;
  alt: string;
  photographer: string;
  photographerUrl?: string;
  width?: number;
  height?: number;
  color?: string;
}

interface UnsplashGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (photoUrl: string) => void;
  currentBackgroundUrl?: string;
}

const CATEGORIES = [
  'الكل',
  'طبيعة',
  'أعمال',
  'فضاء',
  'تجريدي',
  'رخام',
  'تقنية',
  'داكن',
  'هندسة',
  'بحر',
  'غروب',
  'تدرج',
  'مكتب'
];

export const UnsplashGalleryModal: React.FC<UnsplashGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectPhoto,
  currentBackgroundUrl,
}) => {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPhotos, setTotalPhotos] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasKey, setHasKey] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<UnsplashPhoto | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Trap all pointerdown, mousedown, and click events inside modal so they NEVER bubble to document/canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isOpen) return;

    const stopPropagationCapture = (e: Event) => {
      // Don't stop propagation if the user clicked the outer backdrop to close
      if (e.target === el) {
        return;
      }
      e.stopPropagation();
    };

    el.addEventListener('pointerdown', stopPropagationCapture, true);
    el.addEventListener('mousedown', stopPropagationCapture, true);

    return () => {
      el.removeEventListener('pointerdown', stopPropagationCapture, true);
      el.removeEventListener('mousedown', stopPropagationCapture, true);
    };
  }, [isOpen, mounted]);

  const fetchPhotos = async (searchQuery: string = '', pageNum: number = 1, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setPage(1);
    }

    try {
      const q = searchQuery.trim();
      const endpoint = q && q !== 'الكل'
        ? `/api/unsplash/search?q=${encodeURIComponent(q)}&page=${pageNum}`
        : `/api/unsplash/curated?page=${pageNum}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const incomingPhotos = data.photos || [];
        
        if (append) {
          setPhotos(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newUnique = incomingPhotos.filter((p: UnsplashPhoto) => !existingIds.has(p.id));
            return [...prev, ...newUnique];
          });
        } else {
          setPhotos(incomingPhotos);
        }

        setPage(pageNum);
        setHasKey(data.hasKey ?? true);
        if (data.total) {
          setTotalPhotos(data.total);
        }
        setHasMore(incomingPhotos.length >= 20);
      }
    } catch (err) {
      console.error('Failed to load Unsplash photos:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    fetchPhotos(query, nextPage, true);
  };

  useEffect(() => {
    if (isOpen) {
      fetchPhotos(query);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      ref={containerRef}
      id="unsplash-gallery-modal"
      data-unsplash-modal="true"
      data-modal-portal="true"
      className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden unsplash-modal"
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
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-5xl h-[84vh] max-h-[680px] min-h-[440px] bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden text-right animate-in zoom-in-95 duration-200 my-auto unsplash-modal"
      >
        
        {/* Modal Header - Fixed Top */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-gray-900">معرض صور Unsplash العالمي</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ربط حي ومباشر بمفتاحك</span>
                </span>
                {totalPhotos !== null && (
                  <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                    {totalPhotos > 1000 ? `+${totalPhotos.toLocaleString()}` : totalPhotos} صورة حية
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                تصفح وابحث في ملايين الصور المجانية بجودة فائقة عبر مزود Unsplash الرسمي مباشرة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-200/80 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Categories Filter - Fixed */}
        <div className="px-5 py-3 border-b border-gray-100 space-y-2.5 bg-white shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchPhotos(query);
                }
              }}
              placeholder="ابحث بالاسم أو الموضوع (طبيعة، فضاء، رخام، مكاتب، بحر، تدرجات)..."
              className="w-full pl-20 pr-10 py-2 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-blue-500 rounded-xl outline-none transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 pointer-events-none" />

            <div className="absolute left-1.5 flex items-center gap-1">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    fetchPhotos('');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded cursor-pointer"
                  title="مسح"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => fetchPhotos(query)}
                className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>بحث</span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    const q = cat === 'الكل' ? '' : cat;
                    setQuery(q);
                    fetchPhotos(q);
                  }}
                  className={`px-3 py-1 text-[11px] rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photos Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gray-50/40">
          {isLoading ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-gray-500 gap-2.5">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              <p className="text-xs font-bold">جاري جلب الصور عالية الدقة من Unsplash...</p>
            </div>
          ) : photos.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo) => {
                const isCurrent = currentBackgroundUrl === photo.url;
                return (
                  <div
                    key={photo.id}
                    className={`group relative rounded-xl overflow-hidden border bg-white shadow-xs hover:shadow-md transition-all duration-200 flex flex-col ${
                      isCurrent ? 'ring-2 ring-blue-600 border-blue-500' : 'border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="aspect-[16/10] w-full bg-gray-100 overflow-hidden relative">
                      <img
                        src={photo.thumb}
                        alt={photo.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Selected Badge */}
                      {isCurrent && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-sm">
                          <Check className="w-2.5 h-2.5" />
                          <span>الحالية</span>
                        </div>
                      )}

                      {/* Hover Actions Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5 text-white">
                        <div className="flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewPhoto(photo)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="معاينة كبيرة"
                          >
                            <Eye className="w-3 h-3" />
                            <span>معاينة</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectPhoto(photo.url);
                              onClose();
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>اختيار</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Photographer Info Footer */}
                    <div className="p-2 flex items-center justify-between text-[10px] text-gray-500 bg-white">
                      <span className="truncate font-medium text-gray-700" title={photo.alt}>
                        {photo.photographer}
                      </span>
                      {photo.photographerUrl && (
                        <a
                          href={photo.photographerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 hover:text-blue-600 transition-colors p-0.5"
                          title="صفحة المصور على Unsplash"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-5 mb-2 flex flex-col items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2 bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 font-bold text-xs rounded-xl border border-blue-200 hover:border-blue-300 shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري جلب المزيد من صور Unsplash...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>تحميل المزيد من الصور (صفحة {page + 1})</span>
                    </>
                  )}
                </button>
                <span className="text-[10px] text-gray-400">
                  تم عرض {photos.length} صورة {totalPhotos ? `من أصل ${totalPhotos > 1000 ? `+${totalPhotos.toLocaleString()}` : totalPhotos}` : ''}
                </span>
              </div>
            )}
          </>
          ) : (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-gray-400 gap-2">
              <ImageIcon className="w-10 h-10 stroke-[1.2] text-gray-300" />
              <p className="text-xs font-medium">لم يتم العثور على صور مطابقة لبحثك.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('الكل');
                  fetchPhotos('');
                }}
                className="mt-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                عرض كل الصور المميزة
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer - Fixed Bottom */}
        <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between bg-white text-xs text-gray-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px]">
              {hasKey
                ? 'متصل بـ Unsplash API الرسمي'
                : 'معرض صور Unsplash جاهز للاستخدام'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400">Photos powered by Unsplash</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>

      {/* Large Image Preview Sub-Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[1000005] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="max-w-3xl w-full bg-gray-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Image */}
            <div className="relative aspect-[16/10] w-full bg-black flex items-center justify-center overflow-hidden max-h-[60vh]">
              <img
                src={previewPhoto.full || previewPhoto.url}
                alt={previewPhoto.alt}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 left-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Details & Confirmation */}
            <div className="p-4 flex items-center justify-between bg-gray-900 border-t border-white/10">
              <div>
                <p className="text-xs font-bold text-white mb-0.5">{previewPhoto.alt}</p>
                <p className="text-[11px] text-gray-400">تصوير: {previewPhoto.photographer}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  رجوع
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPhoto(previewPhoto.url);
                    setPreviewPhoto(null);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>تطبيق كخلفية</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};

