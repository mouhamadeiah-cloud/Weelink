import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Monitor, Tablet, Smartphone, ChevronDown, Check, Plus, Layers, Undo2, Redo2, Palette, Pencil, Rows3, Sliders, Sparkles, Pen, Eye, Cloud, CloudCheck, Loader2, Navigation } from 'lucide-react';
import { AppPage, UserRegistrationData, WebPage, PageColorScheme, SlideArrangement, SlideType, Slide, ModularElement, SlideStyle, NavbarStyle } from '../types';
import { buildDefaultPageForUser, createDefaultSlide } from '../data/defaultPageBuilder';
import { PRESET_COLOR_SCHEMES, DEFAULT_COLOR_SCHEME, createCustomColorScheme } from '../data/colorSchemes';
import { useTextEdit } from '../context/TextEditContext';
import { saveProjectToFirestore, loadProjectFromFirestore, saveSlideToFirestore } from '../lib/firestoreService';
import { EmptySlideView } from './workshop/EmptySlideView';
import { UserSiteNavbar } from './workshop/UserSiteNavbar';
import { NavbarEditTopBar } from './workshop/NavbarEditTopBar';
import { WorkshopSidebarControl } from './workshop/WorkshopSidebarControl';
import { PageModal } from './workshop/PageModal';
import { SlideActionToolbar } from './workshop/SlideActionToolbar';
import { SlideEditTopBar } from './workshop/SlideEditTopBar';
import { SlideTemplatePickerModal } from './workshop/SlideTemplatePickerModal';
import { TextEditTopBar } from './workshop/TextEditTopBar';
import { ImageEditTopBar } from './workshop/ImageEditTopBar';
import { ButtonEditTopBar } from './workshop/ButtonEditTopBar';
import { GalleryEditTopBar } from './workshop/GalleryEditTopBar';

interface WorkshopPageProps {
  onNavigate: (page: AppPage) => void;
  userData?: UserRegistrationData;
  onRegisterControls?: (controls: {
    viewport: 'desktop' | 'tablet' | 'mobile';
    setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
    isCloudSaving: boolean;
    lastCloudSavedAt: Date | null;
    handleSaveToCloud: () => Promise<void> | void;
  }) => void;
}

const DEFAULT_FALLBACK_USER: UserRegistrationData = {
  firstName: 'أحمد',
  lastName: 'الخطيب',
  gender: 'male',
  phone: '+963 944 123456',
  email: 'dr.ahmad.khatib@weelink.app',
  pageTitle: 'عيادة الدكتور أحمد الخطيب التخصصية لجراحة العظام والمفاصل',
  authMethod: 'direct',
  governorate: 'دمشق',
  locationType: 'urban',
  city: 'دمشق',
  neighborhood: 'الشعلان',
  district: '',
  subdistrict: '',
  village: '',
  addressDescription: 'شارع الحبيكة - بناء النور الطبي - الطابق الثاني',
  professionCategory: 'طبيب بشري',
  specialty: 'جراحة العظام والمفاصل والعمود الفقري',
};

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export const WorkshopPage: React.FC<WorkshopPageProps> = ({
  onNavigate,
  userData,
  onRegisterControls,
}) => {
  const activeUser = userData && userData.firstName ? userData : DEFAULT_FALLBACK_USER;

  // Build the initial 1-Page default site with 5 Slides
  const initialPage = useMemo(() => {
    return buildDefaultPageForUser(activeUser);
  }, [activeUser]);

  // Site pages list (ordered vertically in sidebar and horizontally in navbar)
  const [pages, setPages] = useState<WebPage[]>([initialPage]);
  const [activePageId, setActivePageId] = useState<string>(initialPage.id);
  const [isCloudSaving, setIsCloudSaving] = useState<boolean>(false);
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState<Date | null>(null);

  // Load persisted website project from local cache or Firebase Firestore on boot
  useEffect(() => {
    try {
      const cachedPages = localStorage.getItem('weelink_project_pages');
      const cachedActivePageId = localStorage.getItem('weelink_active_page_id');
      if (cachedPages) {
        const parsed = JSON.parse(cachedPages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasLegacyOldSlides = parsed.some((page: WebPage) =>
            page.slides?.some((s: Slide) => s.type !== 'empty' || s.id.startsWith('slide-intro') || s.id.startsWith('slide-about'))
          );

          if (hasLegacyOldSlides) {
            localStorage.removeItem('weelink_project_pages');
            localStorage.removeItem('weelink_active_page_id');
            setPages([initialPage]);
            setActivePageId(initialPage.id);
          } else {
            setPages(parsed);
            if (cachedActivePageId) {
              setActivePageId(cachedActivePageId);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Local cache read notice:', e);
    }

    loadProjectFromFirestore()
      .then((remoteProject) => {
        if (remoteProject && remoteProject.pages && remoteProject.pages.length > 0) {
          const hasLegacyOldSlides = remoteProject.pages.some((page: WebPage) =>
            page.slides?.some((s: Slide) => s.type !== 'empty' || s.id.startsWith('slide-intro') || s.id.startsWith('slide-about'))
          );
          if (!hasLegacyOldSlides) {
            setPages(remoteProject.pages);
            if (remoteProject.activePageId) {
              setActivePageId(remoteProject.activePageId);
            }
            setLastCloudSavedAt(new Date());
          }
        }
      })
      .catch((err) => {
        console.warn('Initial project load notice:', err);
      });
  }, [initialPage]);

  // Viewport mode switcher (desktop, tablet, mobile)
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  // Control panel drawer state (closed by default, opens on arrow click or swipe left on small screens)
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);

  // Swipe detection for small screens / touch devices:
  // Swiping to the left opens the control panel; swiping to the right closes it.
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = Math.abs(touchStartY - touchEndY);

      // On small screens / touch screens (< 1024px):
      // If horizontal distance is significant and vertical movement is within bounds
      if (diffY < 90 && Math.abs(diffX) > 40) {
        // In standard screen coords: diffX > 40 means dragging leftwards (inward from right edge)
        if (diffX > 40 && !isControlPanelOpen) {
          setIsControlPanelOpen(true);
        } else if (diffX < -40 && isControlPanelOpen) {
          setIsControlPanelOpen(false);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isControlPanelOpen]);

  // Modal states for creating / editing pages
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [pageModalMode, setPageModalMode] = useState<'create' | 'edit'>('create');
  const [editingPage, setEditingPage] = useState<WebPage | null>(null);

  // Slide selection & Global Page Edit mode states
  // عند الدخول إلى ورشة العمل يكون وضع التعديل مفعلاً أولاً بالافتراضي
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(pages[0]?.slides[0]?.id || null);
  const [isPageEditMode, setIsPageEditMode] = useState<boolean>(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Memoized info of currently selected element (e.g. image element for dedicated image editing toolbar)
  const selectedElementInfo = useMemo(() => {
    if (!selectedElementId) return null;
    let elementIdToSearch = selectedElementId;
    let subImageId: string | null = null;
    if (selectedElementId.includes('::sub::')) {
      const parts = selectedElementId.split('::sub::');
      elementIdToSearch = parts[0];
      subImageId = parts[1];
    }
    for (const page of pages) {
      for (const slide of page.slides) {
        const el = slide.elements?.find((e) => e.id === elementIdToSearch);
        if (el) {
          if (subImageId && el.type === 'gallery_5') {
            const galleryImages = (el.data?.images && Array.isArray(el.data.images) && el.data.images.length > 0)
              ? el.data.images
              : [
                  { id: 'img-1', url: '', isColorPlaceholder: true },
                  { id: 'img-2', url: '', isColorPlaceholder: true },
                  { id: 'img-3', url: '', isColorPlaceholder: true },
                  { id: 'img-4', url: '', isColorPlaceholder: true },
                  { id: 'img-5', url: '', isColorPlaceholder: true },
                ];
            const subImg = galleryImages.find((img: any) => img.id === subImageId) || {
              id: subImageId,
              url: '',
              isColorPlaceholder: true,
            };
            const currentImgUrl = subImg.imageUrl || subImg.url || '';
            const proxyImageElement: ModularElement = {
              id: `${el.id}::sub::${subImg.id}`,
              type: 'image',
              title: '',
              width: subImg.width || 300,
              height: subImg.height || 200,
              x: el.x || 0,
              y: el.y || 0,
              data: {
                imageUrl: currentImgUrl,
                url: currentImgUrl,
                isColorPlaceholder: subImg.isColorPlaceholder !== undefined ? subImg.isColorPlaceholder : !currentImgUrl,
                shadow: subImg.shadow || null,
                lighting: subImg.lighting || null,
                style: subImg.style || {},
                effect: subImg.effect || 'none',
                opacity: subImg.opacity !== undefined ? subImg.opacity : 1,
                link: subImg.link || null,
                isSubImage: true,
                galleryId: el.id,
                subImageId: subImg.id,
              }
            };
            return {
              element: proxyImageElement,
              slideId: slide.id,
              pageId: page.id,
              isSubImage: true,
              galleryElement: el,
            };
          }
          return {
            element: el,
            slideId: slide.id,
            pageId: page.id,
          };
        }
      }
    }
    return null;
  }, [pages, selectedElementId]);

  // Debounced auto-save project & slides to Firebase Firestore ("وذلك ينطبق على كل المشروع")
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    try {
      localStorage.setItem('weelink_project_pages', JSON.stringify(pages));
      localStorage.setItem('weelink_active_page_id', activePageId);
    } catch (e) {
      console.warn('Local storage cache write notice:', e);
    }

    const timer = setTimeout(async () => {
      try {
        setIsCloudSaving(true);
        const siteTitle = activeUser.pageTitle || activePage?.title || 'موقعي المهني';
        await saveProjectToFirestore(pages, activePageId, siteTitle);

        const currentActiveSlide = pages.find((p) => p.id === activePageId)?.slides.find((s) => s.id === selectedSlideId);
        if (currentActiveSlide) {
          await saveSlideToFirestore(currentActiveSlide);
        }

        setIsCloudSaving(false);
        setLastCloudSavedAt(new Date());
      } catch (err) {
        console.warn('Auto Firebase sync notice:', err);
        setIsCloudSaving(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [pages, activePageId, activeUser.pageTitle, selectedSlideId]);

  // Manual or automatic cloud save handler
  const handleSaveToCloud = async () => {
    setIsCloudSaving(true);
    const siteTitle = activeUser.pageTitle || activePage?.title || 'موقعي المهني';
    const success = await saveProjectToFirestore(pages, activePageId, siteTitle);
    const currentActiveSlide = pages.find((p) => p.id === activePageId)?.slides.find((s) => s.id === selectedSlideId);
    if (currentActiveSlide) {
      await saveSlideToFirestore(currentActiveSlide);
    }
    setIsCloudSaving(false);
    if (success) {
      setLastCloudSavedAt(new Date());
    }
  };

  // Sync controls with App.tsx to display them in the top navbar
  useEffect(() => {
    if (onRegisterControls) {
      onRegisterControls({
        viewport,
        setViewport,
        isCloudSaving,
        lastCloudSavedAt,
        handleSaveToCloud,
        isPageEditMode,
        togglePageEditMode: handleTogglePageEditMode,
      });
    }
  }, [viewport, isCloudSaving, lastCloudSavedAt, isPageEditMode, onRegisterControls]);

  // Listener for clicking internal links within elements (like images or buttons)
  useEffect(() => {
    const handleNavigateEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ pageId: string }>;
      const pageId = customEvent.detail?.pageId;
      if (pageId && pages.some((p) => p.id === pageId)) {
        setActivePageId(pageId);
        setSelectedSlideId(null);
        setSelectedElementId(null);
      }
    };
    window.addEventListener('workshop-navigate-page', handleNavigateEvent);
    return () => {
      window.removeEventListener('workshop-navigate-page', handleNavigateEvent);
    };
  }, [pages]);

  const isManualSelectionRef = useRef<boolean>(false);
  const previewStageRef = useRef<HTMLElement | null>(null);

  const [containerWidth, setContainerWidth] = useState<number>(1200);

  useEffect(() => {
    const container = previewStageRef.current;
    if (!container) return;

    const handleResize = () => {
      setContainerWidth(container.clientWidth);
    };

    handleResize();

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [zoomMode, setZoomMode] = useState<'fit' | '100%'>('fit');

  const targetCanvasWidth = useMemo(() => {
    if (viewport === 'tablet') return 768;
    if (viewport === 'mobile') return 390;
    return 1440; // Standard canonical desktop design resolution (1440px)
  }, [viewport]);

  const autoFitScale = useMemo(() => {
    if (isPageEditMode) {
      // In edit mode: available width in preview stage minus 48px safety padding
      const availableWidth = containerWidth - 48;
      if (availableWidth > 0 && availableWidth < targetCanvasWidth) {
        return Math.max(0.35, Math.round((availableWidth / targetCanvasWidth) * 1000) / 1000);
      }
      return 1;
    } else {
      // In preview mode:
      if (viewport === 'desktop') {
        // Desktop in preview mode must span 100% full width of the screen without any gaps on the sides
        if (containerWidth > 0 && targetCanvasWidth > 0) {
          return Math.round((containerWidth / targetCanvasWidth) * 1000) / 1000;
        }
        return 1;
      }
      // Tablet and mobile frames in preview mode
      if (containerWidth > 0 && containerWidth < targetCanvasWidth) {
        return Math.max(0.35, Math.round((containerWidth / targetCanvasWidth) * 1000) / 1000);
      }
      return 1;
    }
  }, [containerWidth, targetCanvasWidth, isPageEditMode, viewport]);

  const effectiveScale = !isPageEditMode && viewport === 'desktop' ? autoFitScale : zoomMode === 'fit' ? autoFitScale : 1;

  // Ref and height measurement for scaling wrapper
  const publicWebpageRef = useRef<HTMLDivElement>(null);
  const [canvasContentHeight, setCanvasContentHeight] = useState<number>(0);

  useEffect(() => {
    if (!publicWebpageRef.current) return;
    const ro = new ResizeObserver((entries) => {
      if (entries[0]) {
        setCanvasContentHeight(entries[0].contentRect.height);
      }
    });
    ro.observe(publicWebpageRef.current);
    return () => ro.disconnect();
  }, []);

  // Project pages dropdown state
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const pagesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pagesDropdownRef.current && !pagesDropdownRef.current.contains(e.target as Node)) {
        setIsPagesDropdownOpen(false);
      }
    };
    if (isPagesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPagesDropdownOpen]);

  const handleSelectPageFromDropdown = (pageId: string) => {
    setActivePageId(pageId);
    setSelectedSlideId(null);
    setSelectedElementId(null);
    setIsPagesDropdownOpen(false);

    // Highlight and scroll smoothly to the top of Arena
    setTimeout(() => {
      if (previewStageRef.current) {
        previewStageRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      const pageCanvas = document.getElementById('future-public-webpage');
      if (pageCanvas) {
        pageCanvas.classList.add('ring-2', 'ring-amber-500/80', 'transition-all');
        setTimeout(() => {
          pageCanvas.classList.remove('ring-2', 'ring-amber-500/80');
        }, 1200);
      }
    }, 60);
  };

  // Active page inline edit popovers & controls (شريط تعديل الصفحة المعروضة)
  const [topToolbarMode, setTopToolbarMode] = useState<'page' | 'slide' | 'navbar'>('slide');
  const [isPageToolbarModeDropdownOpen, setIsPageToolbarModeDropdownOpen] = useState(false);
  const pageModeDropdownRef = useRef<HTMLDivElement>(null);

  const handleUpdateNavbarStyle = (updates: Partial<NavbarStyle>) => {
    setPages((prevPages) => {
      return prevPages.map((page) => ({
        ...page,
        navbarStyle: {
          ...(page.navbarStyle || {}),
          ...updates,
        },
      }));
    });
  };

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isArrangementPickerOpen, setIsArrangementPickerOpen] = useState(false);
  const [colorPickerTab, setColorPickerTab] = useState<'presets' | 'custom'>('presets');
  const [customPrimaryColor, setCustomPrimaryColor] = useState<string>('#2563eb');
  const [customAccentColor, setCustomAccentColor] = useState<string>('#f59e0b');

  const colorPickerRef = useRef<HTMLDivElement>(null);
  const arrangementPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setIsColorPickerOpen(false);
      }
      if (arrangementPickerRef.current && !arrangementPickerRef.current.contains(e.target as Node)) {
        setIsArrangementPickerOpen(false);
      }
      if (pageModeDropdownRef.current && !pageModeDropdownRef.current.contains(e.target as Node)) {
        setIsPageToolbarModeDropdownOpen(false);
      }
    };
    if (isColorPickerOpen || isArrangementPickerOpen || isPageToolbarModeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorPickerOpen, isArrangementPickerOpen, isPageToolbarModeDropdownOpen]);

  // Text Edit integration
  const {
    activeSession,
    undo: textUndo,
    redo: textRedo,
    canUndo: canTextUndo,
    canRedo: canTextRedo,
    commitEditing,
  } = useTextEdit();

  // Toggle page-wide edit mode / preview mode (زر قلم بجانب ازرار الرجوع والتقدم)
  const handleTogglePageEditMode = () => {
    if (isPageEditMode) {
      // Freeze editing and return to Preview mode
      setIsPageEditMode(false);
      setSelectedElementId(null);
      if (activeSession) {
        commitEditing();
      }
    } else {
      // Turn entire page into editable mode
      setIsPageEditMode(true);
      setSelectedElementId(null);
    }
  };

  // Project History Stack for Undo / Redo (الرجوع خطوة والتقدم خطوة في المشروع)
  const [projectHistory, setProjectHistory] = useState<WebPage[][]>([[initialPage]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isHistoryTravelingRef = useRef<boolean>(false);

  // Record history snapshot on pages change
  useEffect(() => {
    if (isHistoryTravelingRef.current) {
      isHistoryTravelingRef.current = false;
      return;
    }

    setProjectHistory((prevHistory) => {
      const currentEntry = prevHistory[historyIndex];
      try {
        if (currentEntry && JSON.stringify(currentEntry) === JSON.stringify(pages)) {
          return prevHistory;
        }
      } catch {
        // Serialization fallback
      }
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(pages);
      if (newHistory.length > 35) {
        newHistory.shift();
      }
      return newHistory;
    });

    setHistoryIndex((prevIndex) => Math.min(prevIndex + 1, 34));
  }, [pages]);

  const canProjectUndo = historyIndex > 0;
  const canProjectRedo = historyIndex < projectHistory.length - 1;

  const canUndo = Boolean((activeSession && canTextUndo) || canProjectUndo);
  const canRedo = Boolean((activeSession && canTextRedo) || canProjectRedo);

  const handleUndo = useCallback(() => {
    if (activeSession && canTextUndo) {
      textUndo();
      return;
    }
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const targetPages = projectHistory[newIndex];
      if (targetPages) {
        isHistoryTravelingRef.current = true;
        setHistoryIndex(newIndex);
        setPages(targetPages);
        if (!targetPages.some((p) => p.id === activePageId)) {
          setActivePageId(targetPages[0]?.id || initialPage.id);
        }
      }
    }
  }, [activeSession, canTextUndo, textUndo, historyIndex, projectHistory, activePageId, initialPage.id]);

  const handleRedo = useCallback(() => {
    if (activeSession && canTextRedo) {
      textRedo();
      return;
    }
    if (historyIndex < projectHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const targetPages = projectHistory[newIndex];
      if (targetPages) {
        isHistoryTravelingRef.current = true;
        setHistoryIndex(newIndex);
        setPages(targetPages);
        if (!targetPages.some((p) => p.id === activePageId)) {
          setActivePageId(targetPages[0]?.id || initialPage.id);
        }
      }
    }
  }, [activeSession, canTextRedo, textRedo, historyIndex, projectHistory, activePageId, initialPage.id]);

  // Global keyboard shortcuts (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          (target.isContentEditable && !target.dataset.elementId))
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Template selection modal state for 5 models
  // "كل شريحة عند النقر على اضافة تفتح اولا خمس نماذج لكل شريحة"
  const [templatePickerState, setTemplatePickerState] = useState<{
    isOpen: boolean;
    slideType: SlideType;
    insertBelowSlideId?: string | null;
    targetSlideToChangeLayoutId?: string | null;
    currentVariantId?: number;
  }>({
    isOpen: false,
    slideType: 'intro',
    currentVariantId: 1,
  });

  // Duplicate slide (زر copy ينسخ الشريحة ويضع شريحة مماثلة تحتها)
  const handleDuplicateSlide = (slideId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== activePage.id) return page;
        const slideIndex = page.slides.findIndex((s) => s.id === slideId);
        if (slideIndex === -1) return page;

        const original = page.slides[slideIndex];
        const newSlideId = `${original.type}-${Date.now()}`;
        const clonedSlide = {
          ...JSON.parse(JSON.stringify(original)),
          id: newSlideId,
          name: `${original.name} (نسخة)`,
        };

        const nextSlides = [...page.slides];
        nextSlides.splice(slideIndex + 1, 0, clonedSlide);
        return {
          ...page,
          slides: nextSlides,
        };
      })
    );
  };

  // Delete slide (زر حذف للشريحة يتم بعد التأكيد)
  const handleDeleteSlide = (slideId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== activePage.id) return page;
        if (page.slides.length <= 1) return page;
        const nextSlides = page.slides.filter((s) => s.id !== slideId);
        return {
          ...page,
          slides: nextSlides,
        };
      })
    );
    if (selectedSlideId === slideId) {
      setSelectedSlideId(null);
      setSelectedElementId(null);
    }
  };

  // Currently selected page
  const activePage = pages.find((p) => p.id === activePageId) || pages[0] || initialPage;
  const activeColorScheme = activePage.colorScheme || DEFAULT_COLOR_SCHEME;

  // Selected slide instance for top toolbar
  const selectedSlide = useMemo(() => {
    if (!selectedSlideId) return activePage.slides[0] || null;
    return activePage.slides.find((s) => s.id === selectedSlideId) || activePage.slides[0] || null;
  }, [activePage.slides, selectedSlideId]);

  // Slide Name and Style Update handlers
  const handleUpdateSlideName = (slideId: string, newName: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== activePage.id) return page;
        return {
          ...page,
          slides: page.slides.map((s) => (s.id === slideId ? { ...s, name: newName } : s)),
        };
      })
    );
  };

  const handleUpdateSlideStyle = (slideId: string, styleUpdates: Partial<SlideStyle>) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== activePage.id) return page;
        return {
          ...page,
          slides: page.slides.map((s) => {
            if (s.id !== slideId) return s;
            const nextStyle = {
              ...(s.style || {}),
              ...styleUpdates,
            };
            
            // Explicitly delete keys set to undefined so they are completely removed
            Object.keys(nextStyle).forEach((key) => {
              if (nextStyle[key as keyof SlideStyle] === undefined) {
                delete nextStyle[key as keyof SlideStyle];
              }
            });

            return {
              ...s,
              style: nextStyle,
            };
          }),
        };
      })
    );
  };

  // Sync custom color pickers when active page changes
  useEffect(() => {
    if (activePage.colorScheme) {
      setCustomPrimaryColor(activePage.colorScheme.primary || '#2563eb');
      setCustomAccentColor(activePage.colorScheme.accent || '#f59e0b');
    }
  }, [activePage.id, activePage.colorScheme]);

  const handleUpdateActivePageTitle = (newTitle: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === activePage.id
          ? {
              ...p,
              title: newTitle,
              slug: newTitle.toLowerCase().replace(/\s+/g, '-'),
            }
          : p
      )
    );
  };

  const handleUpdateActivePageColorScheme = (scheme: PageColorScheme) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === activePage.id
          ? {
              ...p,
              colorScheme: scheme,
            }
          : p
      )
    );
  };

  const handleUpdateActivePageArrangement = (arrangement: SlideArrangement) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === activePage.id
          ? {
              ...p,
              arrangement,
            }
          : p
      )
    );
  };

  // Sync active slide with scroll position
  // "واختفاء ايقونات تعديل الشريحة عند الخروج من الشريحة وظهور شريحة اخرى على الشاشة"
  useEffect(() => {
    let ticking = false;

    const checkActiveSlideOnScroll = () => {
      if (isManualSelectionRef.current) return;
      if (!activePage?.slides || activePage.slides.length === 0) return;

      const headerOffset = 80;
      const viewportHeight = window.innerHeight;
      const focalY = headerOffset + (viewportHeight - headerOffset) * 0.38;

      let bestSlideId: string | null = null;
      let minDistance = Infinity;
      let anySlideVisible = false;

      for (const slide of activePage.slides) {
        const el = document.getElementById(`slide-wrapper-${slide.id}`);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const isVisible = rect.bottom > headerOffset + 25 && rect.top < viewportHeight - 25;

        if (isVisible) {
          anySlideVisible = true;
          if (rect.top <= focalY && rect.bottom >= focalY) {
            bestSlideId = slide.id;
            break;
          }

          const dist = rect.top > focalY ? rect.top - focalY : focalY - rect.bottom;
          if (dist < minDistance) {
            minDistance = dist;
            bestSlideId = slide.id;
          }
        }
      }

      if (bestSlideId) {
        if (bestSlideId !== selectedSlideId) {
          setSelectedSlideId(bestSlideId);
          if (!isPageEditMode) {
            setSelectedElementId(null);
          }
        }
      } else if (!anySlideVisible && selectedSlideId !== null) {
        setSelectedSlideId(null);
        if (!isPageEditMode) {
          setSelectedElementId(null);
        }
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkActiveSlideOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const stageEl = previewStageRef.current;
    if (stageEl) {
      stageEl.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (stageEl) {
        stageEl.removeEventListener('scroll', onScroll);
      }
    };
  }, [activePage?.id, activePage?.slides, selectedSlideId, isPageEditMode, viewport]);

  // Reorder pages: Move Up
  const handleMovePageUp = (index: number) => {
    if (index <= 0) return;
    setPages((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  // Reorder pages: Move Down
  const handleMovePageDown = (index: number) => {
    if (index >= pages.length - 1) return;
    setPages((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  // Open modal to add page
  const handleOpenAddPage = () => {
    setPageModalMode('create');
    setEditingPage(null);
    setPageModalOpen(true);
  };

  // Open modal to edit page settings (gear icon)
  const handleOpenEditPage = (page: WebPage) => {
    setPageModalMode('edit');
    setEditingPage(page);
    setPageModalOpen(true);
  };

  // Save Page (Create or Edit)
  const handleSavePageData = ({
    title,
    colorScheme,
    arrangement,
  }: {
    title: string;
    colorScheme: PageColorScheme;
    arrangement: SlideArrangement;
  }) => {
    if (pageModalMode === 'create') {
      const newPageId = `page-${Date.now()}`;
      // Generate clean slides for the new page based on user templates
      const baseSite = buildDefaultPageForUser(activeUser);
      const newPage: WebPage = {
        id: newPageId,
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        colorScheme,
        arrangement,
        slides: baseSite.slides.map((s, idx) => ({
          ...s,
          id: `${newPageId}-slide-${idx}`,
        })),
      };
      setPages((prev) => [...prev, newPage]);
      setActivePageId(newPageId);
    } else if (pageModalMode === 'edit' && editingPage) {
      setPages((prev) =>
        prev.map((p) =>
          p.id === editingPage.id
            ? {
                ...p,
                title,
                slug: title.toLowerCase().replace(/\s+/g, '-'),
                colorScheme,
                arrangement,
              }
            : p
        )
      );
    }
  };

  // Delete Page
  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) return;
    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== pageId);
      if (activePageId === pageId && filtered.length > 0) {
        setActivePageId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Scroll preview smoothly to the selected slide
  // "النقر على شريحة ياخذ المستخدم في المعاينة الى الشريحة المطلوبة"
  const handleSelectSlide = (pageId: string, slideId: string, slideType: SlideType) => {
    setSelectedSlideId(slideId);
    setSelectedElementId(null);
    setTopToolbarMode('slide');

    const scrollToTarget = () => {
      const target =
        document.getElementById(`slide-wrapper-${slideId}`) ||
        document.getElementById(`slide-${slideType}`) ||
        document.getElementById(`slide-${slideId}`);

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Visual indicator on target slide
        target.classList.add('ring-2', 'ring-orange-500', 'ring-offset-4', 'ring-offset-[#050b18]', 'transition-all');
        setTimeout(() => {
          target.classList.remove('ring-2', 'ring-orange-500', 'ring-offset-4', 'ring-offset-[#050b18]');
        }, 1200);
      }
    };

    if (activePageId !== pageId) {
      setActivePageId(pageId);
      // Wait for DOM to render the target page's slides
      setTimeout(scrollToTarget, 100);
    } else {
      scrollToTarget();
    }
  };

  // Add a new slide to the active page from the dropdown menu
  // "كل شريحة عند النقر على اضافة تفتح اولا خمس نماذج لكل شريحة"
  // "اضافة شريحة فارغة تماما تكون بحجم الشرائح الموجودة فيها زر عائم صغير فقط + لإضافة عنصر"
  const handleAddSlide = (type: SlideType) => {
    if (type === 'empty') {
      const newSlide = createDefaultSlide('empty', activeUser);
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== activePageId) return p;
          return {
            ...p,
            slides: [...p.slides, newSlide],
          };
        })
      );
      setSelectedSlideId(newSlide.id);
      setSelectedElementId(null);
      setTopToolbarMode('slide');
      setTimeout(() => {
        const target =
          document.getElementById(`slide-empty-${newSlide.id}`) ||
          document.getElementById(`slide-wrapper-${newSlide.id}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-4', 'ring-offset-[#050b18]');
          setTimeout(() => {
            target.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-4', 'ring-offset-[#050b18]');
          }, 1300);
        }
      }, 150);
      return;
    }

    setTemplatePickerState({
      isOpen: true,
      slideType: type,
      insertBelowSlideId: null,
      targetSlideToChangeLayoutId: null,
      currentVariantId: 1,
    });
  };

  // Add a new slide directly below the current slide in preview
  // "زر الإضافة في الشريحة في ساحة المعاينة يفتح نفس قائمة الشرائح للاضافة تحت الشريحة الحالية"
  const handleAddSlideBelow = (currentSlideId: string, type: SlideType) => {
    if (type === 'empty') {
      const newSlide = createDefaultSlide('empty', activeUser);
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== activePageId) return p;
          const currentIndex = p.slides.findIndex((s) => s.id === currentSlideId);
          const nextSlides = [...p.slides];
          if (currentIndex !== -1) {
            nextSlides.splice(currentIndex + 1, 0, newSlide);
          } else {
            nextSlides.push(newSlide);
          }
          return {
            ...p,
            slides: nextSlides,
          };
        })
      );
      setSelectedSlideId(newSlide.id);
      setSelectedElementId(null);
      setTopToolbarMode('slide');
      setTimeout(() => {
        const target =
          document.getElementById(`slide-empty-${newSlide.id}`) ||
          document.getElementById(`slide-wrapper-${newSlide.id}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-4', 'ring-offset-[#050b18]');
          setTimeout(() => {
            target.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-4', 'ring-offset-[#050b18]');
          }, 1300);
        }
      }, 150);
      return;
    }

    setTemplatePickerState({
      isOpen: true,
      slideType: type,
      insertBelowSlideId: currentSlideId,
      targetSlideToChangeLayoutId: null,
      currentVariantId: 1,
    });
  };

  // Change the template layout of an existing slide
  const handleChangeSlideLayout = (slide: Slide) => {
    setTemplatePickerState({
      isOpen: true,
      slideType: slide.type,
      insertBelowSlideId: null,
      targetSlideToChangeLayoutId: slide.id,
      currentVariantId: slide.layoutVariant || 1,
    });
  };

  // Finalize template selection: either create new slide with chosen variant or update existing
  const handleSelectTemplate = (variantId: number) => {
    const { slideType, insertBelowSlideId, targetSlideToChangeLayoutId } = templatePickerState;

    // 1. Changing layout of existing slide
    if (targetSlideToChangeLayoutId) {
      setPages((prev) =>
        prev.map((p) => {
          if (p.id !== activePageId) return p;
          return {
            ...p,
            slides: p.slides.map((s) => {
              if (s.id !== targetSlideToChangeLayoutId) return s;
              return {
                ...s,
                layoutVariant: variantId,
              };
            }),
          };
        })
      );
      setTemplatePickerState((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    // 2. Creating a new slide with chosen layout variant
    const newSlide = createDefaultSlide(slideType, activeUser, variantId);
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== activePageId) return p;
        if (insertBelowSlideId) {
          const currentIndex = p.slides.findIndex((s) => s.id === insertBelowSlideId);
          const nextSlides = [...p.slides];
          if (currentIndex !== -1) {
            nextSlides.splice(currentIndex + 1, 0, newSlide);
          } else {
            nextSlides.push(newSlide);
          }
          return {
            ...p,
            slides: nextSlides,
          };
        } else {
          return {
            ...p,
            slides: [...p.slides, newSlide],
          };
        }
      })
    );

    setSelectedSlideId(newSlide.id);
    setSelectedElementId(null);
    setTopToolbarMode('slide');
    setTemplatePickerState((prev) => ({ ...prev, isOpen: false }));

    // Scroll to new slide smoothly in preview with temporary highlight
    setTimeout(() => {
      const target =
        document.getElementById(`slide-wrapper-${newSlide.id}`) ||
        document.getElementById(`slide-${newSlide.type}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('ring-2', 'ring-blue-500', 'ring-offset-4', 'ring-offset-[#050b18]');
        setTimeout(() => {
          target.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-4', 'ring-offset-[#050b18]');
        }, 1300);
      }
    }, 150);
  };

  const handleDuplicateElementInSlide = (slideId: string, elementId: string) => {
    const slide = pages.find((p) => p.id === activePageId)?.slides.find((s) => s.id === slideId);
    if (!slide) return;

    if (elementId.includes('::sub::')) {
      const parts = elementId.split('::sub::');
      const galleryId = parts[0];
      const subImageId = parts[1];
      const parentGallery = slide.elements?.find((e) => e.id === galleryId);
      if (parentGallery) {
        const prevImages = (parentGallery.data?.images && Array.isArray(parentGallery.data.images) && parentGallery.data.images.length > 0)
          ? parentGallery.data.images
          : [
              { id: 'img-1', url: '', isColorPlaceholder: true },
              { id: 'img-2', url: '', isColorPlaceholder: true },
              { id: 'img-3', url: '', isColorPlaceholder: true },
              { id: 'img-4', url: '', isColorPlaceholder: true },
              { id: 'img-5', url: '', isColorPlaceholder: true },
            ];
        const targetImg = prevImages.find((img: any) => img.id === subImageId);
        if (targetImg) {
          const newSubId = `img-${Date.now()}`;
          const newImg = { ...targetImg, id: newSubId };
          const updatedImages = [...prevImages, newImg];
          const updatedGallery: ModularElement = {
            ...parentGallery,
            data: {
              ...parentGallery.data,
              images: updatedImages,
            },
          };
          handleUpdateElementInEmptySlide(slideId, updatedGallery);
          setSelectedElementId(`${galleryId}::sub::${newSubId}`);
          return;
        }
      }
    }

    const el = slide?.elements?.find((e) => e.id === elementId);
    if (!el) return;
    const newId = `el-img-${Date.now()}`;
    const newEl: ModularElement = {
      ...el,
      id: newId,
      x: (el.x || 40) + 24,
      y: (el.y || 40) + 24,
      position: el.position
        ? {
            ...el.position,
            x: (el.position.x || 40) + 24,
            y: (el.position.y || 40) + 24,
          }
        : undefined,
    };
    handleAddElementToEmptySlide(slideId, newEl);
    setSelectedElementId(newId);
  };

  // Handlers for empty slide element management
  // "عند اضافة عنصر يبقى العنصر محفوظا في الشريحة ويرسل التطبيق معلومات الشريحة ل firbase لحفظها وذلك ينطبق على كل المشروع"
  const handleAddElementToEmptySlide = async (slideId: string, element: ModularElement) => {
    let updatedSlideObj: Slide | null = null;
    let nextPagesSnapshot: WebPage[] = [];

    setPages((prevPages) => {
      const next = prevPages.map((page) => {
        if (page.id !== activePageId) return page;
        return {
          ...page,
          slides: page.slides.map((s) => {
            if (s.id !== slideId) return s;
            const updated: Slide = {
              ...s,
              elements: [...(s.elements || []), element],
            };
            updatedSlideObj = updated;
            return updated;
          }),
        };
      });
      nextPagesSnapshot = next;
      return next;
    });

    // Save directly to Firebase Firestore
    setIsCloudSaving(true);
    try {
      if (updatedSlideObj) {
        await saveSlideToFirestore(updatedSlideObj);
      }
      if (nextPagesSnapshot.length > 0) {
        const siteTitle = activeUser.pageTitle || activePage?.title || 'موقعي المهني';
        await saveProjectToFirestore(nextPagesSnapshot, activePageId, siteTitle);
      }
      setIsCloudSaving(false);
      setLastCloudSavedAt(new Date());
    } catch (err) {
      console.warn('Firebase slide save error:', err);
      setIsCloudSaving(false);
    }
  };

  const handleDeleteElementFromEmptySlide = async (slideId: string, elementId: string) => {
    let updatedSlideObj: Slide | null = null;
    let nextPagesSnapshot: WebPage[] = [];

    setPages((prevPages) => {
      const next = prevPages.map((page) => {
        if (page.id !== activePageId) return page;
        return {
          ...page,
          slides: page.slides.map((s) => {
            if (s.id !== slideId) return s;

            let updatedElements = s.elements || [];
            if (elementId.includes('::sub::')) {
              const parts = elementId.split('::sub::');
              const galleryId = parts[0];
              const subImageId = parts[1];

              updatedElements = (s.elements || []).map((el) => {
                if (el.id === galleryId && el.type === 'gallery_5') {
                  const prevImages = (el.data?.images && Array.isArray(el.data.images) && el.data.images.length > 0)
                    ? el.data.images
                    : [
                        { id: 'img-1', url: '', isColorPlaceholder: true },
                        { id: 'img-2', url: '', isColorPlaceholder: true },
                        { id: 'img-3', url: '', isColorPlaceholder: true },
                        { id: 'img-4', url: '', isColorPlaceholder: true },
                        { id: 'img-5', url: '', isColorPlaceholder: true },
                      ];
                  const remainingImages = prevImages.filter((img: any) => img.id !== subImageId);
                  return {
                    ...el,
                    data: {
                      ...el.data,
                      images: remainingImages,
                    },
                  };
                }
                return el;
              });
            } else {
              updatedElements = (s.elements || []).filter((el) => el.id !== elementId);
            }

            const updated: Slide = {
              ...s,
              elements: updatedElements,
            };
            updatedSlideObj = updated;
            return updated;
          }),
        };
      });
      nextPagesSnapshot = next;
      return next;
    });

    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }

    try {
      if (updatedSlideObj) {
        await saveSlideToFirestore(updatedSlideObj);
      }
      if (nextPagesSnapshot.length > 0) {
        const siteTitle = activeUser.pageTitle || activePage?.title || 'موقعي المهني';
        await saveProjectToFirestore(nextPagesSnapshot, activePageId, siteTitle);
      }
      setLastCloudSavedAt(new Date());
    } catch (err) {
      console.warn('Firebase delete element sync notice:', err);
    }
  };

  const handleUpdateElementInEmptySlide = async (slideId: string, updatedElement: ModularElement) => {
    let updatedSlideObj: Slide | null = null;
    let nextPagesSnapshot: WebPage[] = [];

    setPages((prevPages) => {
      const next = prevPages.map((page) => {
        if (page.id !== activePageId) return page;
        return {
          ...page,
          slides: page.slides.map((s) => {
            if (s.id !== slideId) return s;

            let updatedElements = s.elements || [];
            if (updatedElement.id.includes('::sub::')) {
              const parts = updatedElement.id.split('::sub::');
              const galleryId = parts[0];
              const subImageId = parts[1];

              const parentGallery = (s.elements || []).find((el) => el.id === galleryId);
              if (parentGallery) {
                const prevImages = (parentGallery.data?.images && Array.isArray(parentGallery.data.images) && parentGallery.data.images.length > 0)
                  ? parentGallery.data.images
                  : [
                      { id: 'img-1', url: '', isColorPlaceholder: true },
                      { id: 'img-2', url: '', isColorPlaceholder: true },
                      { id: 'img-3', url: '', isColorPlaceholder: true },
                      { id: 'img-4', url: '', isColorPlaceholder: true },
                      { id: 'img-5', url: '', isColorPlaceholder: true },
                    ];

                // Check if explicit detach was requested
                if (parentGallery.data?.unlinked && (updatedElement.data as any)?.detachImage) {
                  // DETACH IMAGE: Convert to a standalone image element!
                  const galleryX = parentGallery.x || 0;
                  const galleryY = parentGallery.y || 0;
                  const relativeX = updatedElement.x || 0;
                  const relativeY = updatedElement.y || 0;

                  const newImageElement: ModularElement = {
                    id: `el-img-${Date.now()}`,
                    type: 'image',
                    title: '',
                    x: galleryX + relativeX,
                    y: galleryY + relativeY,
                    width: updatedElement.width || 200,
                    height: updatedElement.height || 200,
                    data: {
                      url: updatedElement.data?.imageUrl || updatedElement.data?.url || '',
                      imageUrl: updatedElement.data?.imageUrl || updatedElement.data?.url || '',
                      isColorPlaceholder: updatedElement.data?.isColorPlaceholder || false,
                      shadow: updatedElement.data?.shadow || null,
                      lighting: updatedElement.data?.lighting || null,
                      style: updatedElement.data?.style || {},
                      effect: updatedElement.data?.effect || 'none',
                      opacity: updatedElement.data?.opacity !== undefined ? updatedElement.data?.opacity : 1,
                      link: updatedElement.data?.link || null,
                    }
                  };

                  const remainingImages = prevImages.filter((img: any) => img.id !== subImageId);
                  const updatedGallery: ModularElement = {
                    ...parentGallery,
                    data: {
                      ...parentGallery.data,
                      images: remainingImages,
                    }
                  };

                  const filteredElements = (s.elements || []).filter((el) => el.id !== galleryId);
                  updatedElements = [...filteredElements, updatedGallery, newImageElement];

                  setTimeout(() => {
                    setSelectedElementId(newImageElement.id);
                  }, 10);
                } else {
                  // In-place update of sub-image inside the gallery data
                  const imgData = updatedElement.data || {};
                  const finalUrl = imgData.imageUrl || imgData.url || '';
                  const updatedImages = prevImages.map((img: any) => {
                    if (img.id !== subImageId) return img;
                    return {
                      ...img,
                      url: finalUrl,
                      imageUrl: finalUrl,
                      isColorPlaceholder: imgData.isColorPlaceholder !== undefined ? imgData.isColorPlaceholder : !finalUrl,
                      shadow: imgData.shadow || null,
                      lighting: imgData.lighting || null,
                      style: imgData.style || {},
                      effect: imgData.effect || 'none',
                      opacity: imgData.opacity !== undefined ? imgData.opacity : 1,
                      link: imgData.link || null,
                      alt: imgData.alt,
                    };
                  });

                  const updatedGallery: ModularElement = {
                    ...parentGallery,
                    data: {
                      ...parentGallery.data,
                      images: updatedImages,
                    }
                  };

                  updatedElements = (s.elements || []).map((el) =>
                    el.id === galleryId ? updatedGallery : el
                  );
                }
              }
            } else {
              updatedElements = (s.elements || []).map((el) =>
                el.id === updatedElement.id ? updatedElement : el
              );
            }

            const updated: Slide = {
              ...s,
              elements: updatedElements,
            };
            updatedSlideObj = updated;
            return updated;
          }),
        };
      });
      nextPagesSnapshot = next;
      return next;
    });

    try {
      if (updatedSlideObj) {
        await saveSlideToFirestore(updatedSlideObj);
      }
      if (nextPagesSnapshot.length > 0) {
        const siteTitle = activeUser.pageTitle || activePage?.title || 'موقعي المهني';
        await saveProjectToFirestore(nextPagesSnapshot, activePageId, siteTitle);
      }
      setLastCloudSavedAt(new Date());
    } catch (err) {
      console.warn('Firebase update element sync notice:', err);
    }
  };

  const handleUpdateElementsInEmptySlide = async (
    slideId: string,
    updatedElements: ModularElement[]
  ) => {
    let updatedSlideObj: Slide | null = null;
    let nextPagesSnapshot: WebPage[] = [];

    setPages((prevPages) => {
      const next = prevPages.map((page) => {
        if (page.id !== activePageId) return page;
        return {
          ...page,
          slides: page.slides.map((s) => {
            if (s.id !== slideId) return s;
            const updated: Slide = {
              ...s,
              elements: updatedElements,
            };
            updatedSlideObj = updated;
            return updated;
          }),
        };
      });
      nextPagesSnapshot = next;
      return next;
    });

    try {
      if (updatedSlideObj) {
        await saveSlideToFirestore(updatedSlideObj);
      }
      if (nextPagesSnapshot.length > 0) {
        const siteTitle = activeUser.pageTitle || activePage?.title || 'موقعي المهني';
        await saveProjectToFirestore(nextPagesSnapshot, activePageId, siteTitle);
      }
      setLastCloudSavedAt(new Date());
    } catch (err) {
      console.warn('Firebase update elements sync notice:', err);
    }
  };

  const handleLayerActionInSlide = async (
    slideId: string,
    targetElementId: string,
    action: 'bringToFront' | 'bringForward' | 'sendBackward' | 'sendToBack'
  ) => {
    const slide = activePage.slides.find((s) => s.id === slideId);
    if (!slide || !slide.elements || slide.elements.length <= 1) return;

    const allEls = [...slide.elements];

    const getZ = (el: ModularElement, idx: number) => {
      if (typeof el.position?.zIndex === 'number') return el.position.zIndex;
      if (typeof el.zIndex === 'number') return el.zIndex;
      return (idx + 1) * 10;
    };

    const currentOrder = [...allEls].sort((a, b) => {
      const origIdxA = allEls.findIndex((x) => x.id === a.id);
      const origIdxB = allEls.findIndex((x) => x.id === b.id);
      const zA = getZ(a, origIdxA);
      const zB = getZ(b, origIdxB);
      if (zA !== zB) return zA - zB;
      return origIdxA - origIdxB;
    });

    const curIdx = currentOrder.findIndex((el) => el.id === targetElementId);
    if (curIdx === -1) return;

    let nextOrder: ModularElement[] = [...currentOrder];

    switch (action) {
      case 'bringForward': {
        if (curIdx >= currentOrder.length - 1) return;
        const temp = nextOrder[curIdx];
        nextOrder[curIdx] = nextOrder[curIdx + 1];
        nextOrder[curIdx + 1] = temp;
        break;
      }
      case 'sendBackward': {
        if (curIdx <= 0) return;
        const temp = nextOrder[curIdx];
        nextOrder[curIdx] = nextOrder[curIdx - 1];
        nextOrder[curIdx - 1] = temp;
        break;
      }
      case 'bringToFront': {
        const target = nextOrder[curIdx];
        nextOrder = nextOrder.filter((el) => el.id !== targetElementId);
        nextOrder.push(target);
        break;
      }
      case 'sendToBack': {
        const target = nextOrder[curIdx];
        nextOrder = nextOrder.filter((el) => el.id !== targetElementId);
        nextOrder.unshift(target);
        break;
      }
    }

    const updatedElements: ModularElement[] = nextOrder.map((el, i) => {
      const newZ = (i + 1) * 10;
      const currentPos = el.position || { x: 40, y: 40, rotation: 0 };
      return {
        ...el,
        zIndex: newZ,
        position: {
          ...currentPos,
          x: typeof el.x === 'number' ? el.x : (currentPos.x ?? 40),
          y: typeof el.y === 'number' ? el.y : (currentPos.y ?? 40),
          zIndex: newZ,
        },
      };
    });

    // Directly apply style updates in DOM for instant visual responsiveness
    updatedElements.forEach((el) => {
      const elDom = document.getElementById(`freeform-element-wrapper-${el.id}`);
      if (elDom) {
        elDom.style.zIndex = `${el.zIndex}`;
      }
    });

    // Update state & persist to Cloud
    await handleUpdateElementsInEmptySlide(slideId, updatedElements);
  };

  const handleMoveElementInEmptySlide = async (
    slideId: string,
    elementIndex: number,
    direction: 'up' | 'down'
  ) => {
    let updatedSlideObj: Slide | null = null;
    let nextPagesSnapshot: WebPage[] = [];

    setPages((prevPages) => {
      const next = prevPages.map((page) => {
        if (page.id !== activePageId) return page;
        return {
          ...page,
          slides: page.slides.map((s) => {
            if (s.id !== slideId || !s.elements) return s;
            const nextElements = [...s.elements];
            const targetIndex = direction === 'up' ? elementIndex - 1 : elementIndex + 1;
            if (targetIndex < 0 || targetIndex >= nextElements.length) return s;
            const temp = nextElements[elementIndex];
            nextElements[elementIndex] = nextElements[targetIndex];
            nextElements[targetIndex] = temp;
            const updated: Slide = {
              ...s,
              elements: nextElements,
            };
            updatedSlideObj = updated;
            return updated;
          }),
        };
      });
      nextPagesSnapshot = next;
      return next;
    });

    try {
      if (updatedSlideObj) {
        await saveSlideToFirestore(updatedSlideObj);
      }
      if (nextPagesSnapshot.length > 0) {
        const siteTitle = activeUser.pageTitle || activePage?.title || 'موقعي المهني';
        await saveProjectToFirestore(nextPagesSnapshot, activePageId, siteTitle);
      }
      setLastCloudSavedAt(new Date());
    } catch (err) {
      console.warn('Firebase move element sync notice:', err);
    }
  };

  return (
    <div
      id="workshop-page-view"
      dir="rtl"
      className="flex-1 flex flex-col bg-slate-50 text-slate-900 font-['Cairo',sans-serif] min-h-[calc(100vh-73px)] relative"
    >

      {/* ================= WEELINK PLATFORM TOP WORKSHOP BAR ================= */}
      {isPageEditMode && (
        <header
          id="workshop-top-navbar"
          className={`sticky top-[68px] ${
            isPagesDropdownOpen || isPageToolbarModeDropdownOpen
              ? 'z-[300]'
              : 'z-40 focus-within:z-[300]'
          } w-full bg-white/95 backdrop-blur-md border-b border-slate-200/95 shadow-md px-3 sm:px-6 py-2.5 transition-all text-slate-800`}
        >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Right: Project Pages Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Project Pages Dropdown (قائمة منسدلة لصفحات المشروع) */}
            <div className="relative" ref={pagesDropdownRef}>
              <button
                type="button"
                id="project-pages-dropdown-btn"
                onClick={() => setIsPagesDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-98 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all cursor-pointer group"
                title="قائمة صفحات المشروع - اضغط لتحديد صفحة لعرضها في ساحة المعاينة"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20 transition-transform group-hover:scale-110 shrink-0"
                    style={{ backgroundColor: activePage.colorScheme?.accent || '#38bdf8' }}
                  />
                  <span className="font-bold text-slate-800 max-w-[120px] sm:max-w-[170px] truncate">
                    {activePage.title}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isPagesDropdownOpen ? 'rotate-180 text-blue-500' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Popover */}
              {isPagesDropdownOpen && (
                <div
                  id="project-pages-dropdown-menu"
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xl z-[9999] text-slate-800 animate-in zoom-in-95 fade-in duration-150"
                >
                  <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-bold text-slate-800">صفحات المشروع</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {pages.length} {pages.length === 1 ? 'صفحة' : 'صفحات'}
                    </span>
                  </div>

                  {/* List of Pages */}
                  <div className="max-h-64 overflow-y-auto space-y-1 py-1 custom-scrollbar">
                    {pages.map((p) => {
                      const isSelected = p.id === activePage.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPageFromDropdown(p.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-right transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border border-blue-100 text-blue-700 shadow-xs font-semibold'
                              : 'hover:bg-slate-50 border border-transparent text-slate-600 hover:text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/20"
                              style={{ backgroundColor: p.colorScheme?.accent || '#38bdf8' }}
                            />
                            <div className="flex flex-col min-w-0 text-right">
                              <span className="text-xs font-bold truncate text-slate-700">{p.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                {p.path || '/'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {p.slides.length} شرائح
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add New Page Button */}
                  <div className="pt-2 mt-1.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPagesDropdownOpen(false);
                        setPageModalMode('create');
                        setPageModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة صفحة جديدة للمشروع</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-5 bg-slate-200 hidden sm:block" />

            {/* Undo, Redo & Edit/Preview Mode (ازرار الرجوع والتقدم وزر القلم/المعاينة) */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 shadow-xs">
              <button
                type="button"
                id="workshop-undo-btn"
                onClick={handleUndo}
                disabled={!canUndo}
                className="flex items-center justify-center p-1.5 text-xs text-slate-600 hover:bg-white active:scale-95 rounded-lg transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="الرجوع خطوة (تراجع) - Ctrl+Z"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-slate-200" />

              <button
                type="button"
                id="workshop-redo-btn"
                onClick={handleRedo}
                disabled={!canRedo}
                className="flex items-center justify-center p-1.5 text-xs text-slate-600 hover:bg-white active:scale-95 rounded-lg transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="التقدم خطوة (إعادة) - Ctrl+Y"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-slate-200" />

              {/* زر قلم / معاينة (Edit / Preview Toggle) */}
              <button
                type="button"
                id="workshop-toggle-edit-mode-btn"
                onClick={handleTogglePageEditMode}
                className={`flex items-center justify-center p-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer active:scale-95 ${
                  isPageEditMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-200 text-slate-600 border border-slate-200 shadow-xs'
                }`}
                title={
                  isPageEditMode
                    ? 'تجميد التعديل والعودة لحالة المعاينة (Preview)'
                    : 'وضع صفحة المعاينة كلها قابلة للتعديل (Edit)'
                }
              >
                {isPageEditMode ? (
                  <Eye className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Pen className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              <div className="w-px h-3.5 bg-slate-200" />

              {/* مؤشر دقة العرض القياسية ونسبة الملاءمة (Canva & Wix Style) */}
              <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 rounded-lg px-2 py-1 text-xs select-none">
                <span className="text-[11px] font-mono text-slate-600 font-semibold" dir="ltr">
                  {viewport === 'desktop' ? 'كامل (100%)' : `${targetCanvasWidth}px`}
                </span>
                {viewport !== 'desktop' && (
                  <>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setZoomMode((prev) => (prev === 'fit' ? '100%' : 'fit'))}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                      title="التبديل بين وضع ملاءمة الشاشة (Fit) وحجم 100% الطبيعي"
                    >
                      {zoomMode === 'fit'
                        ? `${Math.round(effectiveScale * 100)}% ملاءمة`
                        : '100% طبيعي'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center: Dynamic Top Toolbar (تعديل الشريحة عند اختيار شريحة أو تعديل الصفحة أو تعديل النص العائم أو تعديل الصورة) */}
          {activeSession ? (
            <TextEditTopBar
              pages={pages}
              activePageId={activePage.id}
              colorScheme={activePage.colorScheme || DEFAULT_COLOR_SCHEME}
            />
          ) : selectedElementInfo && selectedElementInfo.element.type === 'image' ? (
            <ImageEditTopBar
              element={selectedElementInfo.element}
              pages={pages}
              activePageId={activePage.id}
              colorScheme={activeColorScheme}
              onUpdateElement={(updated) =>
                handleUpdateElementInEmptySlide(selectedElementInfo.slideId, updated)
              }
              onDeleteElement={() =>
                handleDeleteElementFromEmptySlide(selectedElementInfo.slideId, selectedElementInfo.element.id)
              }
              onDuplicateElement={() =>
                handleDuplicateElementInSlide(selectedElementInfo.slideId, selectedElementInfo.element.id)
              }
              onLayerAction={(action) =>
                handleLayerActionInSlide(selectedElementInfo.slideId, selectedElementInfo.element.id, action)
              }
              onClose={() =>
                setSelectedElementId(
                  selectedElementInfo.isSubImage && (selectedElementInfo as any).galleryElement
                    ? (selectedElementInfo as any).galleryElement.id
                    : null
                )
              }
              onSwitchToSlideEdit={() => {
                setSelectedElementId(null);
                setSelectedSlideId(selectedElementInfo.slideId);
                setTopToolbarMode('slide');
              }}
              onSwitchToPageEdit={() => {
                setSelectedElementId(null);
                setTopToolbarMode('page');
              }}
            />
          ) : selectedElementInfo && selectedElementInfo.element.type === 'button' ? (
            <ButtonEditTopBar
              element={selectedElementInfo.element}
              pages={pages}
              activePageId={activePage.id}
              colorScheme={activeColorScheme}
              onUpdateElement={(updated) =>
                handleUpdateElementInEmptySlide(selectedElementInfo.slideId, updated)
              }
              onLayerAction={(action) =>
                handleLayerActionInSlide(selectedElementInfo.slideId, selectedElementInfo.element.id, action)
              }
            />
          ) : selectedElementInfo && selectedElementInfo.element.type === 'gallery_5' ? (
            <GalleryEditTopBar
              element={selectedElementInfo.element}
              pages={pages}
              activePageId={activePage.id}
              colorScheme={activeColorScheme}
              onUpdateElement={(updated) =>
                handleUpdateElementInEmptySlide(selectedElementInfo.slideId, updated)
              }
              onLayerAction={(action) =>
                handleLayerActionInSlide(selectedElementInfo.slideId, selectedElementInfo.element.id, action)
              }
              onClose={() => setSelectedElementId(null)}
              onSelectElement={(elementId) => setSelectedElementId(elementId)}
            />
          ) : topToolbarMode === 'navbar' ? (
            <NavbarEditTopBar
              navbarStyle={activePage.navbarStyle || {}}
              colorScheme={activeColorScheme}
              pageTitle={activePage.title}
              onUpdateNavbarStyle={handleUpdateNavbarStyle}
              onSwitchToSlideEdit={() => {
                setTopToolbarMode('slide');
                if (!selectedSlideId && activePage.slides[0]) {
                  setSelectedSlideId(activePage.slides[0].id);
                }
              }}
              onSwitchToPageEdit={() => {
                setTopToolbarMode('page');
              }}
              onClose={() => {
                setTopToolbarMode('slide');
              }}
            />
          ) : topToolbarMode === 'slide' && selectedSlide ? (
            <SlideEditTopBar
              slide={selectedSlide}
              colorScheme={activeColorScheme}
              pageTitle={activePage.title}
              canDelete={activePage.slides.length > 1}
              onUpdateSlideName={(name) => handleUpdateSlideName(selectedSlide.id, name)}
              onUpdateSlideStyle={(styleUpdates) => handleUpdateSlideStyle(selectedSlide.id, styleUpdates)}
              onDuplicateSlide={() => handleDuplicateSlide(selectedSlide.id)}
              onDeleteSlide={() => handleDeleteSlide(selectedSlide.id)}
              onAddSlideBelow={(type) => handleAddSlideBelow(selectedSlide.id, type)}
              onChangeLayout={() => handleChangeSlideLayout(selectedSlide)}
              onSwitchToPageEdit={() => setTopToolbarMode('page')}
              onSwitchToNavbarEdit={() => {
                setSelectedElementId(null);
                setSelectedSlideId(null);
                setTopToolbarMode('navbar');
              }}
            />
          ) : (
            <div
              id="page-inline-edit-toolbar"
              className="flex items-center gap-1 sm:gap-2 bg-black/40 p-1 sm:p-1.5 rounded-xl border border-white/15 shadow-sm text-xs text-white"
            >
              {/* 1. Mode Switcher Dropdown (تعديل الصفحة <-> تعديل الشريحة) */}
              <div className="relative" ref={pageModeDropdownRef}>
                <button
                  type="button"
                  id="page-toolbar-mode-dropdown-btn"
                  onClick={() => setIsPageToolbarModeDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white rounded-lg border border-amber-400/30 transition-all cursor-pointer font-bold text-[11px] sm:text-xs"
                  title="التبديل بين تعديل الصفحة وتعديل الشريحة"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-400" />
                  <span>تعديل الصفحة</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isPageToolbarModeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPageToolbarModeDropdownOpen && (
                  <div
                    id="page-toolbar-mode-popover"
                    className="absolute top-full right-0 mt-2 w-56 bg-white text-gray-900 border border-gray-200 rounded-2xl p-2 shadow-[0_25px_60px_rgba(0,0,0,0.5)] z-[9999] text-right animate-in zoom-in-95 fade-in duration-150"
                  >
                    <div className="px-2 py-1.5 border-b border-gray-100 text-[11px] font-bold text-gray-500">
                      اختر نطاق شريط الأدوات
                    </div>
                    <div className="space-y-1 mt-1">
                      <button
                        type="button"
                        onClick={() => setIsPageToolbarModeDropdownOpen(false)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Pencil className="w-4 h-4 text-amber-600" />
                          <span>تعديل الصفحة الحالية</span>
                        </div>
                        <Check className="w-3.5 h-3.5 text-amber-600" />
                      </button>

                      {selectedSlide && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsPageToolbarModeDropdownOpen(false);
                            setTopToolbarMode('slide');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 text-gray-700 text-xs transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-600" />
                            <span>الانتقال لتعديل الشريحة ({selectedSlide.name || 'الشريحة'})</span>
                          </div>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsPageToolbarModeDropdownOpen(false);
                          setSelectedElementId(null);
                          setSelectedSlideId(null);
                          setTopToolbarMode('navbar');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 text-gray-700 text-xs transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-blue-600" />
                          <span>تعديل نافبار الموقع</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-3.5 bg-white/10" />

              {/* 2. Editable Page Title (مكان يعرض اسم الصفحة يمكن تعديله) */}
              <div className="relative flex items-center group" title="اسم الصفحة - انقر للتعديل المباشر">
                <input
                  type="text"
                  id="toolbar-active-page-title-input"
                  value={activePage.title}
                  onChange={(e) => handleUpdateActivePageTitle(e.target.value)}
                  className="w-20 sm:w-28 md:w-32 px-2 py-1 text-xs font-bold text-white bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/15 focus:border-amber-400 rounded-lg outline-none transition-all text-right truncate"
                  placeholder="اسم الصفحة..."
                />
                <Pencil className="w-2.5 h-2.5 text-gray-400 absolute left-2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="w-px h-3.5 bg-white/10" />

              {/* 3. Color Schemes Popover Button (أيقونة الألوان تعرض الألوان التي يمكن تغييرها) */}
            <div className="relative" ref={colorPickerRef}>
              <button
                type="button"
                id="toolbar-page-colors-btn"
                onClick={() => {
                  setIsColorPickerOpen((prev) => !prev);
                  setIsArrangementPickerOpen(false);
                }}
                className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isColorPickerOpen
                    ? 'bg-white/20 text-amber-300 border-amber-400/50 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
                }`}
                title="تعديل نمط وألوان الصفحة"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white/40 shadow-sm shrink-0"
                  style={{ backgroundColor: activePage.colorScheme?.accent || '#38bdf8' }}
                />
              </button>

              {/* Color Popover Floating on Arena with Pure White Background */}
              {isColorPickerOpen && (
                <div
                  id="toolbar-color-popover"
                  className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-72 sm:w-80 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3 shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.15)] z-[9999] text-right animate-in zoom-in-95 fade-in duration-150"
                  style={{ maxWidth: 'calc(100vw - 32px)' }}
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-gray-900">ألوان الصفحة المعروضة</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 max-w-[110px] truncate">
                      {activePage.colorScheme?.name || 'النمط الحالي'}
                    </span>
                  </div>

                  {/* Tabs: Presets vs Custom */}
                  <div className="flex items-center p-1 bg-gray-100 rounded-xl mb-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setColorPickerTab('presets')}
                      className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] ${
                        colorPickerTab === 'presets'
                          ? 'bg-white text-amber-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>نماذج جاهزة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorPickerTab('custom')}
                      className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] ${
                        colorPickerTab === 'custom'
                          ? 'bg-white text-amber-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      <span>تخصيص لونين</span>
                    </button>
                  </div>

                  {/* Presets List */}
                  {colorPickerTab === 'presets' ? (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                      {PRESET_COLOR_SCHEMES.map((scheme) => {
                        const isSelected = activePage.colorScheme?.id === scheme.id;
                        return (
                          <button
                            key={scheme.id}
                            type="button"
                            onClick={() => handleUpdateActivePageColorScheme(scheme)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl border text-right transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50/80 shadow-sm font-bold'
                                : 'border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1 rtl:space-x-reverse items-center">
                                {scheme.previewColors.map((c, i) => (
                                  <div
                                    key={i}
                                    className="w-4 h-4 rounded-full border border-white shadow-xs"
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-800 font-medium">
                                {scheme.name}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Custom 2-Color Engine */
                    <div className="space-y-2.5 p-2 bg-gray-50 rounded-xl border border-gray-200/80">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block mb-1">
                            اللون الأساسي
                          </label>
                          <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-300 rounded-lg">
                            <input
                              type="color"
                              value={customPrimaryColor}
                              onChange={(e) => {
                                const newP = e.target.value;
                                setCustomPrimaryColor(newP);
                                const scheme = createCustomColorScheme(newP, customAccentColor, 'ألوان مخصصة');
                                handleUpdateActivePageColorScheme(scheme);
                              }}
                              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                            />
                            <span className="text-[10px] font-mono text-gray-700" dir="ltr">
                              {customPrimaryColor}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block mb-1">
                            اللون التمييزي
                          </label>
                          <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-300 rounded-lg">
                            <input
                              type="color"
                              value={customAccentColor}
                              onChange={(e) => {
                                const newA = e.target.value;
                                setCustomAccentColor(newA);
                                const scheme = createCustomColorScheme(customPrimaryColor, newA, 'ألوان مخصصة');
                                handleUpdateActivePageColorScheme(scheme);
                              }}
                              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                            />
                            <span className="text-[10px] font-mono text-gray-700" dir="ltr">
                              {customAccentColor}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Live miniature preview strip */}
                      <div
                        className="p-2 rounded-lg text-center text-[10px] font-bold shadow-xs border transition-all"
                        style={{
                          backgroundColor: customPrimaryColor,
                          color: '#ffffff',
                          borderColor: customAccentColor,
                        }}
                      >
                        معاينة تفاعلية فورية لتناسق الألوان
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-px h-3.5 bg-white/10" />

            {/* 4. Slide Arrangement Popover Button (أيقونة ترتيب الشرائح متداخلة أو مستقيمة) */}
            <div className="relative" ref={arrangementPickerRef}>
              <button
                type="button"
                id="toolbar-page-arrangement-btn"
                onClick={() => {
                  setIsArrangementPickerOpen((prev) => !prev);
                  setIsColorPickerOpen(false);
                }}
                className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isArrangementPickerOpen
                    ? 'bg-white/20 text-purple-300 border-purple-400/50 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border-white/10'
                }`}
                title={`تعديل ترتيب الشرائح (${activePage.arrangement === 'overlapping' ? 'متداخلة' : 'مستقيمة'})`}
              >
                {activePage.arrangement === 'overlapping' ? (
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Rows3 className="w-3.5 h-3.5 text-blue-400" />
                )}
              </button>

              {/* Arrangement Popover Floating on Arena with Pure White Background */}
              {isArrangementPickerOpen && (
                <div
                  id="toolbar-arrangement-popover"
                  className="absolute left-0 sm:left-auto sm:right-1/2 sm:translate-x-1/2 top-full mt-2 w-64 sm:w-72 bg-white text-gray-900 border border-gray-200 rounded-2xl p-3 shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.15)] z-[9999] text-right animate-in zoom-in-95 fade-in duration-150"
                  style={{ maxWidth: 'calc(100vw - 32px)' }}
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-gray-900">ترتيب الشرائح</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Option A: مستقيمة (Straight) */}
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateActivePageArrangement('straight');
                        setIsArrangementPickerOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                        activePage.arrangement === 'straight'
                          ? 'border-blue-500 bg-blue-50/80 shadow-sm font-semibold'
                          : 'border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                        {activePage.arrangement === 'straight' && (
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">مستقيمة (Straight)</span>
                          {activePage.arrangement === 'straight' && (
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 leading-relaxed">
                          شرائح متتالية مستوية تفصل بينها حدود واضحة
                        </span>
                        <div className="mt-2 space-y-1 p-1.5 bg-white rounded border border-gray-200">
                          <div className="h-2 rounded bg-blue-500/20 border border-blue-400/30" />
                          <div className="h-2 rounded bg-blue-500/15 border border-blue-400/30" />
                        </div>
                      </div>
                    </button>

                    {/* Option B: متداخلة (Overlapping) */}
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateActivePageArrangement('overlapping');
                        setIsArrangementPickerOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                        activePage.arrangement === 'overlapping'
                          ? 'border-purple-500 bg-purple-50/80 shadow-sm font-semibold'
                          : 'border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="mt-0.5 w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                        {activePage.arrangement === 'overlapping' && (
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">متداخلة (Overlapping)</span>
                          {activePage.arrangement === 'overlapping' && (
                            <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 leading-relaxed">
                          شرائح متداخلة هرمياً فوق بعضها بزوايا وظلال
                        </span>
                        <div className="mt-2 relative h-6 p-1 bg-white rounded border border-gray-200">
                          <div className="absolute top-1 right-2 left-2 h-2.5 rounded-t bg-purple-300/60" />
                          <div className="absolute top-2.5 right-1.5 left-1.5 h-2.5 rounded-t bg-purple-500/70 shadow-xs" />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
        </header>
      )}

      {/* ================= MAIN WORKSPACE: SIDEBAR + CANVAS ================= */}
      <div
        id="workshop-main-arena"
        className={`flex-1 flex flex-row items-start relative w-full transition-colors duration-300 ${
          isPageEditMode ? 'bg-slate-100/50 min-h-[calc(100vh-122px)]' : 'bg-[#050b18] min-h-[calc(100vh-68px)]'
        }`}
      >
        {/* Right Sidebar Control (لوحة التحكم الجانبية بهيكل الصفحة والمظهر) */}
        {isPageEditMode && !isSidebarCollapsed && (
          <WorkshopSidebarControl
            pages={pages}
            activePageId={activePage.id}
            onSelectPage={(pId) => setActivePageId(pId)}
            onSelectSlide={handleSelectSlide}
            onOpenAddPage={handleOpenAddPage}
            onAddSlide={handleAddSlide}
            onOpenEditPage={handleOpenEditPage}
            onMovePageUp={handleMovePageUp}
            onMovePageDown={handleMovePageDown}
            onDeleteSlide={handleDeleteSlide}
            
            activePage={activePage}
            onUpdateActivePageTitle={handleUpdateActivePageTitle}
            onUpdateActivePageColorScheme={handleUpdateActivePageColorScheme}
            onUpdateActivePageArrangement={handleUpdateActivePageArrangement}
            onToggleCollapse={() => setIsSidebarCollapsed(true)}
          />
        )}

        {/* Floating reopen button when sidebar is collapsed */}
        {isPageEditMode && isSidebarCollapsed && (
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            className="fixed right-3 top-[135px] z-40 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-50 transition-all font-bold text-xs cursor-pointer active:scale-95"
            title="إظهار لوحة التحكم الجانبية"
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>لوحة التحكم</span>
          </button>
        )}

        {/* Center/Left Main Workspace Canvas (ساحة المعاينة) */}
        <main
          ref={previewStageRef}
          id="preview-stage-container"
          className={`flex-1 min-w-0 flex flex-col items-center no-scrollbar transition-all duration-300 ${
            !isPageEditMode ? 'p-0 w-full overflow-x-hidden' : 'p-3 sm:p-6 bg-slate-100/50 pb-32 overflow-x-hidden'
          }`}
          style={!isPageEditMode ? { background: (activePage.colorScheme || DEFAULT_COLOR_SCHEME).bgRadial || '#050b18' } : undefined}
        >
          {/* Compute dynamic page color scheme variables */}
          {(() => {
            const currentScheme = activePage.colorScheme || DEFAULT_COLOR_SCHEME;
            const isDesktop = viewport === 'desktop';
            const isTablet = viewport === 'tablet';

            const pageThemeStyle: React.CSSProperties = {
              ['--theme-primary' as string]: currentScheme.primary,
              ['--theme-accent' as string]: currentScheme.accent,
              ['--theme-bg-radial' as string]: currentScheme.bgRadial || `radial-gradient(ellipse at top, ${currentScheme.previewColors?.[2] || '#0b1c38'} 0%, #050b18 100%)`,
              ['--theme-card-bg' as string]: currentScheme.cardBg || 'rgba(15, 28, 58, 0.85)',
              ['--theme-border' as string]: currentScheme.borderColor || `${currentScheme.accent}33`,
              ['--theme-border-highlight' as string]: currentScheme.borderHighlight || `${currentScheme.accent}80`,
              ['--theme-text-accent' as string]: currentScheme.textAccent || currentScheme.accent,
              ['--theme-glow' as string]: `${currentScheme.primary}40`,
              ['--theme-badge-bg' as string]: `${currentScheme.primary}22`,
              backgroundImage: currentScheme.bgRadial || `radial-gradient(ellipse at top, #0b1c38 0%, #050b18 100%)`,
              width: `${targetCanvasWidth}px`,
              minWidth: `${targetCanvasWidth}px`,
              maxWidth: `${targetCanvasWidth}px`,
              minHeight: !isPageEditMode ? '100vh' : undefined,
            };

            const webpageClasses = !isPageEditMode
              ? isDesktop
                ? 'min-h-screen rounded-none border-0 shadow-none my-0 overflow-x-hidden no-scrollbar w-full'
                : isTablet
                ? 'min-h-[1024px] rounded-3xl border-4 border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.5)] my-6 overflow-x-hidden no-scrollbar'
                : 'min-h-[844px] rounded-[36px] border-[6px] border-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.5)] my-6 overflow-x-hidden no-scrollbar'
              : isDesktop
              ? 'rounded-2xl border border-slate-200/40 shadow-[0_20px_50px_rgba(0,0,0,0.12)] my-2 overflow-visible no-scrollbar'
              : isTablet
              ? 'rounded-3xl border-4 border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.15)] my-2 overflow-visible no-scrollbar'
              : 'rounded-[36px] border-[6px] border-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.18)] my-2 overflow-visible no-scrollbar';

            return (
              <>
                {/* Fixed Canvas Scaling Viewport Outer Wrapper (Canva & Wix Architecture) */}
                <div
                  id="canvas-scale-outer-wrapper"
                  className="flex flex-col items-center w-full"
                  style={{
                    width: '100%',
                    maxWidth: !isPageEditMode && isDesktop ? '100%' : `${Math.round(targetCanvasWidth * effectiveScale)}px`,
                    height: Math.abs(effectiveScale - 1) > 0.005 && canvasContentHeight > 0 ? `${Math.round(canvasContentHeight * effectiveScale)}px` : undefined,
                  }}
                >
                  <div
                    id="canvas-scaling-viewport"
                    className="flex flex-col items-center origin-top transition-transform duration-200"
                    style={{
                      width: `${targetCanvasWidth}px`,
                      minWidth: `${targetCanvasWidth}px`,
                      maxWidth: `${targetCanvasWidth}px`,
                      transform: Math.abs(effectiveScale - 1) > 0.005 ? `scale(${effectiveScale})` : undefined,
                      transformOrigin: 'top center',
                    }}
                  >
                    <div
                      ref={publicWebpageRef}
                      id="future-public-webpage"
                      className={`transition-all duration-300 ${webpageClasses}`}
                      style={pageThemeStyle}
                    >
              {/* Dynamic Theme Engine for Public Webpage - Transforms ALL slides */}
              <style>{`
                /* 1. Page Background & Slide Backgrounds */
                #future-public-webpage {
                  background: var(--theme-bg-radial) !important;
                }
                #future-public-webpage section,
                #future-public-webpage [id^="slide-"] {
                  background: transparent !important;
                  background-image: none !important;
                  border-color: var(--theme-border) !important;
                }
                #future-public-webpage div#page-slides-stream > div:nth-child(even) section {
                  background-color: rgba(0, 0, 0, 0.22) !important;
                  background-image: none !important;
                }

                /* 2. All Boxes, Cards, Panels, and Containers across ALL slides */
                #future-public-webpage .slide-card,
                #future-public-webpage [class*="bg-[#"]:not([class*="inset-0"]):not(img):not(svg),
                #future-public-webpage [class*="from-[#"]:not([class*="inset-0"]):not(img):not(svg),
                #future-public-webpage [class*="bg-slate-900/"],
                #future-public-webpage [class*="bg-gray-900/"] {
                  background: var(--theme-card-bg) !important;
                  background-image: none !important;
                  border-color: var(--theme-border) !important;
                }

                /* Preserve dark vignette on image overlays */
                #future-public-webpage [class*="inset-0"][class*="from-[#"] {
                  --tw-gradient-from: rgba(0, 0, 0, 0.85) var(--tw-gradient-from-position) !important;
                }
                #future-public-webpage [class*="inset-0"][class*="to-[#"] {
                  --tw-gradient-to: rgba(0, 0, 0, 0.85) var(--tw-gradient-to-position) !important;
                }

                /* 3. All Primary & Action Buttons across ALL slides */
                #future-public-webpage [class*="bg-orange-6"],
                #future-public-webpage [class*="bg-orange-5"],
                #future-public-webpage [class*="bg-blue-6"],
                #future-public-webpage [class*="bg-blue-5"],
                #future-public-webpage [class*="bg-purple-6"],
                #future-public-webpage [class*="bg-purple-5"],
                #future-public-webpage [class*="bg-emerald-6"],
                #future-public-webpage [class*="bg-emerald-5"],
                #future-public-webpage [class*="bg-rose-6"],
                #future-public-webpage [class*="bg-rose-5"],
                #future-public-webpage [class*="bg-indigo-6"],
                #future-public-webpage [class*="bg-indigo-5"],
                #future-public-webpage [class*="bg-cyan-6"],
                #future-public-webpage [class*="bg-cyan-5"],
                #future-public-webpage [class*="bg-amber-5"],
                #future-public-webpage [class*="bg-sky-6"],
                #future-public-webpage [class*="bg-sky-5"] {
                  background: var(--theme-primary) !important;
                  background-image: none !important;
                  border-color: var(--theme-border-highlight) !important;
                  color: #ffffff !important;
                }

                /* Button hover feedback */
                #future-public-webpage [class*="hover:bg-orange-"]:hover,
                #future-public-webpage [class*="hover:bg-blue-"]:hover,
                #future-public-webpage [class*="hover:bg-purple-"]:hover,
                #future-public-webpage [class*="hover:bg-emerald-"]:hover,
                #future-public-webpage [class*="hover:bg-rose-"]:hover,
                #future-public-webpage [class*="hover:bg-indigo-"]:hover,
                #future-public-webpage [class*="hover:bg-cyan-"]:hover {
                  filter: brightness(1.16);
                }

                /* 4. All Accent, Subtitle, and Highlight Texts across ALL slides */
                #future-public-webpage [class*="text-orange-"],
                #future-public-webpage [class*="text-amber-"],
                #future-public-webpage [class*="text-emerald-"],
                #future-public-webpage [class*="text-cyan-"],
                #future-public-webpage [class*="text-sky-"],
                #future-public-webpage [class*="text-blue-"],
                #future-public-webpage [class*="text-purple-"],
                #future-public-webpage [class*="text-rose-"],
                #future-public-webpage [class*="text-indigo-"],
                #future-public-webpage [class*="text-teal-"] {
                  color: var(--theme-text-accent) !important;
                }

                /* 5. All Badges, Chips, Pills and Category Tags across ALL slides */
                #future-public-webpage [class*="bg-orange-500/"],
                #future-public-webpage [class*="bg-orange-600/"],
                #future-public-webpage [class*="bg-emerald-500/"],
                #future-public-webpage [class*="bg-rose-500/"],
                #future-public-webpage [class*="bg-indigo-500/"],
                #future-public-webpage [class*="bg-cyan-500/"],
                #future-public-webpage [class*="bg-sky-500/"],
                #future-public-webpage [class*="bg-blue-500/"],
                #future-public-webpage [class*="bg-purple-500/"],
                #future-public-webpage [class*="bg-amber-500/"],
                #future-public-webpage [class*="bg-teal-500/"] {
                  background: var(--theme-badge-bg) !important;
                  background-image: none !important;
                  border-color: var(--theme-border) !important;
                  color: var(--theme-text-accent) !important;
                }

                /* 6. All Colored Borders across ALL slides */
                #future-public-webpage [class*="border-orange-"],
                #future-public-webpage [class*="border-emerald-"],
                #future-public-webpage [class*="border-rose-"],
                #future-public-webpage [class*="border-indigo-"],
                #future-public-webpage [class*="border-cyan-"],
                #future-public-webpage [class*="border-sky-"],
                #future-public-webpage [class*="border-blue-"],
                #future-public-webpage [class*="border-purple-"],
                #future-public-webpage [class*="border-amber-"],
                #future-public-webpage [class*="border-teal-"],
                #future-public-webpage .border-white\\/10,
                #future-public-webpage .border-white\\/15,
                #future-public-webpage .border-white\\/20,
                #future-public-webpage .border-white\\/5 {
                  border-color: var(--theme-border) !important;
                }

                /* Hover on borders */
                #future-public-webpage [class*="hover:border-"]:hover {
                  border-color: var(--theme-border-highlight) !important;
                }

                /* 7. All Gradients (Play buttons, Hero logo rings, CTA gradients) */
                #future-public-webpage [class*="from-orange-"],
                #future-public-webpage [class*="from-blue-"],
                #future-public-webpage [class*="from-purple-"],
                #future-public-webpage [class*="from-emerald-"],
                #future-public-webpage [class*="from-rose-"],
                #future-public-webpage [class*="from-indigo-"],
                #future-public-webpage [class*="from-cyan-"] {
                  --tw-gradient-from: var(--theme-primary) var(--tw-gradient-from-position) !important;
                  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
                }

                #future-public-webpage [class*="to-amber-"],
                #future-public-webpage [class*="to-cyan-"],
                #future-public-webpage [class*="to-purple-"],
                #future-public-webpage [class*="to-teal-"],
                #future-public-webpage [class*="to-rose-"],
                #future-public-webpage [class*="to-orange-"],
                #future-public-webpage [class*="to-blue-"] {
                  --tw-gradient-to: var(--theme-accent) var(--tw-gradient-to-position) !important;
                }

                /* 8. Glowing shadows and Focus rings */
                #future-public-webpage [class*="shadow-orange-"],
                #future-public-webpage [class*="shadow-cyan-"],
                #future-public-webpage [class*="shadow-blue-"],
                #future-public-webpage [class*="shadow-purple-"],
                #future-public-webpage [class*="shadow-emerald-"],
                #future-public-webpage [class*="shadow-rose-"],
                #future-public-webpage [class*="shadow-indigo-"] {
                  --tw-shadow-color: var(--theme-glow) !important;
                }

                #future-public-webpage [class*="ring-orange-"],
                #future-public-webpage [class*="ring-blue-"],
                #future-public-webpage [class*="ring-purple-"],
                #future-public-webpage [class*="ring-emerald-"] {
                  --tw-ring-color: var(--theme-accent) !important;
                }

                /* 9. Styling for slide focus and dimming */
                .slide-dimmed {
                  opacity: 0.28 !important;
                  filter: grayscale(85%) contrast(85%) blur(0.5px) !important;
                  pointer-events: none !important;
                  /* Removed transform scale to avoid layout shift and maintain smooth parallax rendering */
                  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                .slide-editing-focus {
                  position: relative;
                  z-index: 25 !important;
                  /* Removed transform scale to keep layout dimensions 100% stable and smooth */
                  box-shadow: 
                    0 25px 50px -12px rgba(0, 0, 0, 0.7),
                    0 0 0 1.5px rgba(245, 158, 11, 0.45) !important;
                  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                /* رفع ترتيب طبقة الشريحة وحاويتها العائمة فور ظهور لوحة التحكم أو المرور عليها لتطفو فوق شريط التعديل العائم في أعلى الصفحة بالكامل */
                div[id^="slide-wrapper-"]:hover,
                div[id^="slide-wrapper-"]:focus-within,
                div[id^="slide-wrapper-"]:has([data-slide-menu-open="true"]),
                div[id^="slide-container-"]:hover,
                div[id^="slide-container-"]:focus-within,
                div[id^="slide-container-"]:has([data-slide-menu-open="true"]) {
                  z-index: 150 !important;
                }
              `}</style>

              {/* ================= 1. USER'S WEBSITE NAVBAR (نافبار صفحة المستخدم) ================= */}
              {/*
                "اولا اضف نافبار لصفحة المستخدم غير نافبار المنصة هذا سيكون الموجه في صفحته"
              */}
              <UserSiteNavbar
                pages={pages}
                activePageId={activePage.id}
                onSelectPage={(pId) => setActivePageId(pId)}
                user={activeUser}
                isEditMode={isPageEditMode}
                isSelected={isPageEditMode && topToolbarMode === 'navbar'}
                navbarStyle={activePage.navbarStyle}
                onSelectNavbar={() => {
                  setSelectedElementId(null);
                  setSelectedSlideId(null);
                  setTopToolbarMode('navbar');
                }}
                onUpdateNavbarStyle={handleUpdateNavbarStyle}
              />

          {/* ================= 2. THE SLIDES WITH CHOSEN ARRANGEMENT ================= */}
          {/*
            "وترتيب الشرائح فوق بعضها اما بشكل مستقيم اومتداخلة
            شوف الصور حطيت أمثلة هاي الصور فقط مثال الالوان والمحتوى غير معنيين فقط لتوضيح شكل التداخل"
          */}
          <div
            id="page-slides-stream"
            className={`w-full flex flex-col ${
              activePage.arrangement === 'overlapping' ? 'relative pb-16' : 'space-y-0'
            }`}
          >
            {activePage.slides.map((slide, sIdx) => {
              const isOverlapping = activePage.arrangement === 'overlapping';

              // Overlapping styling classes
              const slideWrapperClass = isOverlapping
                ? sIdx === 0
                  ? 'relative z-10'
                  : `-mt-10 sm:-mt-16 md:-mt-20 relative z-[${
                      20 + sIdx * 10
                    }] rounded-t-[32px] sm:rounded-t-[50px] shadow-[0_-25px_60px_rgba(0,0,0,0.85)] border-t border-white/20 overflow-visible`
                : 'relative z-10 border-b border-white/5';

              const isSelected = selectedSlideId === slide.id;
              const isEditReady = isPageEditMode;

              const slideStyle = slide.style || {};
              const isCustomBg = Boolean(!slideStyle.transparent && slideStyle.backgroundColor);
              const isTransparent = Boolean(slideStyle.transparent);
              const isCustomImage = Boolean(slideStyle.backgroundImage);
              const slideColorScheme = slideStyle.colorScheme || currentScheme;
              const isSlideCustomScheme = Boolean(slideStyle.colorScheme);

              const customSlideStyles: React.CSSProperties = {
                ...(isOverlapping && sIdx > 0
                  ? {
                      boxShadow: `0 -25px 60px rgba(0,0,0,0.85)`,
                    }
                  : {}),
                ...(isSlideCustomScheme && slideColorScheme
                  ? {
                      ['--theme-primary' as string]: slideColorScheme.primary,
                      ['--theme-accent' as string]: slideColorScheme.accent,
                      ['--theme-bg-radial' as string]: slideColorScheme.bgRadial || `radial-gradient(ellipse at top, ${slideColorScheme.previewColors?.[2] || '#0b1c38'} 0%, #050b18 100%)`,
                      ['--theme-card-bg' as string]: slideColorScheme.cardBg || 'rgba(15, 28, 58, 0.85)',
                      ['--theme-border' as string]: slideColorScheme.borderColor || `${slideColorScheme.accent}33`,
                      ['--theme-border-highlight' as string]: slideColorScheme.borderHighlight || `${slideColorScheme.accent}80`,
                      ['--theme-text-accent' as string]: slideColorScheme.textAccent || slideColorScheme.accent,
                      ['--theme-glow' as string]: `${slideColorScheme.primary}40`,
                      ['--theme-badge-bg' as string]: `${slideColorScheme.primary}22`,
                    }
                  : {}),
              };

              if (slideStyle.gradientColorStart) {
                const start = slideStyle.gradientColorStart;
                const middle = slideStyle.gradientColorMiddle || start;
                const end = slideStyle.gradientColorEnd || start;
                customSlideStyles.backgroundImage = `linear-gradient(135deg, ${start} 0%, ${middle} 50%, ${end} 100%)`;
              } else if (isCustomBg) {
                customSlideStyles.backgroundColor = slideStyle.backgroundColor;
              } else if (isTransparent) {
                customSlideStyles.backgroundColor = 'transparent';
              } else if (isSlideCustomScheme && slideColorScheme) {
                customSlideStyles.backgroundImage = slideColorScheme.bgRadial || `radial-gradient(ellipse at top, ${slideColorScheme.previewColors?.[2] || '#0b1c38'} 0%, #050b18 100%)`;
              }

              if (slideStyle.backgroundAttachment === 'fixed') {
                customSlideStyles.clipPath = 'inset(0px)';
              }

              if (isCustomImage) {
                // Background image is rendered inside as an absolute or fixed child overlay to support custom opacity and parallax clipping
              }

              if (
                slideStyle.borderWidth !== undefined &&
                slideStyle.borderWidth > 0 &&
                slideStyle.borderStyle &&
                slideStyle.borderStyle !== 'none'
              ) {
                customSlideStyles.borderWidth = `${slideStyle.borderWidth}px`;
                customSlideStyles.borderStyle = slideStyle.borderStyle;
                customSlideStyles.borderColor = slideStyle.borderColor || '#3b82f6';
              }

              // تطبيق شكل الحواف والاستدارة (Border Radius & Corner Shape)
              if (slideStyle.customBorderRadius) {
                customSlideStyles.borderRadius = slideStyle.customBorderRadius;
              } else if (slideStyle.borderRadius !== undefined && slideStyle.borderRadius > 0) {
                customSlideStyles.borderRadius = `${slideStyle.borderRadius}px`;
              }

              // تطبيق الارتفاع المخصص للشريحة
              if (slideStyle.height && slideStyle.height > 0) {
                customSlideStyles.minHeight = `${slideStyle.height}px`;
              }

              return (
                <div
                  key={slide.id}
                  id={`slide-wrapper-${slide.id}`}
                  data-has-custom-bg={isCustomBg || isCustomImage || isSlideCustomScheme ? 'true' : 'false'}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    const isChildElement = Boolean(
                      target.closest('[id^="freeform-element-wrapper-"]') ||
                      target.closest('[data-element-content]')
                    );

                    isManualSelectionRef.current = true;
                    setTimeout(() => {
                      isManualSelectionRef.current = false;
                    }, 750);

                    setSelectedSlideId(slide.id);
                    setTopToolbarMode('slide');

                    if (!isChildElement) {
                      setSelectedElementId(null);
                      if (activeSession) {
                        commitEditing();
                      }
                    }
                  }}
                  className={`${slideWrapperClass} scroll-mt-36 group ${
                    isPageEditMode && isSelected
                      ? 'slide-editing-focus ring-1 ring-amber-400/60 shadow-xl'
                      : isPageEditMode
                      ? 'hover:ring-1 hover:ring-white/20'
                      : ''
                  } hover:!z-[150] group-hover:!z-[150] focus-within:!z-[160] transition-all cursor-pointer relative overflow-visible`}
                  style={customSlideStyles}
                >
                  {/* Absolute Background Image Overlay to support Custom Opacity and Background Attachment */}
                  {isCustomImage && (
                    <div
                      className="pointer-events-none transition-opacity duration-300"
                      style={{
                        position: slideStyle.backgroundAttachment === 'fixed' ? 'fixed' : 'absolute',
                        inset: 0,
                        backgroundImage: `url("${slideStyle.backgroundImage}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        opacity: slideStyle.backgroundImageOpacity !== undefined ? slideStyle.backgroundImageOpacity : 1,
                        filter: slideStyle.backgroundEffect === 'blur' ? 'blur(8px)' : undefined,
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* ================= تأثيرات الخلفية الإضافية (الإضاءة والمؤثرات الفنية) ================= */}
                  {slideStyle.backgroundLightingAngle && slideStyle.backgroundLightingAngle !== 'none' && (
                    <div
                      className="absolute inset-0 pointer-events-none mix-blend-overlay z-[1]"
                      style={{
                        backgroundImage: 
                          slideStyle.backgroundLightingAngle === 'top-left'
                            ? 'radial-gradient(circle at top left, rgba(255,255,255,0.45) 0%, transparent 60%)'
                            : slideStyle.backgroundLightingAngle === 'top-right'
                            ? 'radial-gradient(circle at top right, rgba(255,255,255,0.45) 0%, transparent 60%)'
                            : slideStyle.backgroundLightingAngle === 'center'
                            ? 'radial-gradient(circle at center, rgba(255,255,255,0.45) 0%, transparent 60%)'
                            : slideStyle.backgroundLightingAngle === 'bottom'
                            ? 'radial-gradient(circle at bottom, rgba(255,255,255,0.45) 0%, transparent 60%)'
                            : undefined
                      }}
                    />
                  )}

                  {slideStyle.backgroundEffect === 'grain' && (
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-[0.06] z-[1]" 
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                      }}
                    />
                  )}

                  {slideStyle.backgroundEffect === 'vintage' && (
                    <div 
                      className="absolute inset-0 pointer-events-none z-[1]" 
                      style={{
                        backgroundImage: 'radial-gradient(circle, transparent 50%, rgba(30,15,5,0.4) 100%)',
                        backdropFilter: 'sepia(0.35) saturate(0.85) contrast(1.15)',
                        WebkitBackdropFilter: 'sepia(0.35) saturate(0.85) contrast(1.15)',
                      }}
                    />
                  )}

                  {slideStyle.backgroundEffect === 'glow' && (
                    <div 
                      className="absolute inset-0 pointer-events-none z-[1]" 
                      style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                      }}
                    />
                  )}

                  {slideStyle.backgroundEffect === 'neon' && (
                    <div 
                      className="absolute inset-0 pointer-events-none z-[1]" 
                      style={{
                        backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.15) 100%)',
                        backdropFilter: 'saturate(1.8) contrast(1.1)',
                        WebkitBackdropFilter: 'saturate(1.8) contrast(1.1)',
                      }}
                    />
                  )}

                  {/* شريط أدوات الشريحة - يظهر في وضع التعديل ويطفو فوق كل شيء */}
                  {isPageEditMode && (
                    <SlideActionToolbar
                      slide={slide}
                      isEditReady={isPageEditMode}
                      isSelected={isSelected}
                      onSelectSlide={() => {
                        setSelectedSlideId(slide.id);
                        setTopToolbarMode('slide');
                      }}
                      user={activeUser}
                      colorScheme={slideColorScheme}
                      onDuplicate={() => handleDuplicateSlide(slide.id)}
                      onDelete={() => handleDeleteSlide(slide.id)}
                      canDelete={activePage.slides.length > 1}
                      onAddSlideBelow={(type) => handleAddSlideBelow(slide.id, type)}
                      onChangeLayout={() => handleChangeSlideLayout(slide)}
                      onAddElement={(elem) => handleAddElementToEmptySlide(slide.id, elem)}
                    />
                  )}

                  <EmptySlideView
                    slide={slide}
                    user={activeUser}
                    colorScheme={slideColorScheme}
                    isEditReady={isEditReady}
                    selectedElementId={selectedElementId}
                    onSelectElement={(elemId: string) => setSelectedElementId(elemId)}
                    onSelectSlide={() => {
                      setSelectedSlideId(slide.id);
                      setSelectedElementId(null);
                      if (activeSession) {
                        commitEditing();
                      }
                      setTopToolbarMode('slide');
                    }}
                    onAddElement={(el) => handleAddElementToEmptySlide(slide.id, el)}
                    onDeleteElement={(elId) => handleDeleteElementFromEmptySlide(slide.id, elId)}
                    onUpdateElement={(el) => handleUpdateElementInEmptySlide(slide.id, el)}
                    onUpdateElements={(els) => handleUpdateElementsInEmptySlide(slide.id, els)}
                    onMoveElement={(idx, dir) => handleMoveElementInEmptySlide(slide.id, idx, dir)}
                    onUpdateSlideStyle={(styleUpdates) => handleUpdateSlideStyle(slide.id, styleUpdates)}
                  />
                </div>
              );
            })}
          </div>
            </div>
                </div>
                  </div>
                {/* مساحة إضافية تضمن وصول شريط التمرير إلى آخر نقطة في الصفحة دون أن يقتص أي جزء من الشريحة الأخيرة */}
                {isPageEditMode && <div className="h-[250px] w-full shrink-0 pointer-events-none" />}
              </>
          );
        })()}
        </main>
      </div>

      {/* ================= 4. ADD / EDIT PAGE MODAL ================= */}
      <PageModal
        isOpen={pageModalOpen}
        onClose={() => setPageModalOpen(false)}
        mode={pageModalMode}
        pageToEdit={editingPage}
        canDelete={pages.length > 1}
        onSave={handleSavePageData}
        onDelete={handleDeletePage}
      />

      {/* ================= 5. SLIDE TEMPLATE PICKER MODAL (5 MODELS) ================= */}
      <SlideTemplatePickerModal
        isOpen={templatePickerState.isOpen}
        slideType={templatePickerState.slideType}
        currentVariantId={templatePickerState.currentVariantId || 1}
        isChangingExistingSlide={Boolean(templatePickerState.targetSlideToChangeLayoutId)}
        onClose={() => setTemplatePickerState((prev) => ({ ...prev, isOpen: false }))}
        onSelectTemplate={handleSelectTemplate}
        onSelectVariant={handleSelectTemplate}
      />
    </div>
  );
};
