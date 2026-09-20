import React, { useState, useEffect } from 'react';
import {
  Plus,
  Settings,
  ChevronUp,
  ChevronDown,
  Layers,
  FileText,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Images,
  Video,
  PhoneCall,
  Briefcase,
  Users,
  Tag,
  CreditCard,
  CalendarCheck,
  AlignLeft,
  PlusSquare,
  X,
  Trash2,
  Palette,
  Layout,
  Pencil,
  Check,
  Rows3,
  ChevronRight,
} from 'lucide-react';
import { WebPage, Slide, SlideType, PageColorScheme, SlideArrangement } from '../../types';
import { SLIDE_MENU_ITEMS } from '../../data/slideMenuItems';
import { PRESET_COLOR_SCHEMES, createCustomColorScheme } from '../../data/colorSchemes';

interface WorkshopSidebarControlProps {
  pages: WebPage[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onSelectSlide: (pageId: string, slideId: string, slideType: SlideType) => void;
  onOpenAddPage: () => void;
  onAddSlide: (slideType: SlideType) => void;
  onOpenEditPage: (page: WebPage) => void;
  onMovePageUp: (index: number) => void;
  onMovePageDown: (index: number) => void;
  onDeleteSlide?: (slideId: string) => void;
  
  // Page adjustment props integrated directly into sidebar for ultimate clean UI
  activePage: WebPage;
  onUpdateActivePageTitle: (title: string) => void;
  onUpdateActivePageColorScheme: (scheme: PageColorScheme) => void;
  onUpdateActivePageArrangement: (arrangement: SlideArrangement) => void;
  onToggleCollapse?: () => void;
}

export const WorkshopSidebarControl: React.FC<WorkshopSidebarControlProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onSelectSlide,
  onOpenAddPage,
  onAddSlide,
  onOpenEditPage,
  onMovePageUp,
  onMovePageDown,
  onDeleteSlide,
  
  activePage,
  onUpdateActivePageTitle,
  onUpdateActivePageColorScheme,
  onUpdateActivePageArrangement,
  onToggleCollapse,
}) => {
  const [expandedPageId, setExpandedPageId] = useState<string | null>(activePageId);
  const [isAddSlideOpen, setIsAddSlideOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'structure' | 'branding'>('structure');
  
  // Custom Color States for Branding Tab
  const [colorPickerTab, setColorPickerTab] = useState<'presets' | 'custom'>('presets');
  const [customPrimary, setCustomPrimary] = useState(activePage.colorScheme?.primary || '#2563eb');
  const [customAccent, setCustomAccent] = useState(activePage.colorScheme?.accent || '#f59e0b');

  // Sync color states with activePage
  useEffect(() => {
    if (activePage.colorScheme) {
      setCustomPrimary(activePage.colorScheme.primary || '#2563eb');
      setCustomAccent(activePage.colorScheme.accent || '#f59e0b');
    }
  }, [activePage.id, activePage.colorScheme]);

  useEffect(() => {
    if (activePageId) {
      setExpandedPageId(activePageId);
    }
  }, [activePageId]);

  const handlePageClick = (pageId: string) => {
    onSelectPage(pageId);
    setExpandedPageId((prev) => (prev === pageId ? null : pageId));
  };

  const getSlideIcon = (type: SlideType) => {
    switch (type) {
      case 'intro':
        return <ImageIcon className="w-3.5 h-3.5 text-blue-500" />;
      case 'about':
        return <FileText className="w-3.5 h-3.5 text-purple-500" />;
      case 'works':
        return <Briefcase className="w-3.5 h-3.5 text-cyan-500" />;
      case 'team':
        return <Users className="w-3.5 h-3.5 text-emerald-500" />;
      case 'offers':
        return <Tag className="w-3.5 h-3.5 text-rose-500" />;
      case 'contact':
        return <PhoneCall className="w-3.5 h-3.5 text-teal-500" />;
      case 'pricing':
        return <CreditCard className="w-3.5 h-3.5 text-amber-500" />;
      case 'gallery':
        return <Images className="w-3.5 h-3.5 text-orange-500" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-red-500" />;
      case 'booking':
        return <CalendarCheck className="w-3.5 h-3.5 text-indigo-500" />;
      case 'text_block':
        return <AlignLeft className="w-3.5 h-3.5 text-sky-500" />;
      case 'empty':
        return <PlusSquare className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getSlideTitle = (type: SlideType, defaultName: string) => {
    switch (type) {
      case 'intro':
        return 'المقدمة والغلاف';
      case 'about':
        return 'النبذة التعريفية';
      case 'works':
        return 'أعمالنا وخدماتنا';
      case 'team':
        return 'فريق العمل';
      case 'offers':
        return 'العروض الترويجية';
      case 'contact':
        return 'اتصال ومعلومات الموقع';
      case 'pricing':
        return 'قائمة الأسعار';
      case 'gallery':
        return 'معرض الصور';
      case 'video':
        return 'فيديو تعريفي';
      case 'booking':
        return 'حجز المواعيد';
      case 'text_block':
        return 'كتلة نصية مخصصة';
      case 'empty':
        return 'شريحة فارغة تماماً';
      default:
        return defaultName;
    }
  };

  return (
    <aside
      id="workshop-sidebar-panel"
      dir="rtl"
      className="w-[320px] shrink-0 bg-white border-l border-slate-200/90 flex flex-col sticky top-[122px] h-[calc(100vh-122px)] max-h-[calc(100vh-122px)] overflow-hidden select-none z-30 shadow-xs"
    >
      {/* Sidebar Tabs Switcher (هيكل الصفحة vs تخصيص المظهر والبراند) */}
      <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setSidebarTab('structure')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            sidebarTab === 'structure'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Layers className={`w-3.5 h-3.5 ${sidebarTab === 'structure' ? 'text-blue-500' : 'text-slate-400'}`} />
          <span>هيكل الصفحة</span>
        </button>
        <button
          type="button"
          onClick={() => setSidebarTab('branding')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            sidebarTab === 'branding'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Palette className={`w-3.5 h-3.5 ${sidebarTab === 'branding' ? 'text-amber-500' : 'text-slate-400'}`} />
          <span>مظهر الصفحة</span>
        </button>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer shrink-0"
            title="طي لوحة التحكم لتوسيع مساحة العمل"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab content wrapper */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-12 custom-scrollbar space-y-5 bg-white">
        
        {/* ================= TAB 1: PAGE STRUCTURE (هيكل الصفحة) ================= */}
        {sidebarTab === 'structure' && (
          <div className="space-y-4">
            
            {/* Quick Actions Header: Add page & add slide */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="sidebar-add-page-btn"
                  type="button"
                  onClick={onOpenAddPage}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" />
                  <span>إضافة صفحة</span>
                </button>

                <button
                  id="sidebar-add-slide-btn"
                  type="button"
                  onClick={() => setIsAddSlideOpen((prev) => !prev)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                    isAddSlideOpen
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة شريحة</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Add slide dropdown popup */}
              {isAddSlideOpen && (
                <div
                  id="sidebar-add-slide-dropdown"
                  className="absolute top-full mt-2 inset-x-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 max-h-[280px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between mb-1.5 text-[10px] text-slate-400 font-bold">
                    <span>انقر لإضافة الشريحة للموقع:</span>
                    <button
                      type="button"
                      onClick={() => setIsAddSlideOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {SLIDE_MENU_ITEMS.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          onAddSlide(item.type);
                          setIsAddSlideOpen(false);
                        }}
                        className="w-full p-2 rounded-xl hover:bg-slate-50 transition-colors text-right flex items-start gap-2.5 group cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-blue-50 text-blue-500 shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                              {item.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* List of Pages Accordion */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block px-1">
                تنظيم صفحات الموقع والمسارات:
              </span>
              
              {pages.map((page, idx) => {
                const isActive = page.id === activePageId;
                const isExpanded = expandedPageId === page.id;
                const isFirst = idx === 0;
                const isLast = idx === pages.length - 1;

                return (
                  <div
                    key={page.id}
                    className={`p-2.5 rounded-2xl border transition-all duration-200 ${
                      isActive
                        ? 'border-blue-200 bg-blue-50/20 shadow-xs'
                        : 'border-slate-100 bg-slate-50/20 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handlePageClick(page.id)}
                        className="flex-1 flex items-center gap-2 text-right min-w-0 cursor-pointer"
                      >
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs"
                          style={{
                            backgroundColor: page.colorScheme?.primary || '#3b82f6',
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-700 block truncate">
                            {page.title}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </button>

                      {/* Sorting and settings gear */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMovePageUp(idx);
                          }}
                          className={`p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none`}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMovePageDown(idx);
                          }}
                          className={`p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none`}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEditPage(page);
                          }}
                          className="p-1 rounded text-blue-500 hover:bg-blue-50"
                          title="إعدادات الصفحة"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Slides nested list */}
                    {isExpanded && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        {page.slides.map((slide, sIdx) => (
                          <div
                            key={slide.id}
                            className="w-full flex items-center justify-between p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-100/60 hover:border-slate-200 transition-all group"
                          >
                            <button
                              type="button"
                              onClick={() => onSelectSlide(page.id, slide.id, slide.type)}
                              className="flex items-center gap-2 min-w-0 flex-1 text-right cursor-pointer"
                            >
                              <span className="w-4 h-4 rounded-md bg-slate-50 flex items-center justify-center text-[9px] font-bold text-slate-400 group-hover:text-blue-500 shrink-0">
                                {sIdx + 1}
                              </span>
                              <div className="shrink-0">{getSlideIcon(slide.type)}</div>
                              <span className="text-[11px] text-slate-600 font-medium truncate">
                                {getSlideTitle(slide.type, slide.name)}
                              </span>
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              {page.slides.length > 1 && onDeleteSlide && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSlide(slide.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                  title="حذف الشريحة"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onSelectSlide(page.id, slide.id, slide.type)}
                                className="text-[10px] text-blue-500 font-bold opacity-0 group-hover:opacity-100 cursor-pointer"
                              >
                                عرض
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: BRANDING & GENERAL SETTINGS (المظهر والتعديلات الأساسية) ================= */}
        {sidebarTab === 'branding' && (
          <div className="space-y-4">
            
            {/* Section A: Page Title */}
            <div className="space-y-1.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/30">
              <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Pencil className="w-3 h-3 text-slate-400" />
                <span>عنوان الصفحة الحالية:</span>
              </label>
              <input
                type="text"
                value={activePage.title}
                onChange={(e) => onUpdateActivePageTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all"
                placeholder="عنوان الصفحة مثل: من نحن، خدماتنا..."
              />
            </div>

            {/* Section B: Slide Arrangement */}
            <div className="space-y-2 p-3 rounded-2xl border border-slate-100 bg-slate-50/30">
              <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1.5">
                <Layout className="w-3 h-3 text-slate-400" />
                <span>نمط عرض وترتيب الشرائح:</span>
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateActivePageArrangement('straight')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer gap-1.5 ${
                    activePage.arrangement === 'straight'
                      ? 'border-blue-500 bg-blue-50/30 text-blue-600 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Rows3 className="w-4 h-4" />
                  <span className="text-[10px]">مستقيم (Straight)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateActivePageArrangement('overlapping')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer gap-1.5 ${
                    activePage.arrangement === 'overlapping'
                      ? 'border-blue-500 bg-blue-50/30 text-blue-600 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-[10px]">متداخل (Overlap)</span>
                </button>
              </div>
              <p className="text-[9px] text-slate-400 text-center leading-relaxed mt-1">
                {activePage.arrangement === 'overlapping'
                  ? 'تمكين التداخل الهرمي الجذاب للشرائح بزوايا وظلال فخمة'
                  : 'عرض الشرائح العادية متراصة تحت بعضها بشكل مستقيم ومريح'}
              </p>
            </div>

            {/* Section C: Theme Colors */}
            <div className="space-y-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/30">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span>لوحة ألوان المظهر:</span>
                </label>
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  {activePage.colorScheme?.name || 'مخصص'}
                </span>
              </div>

              {/* Sub-tabs: presets vs custom */}
              <div className="flex p-0.5 bg-slate-100 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setColorPickerTab('presets')}
                  className={`flex-1 py-1 px-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    colorPickerTab === 'presets'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>تدرجات جاهزة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setColorPickerTab('custom')}
                  className={`flex-1 py-1 px-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    colorPickerTab === 'custom'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Sliders className="w-3 h-3 text-blue-500" />
                  <span>تخصيص كامل</span>
                </button>
              </div>

              {colorPickerTab === 'presets' ? (
                <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-0.5 custom-scrollbar">
                  {PRESET_COLOR_SCHEMES.map((scheme) => {
                    const isSelected = activePage.colorScheme?.id === scheme.id;
                    return (
                      <button
                        key={scheme.id}
                        type="button"
                        onClick={() => onUpdateActivePageColorScheme(scheme)}
                        className={`w-full flex items-center justify-between p-1.5 rounded-xl border text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/20 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1 rtl:space-x-reverse items-center">
                            {scheme.previewColors.map((c, i) => (
                              <div
                                key={i}
                                className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-700">
                            {scheme.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-blue-500" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Custom Picker */
                <div className="space-y-2 p-1 bg-white rounded-xl border border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 text-center">
                        اللون الأساسي
                      </label>
                      <div className="flex items-center justify-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-lg">
                        <input
                          type="color"
                          value={customPrimary}
                          onChange={(e) => {
                            const newP = e.target.value;
                            setCustomPrimary(newP);
                            const scheme = createCustomColorScheme(newP, customAccent, 'ألوان مخصصة');
                            onUpdateActivePageColorScheme(scheme);
                          }}
                          className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="text-[9px] font-mono text-slate-600" dir="ltr">
                          {customPrimary}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 text-center">
                        اللون التمييزي
                      </label>
                      <div className="flex items-center justify-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-lg">
                        <input
                          type="color"
                          value={customAccent}
                          onChange={(e) => {
                            const newA = e.target.value;
                            setCustomAccent(newA);
                            const scheme = createCustomColorScheme(customPrimary, newA, 'ألوان مخصصة');
                            onUpdateActivePageColorScheme(scheme);
                          }}
                          className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <span className="text-[9px] font-mono text-slate-600" dir="ltr">
                          {customAccent}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center shrink-0">
        <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
          منصة weelink • ورشة العمل الذكية
        </p>
      </div>
    </aside>
  );
};
