import React from 'react';
import { X, Check, Sparkles, Navigation, Layers, Compass, Pill, LayoutGrid, SplitSquareVertical, SlidersHorizontal, Eye } from 'lucide-react';
import { NavbarStyle, PageColorScheme } from '../../types';

export interface NavbarTemplatePreset {
  id: number;
  name: string;
  badge: string;
  description: string;
  style: Partial<NavbarStyle>;
}

export const NAVBAR_TEMPLATES: NavbarTemplatePreset[] = [
  {
    id: 1,
    name: 'النموذج الكلاسيكي المتوازن',
    badge: 'الأكثر شيوعاً',
    description: 'شعار وعنوان وتخصص يميناً، روابط نصوص أنيقة في المنتصف، وزر اتصال بارز يساراً.',
    style: {
      layoutVariant: 1,
      borderRadius: 0,
      borderWidth: 1,
      borderStyle: 'solid',
      shadow: 'soft',
      isSticky: true,
      navItemStyle: 'text',
      backgroundOpacity: 0.95,
      backdropBlur: 'md',
    },
  },
  {
    id: 2,
    name: 'الكبسولة العائمة الزجاجية',
    badge: 'طافي ومستدير',
    description: 'شريط كبسولة طافي بحواف دائرية كاملة وإطار زجاجي رقيق يبتعد عن أطراف الشاشة.',
    style: {
      layoutVariant: 2,
      borderRadius: 9999,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadow: 'medium',
      isSticky: true,
      navItemStyle: 'text',
      backgroundOpacity: 0.85,
      backdropBlur: 'lg',
    },
  },
  {
    id: 3,
    name: 'أيقونات ذكية مع نصوص',
    badge: 'ذكي وتفاعلي',
    description: 'كل صفحة تمثلها أيقونة معبرة بجانب عنوان الصفحة لتسهيل التصفح البصري السريع.',
    style: {
      layoutVariant: 3,
      borderRadius: 16,
      borderWidth: 1,
      shadow: 'soft',
      isSticky: true,
      navItemStyle: 'both',
      backgroundOpacity: 0.9,
      backdropBlur: 'md',
    },
  },
  {
    id: 4,
    name: 'شريط الدوك المدمج (Icon Dock)',
    badge: 'أسلوب Dock',
    description: 'روابط الصفحات كأيقونات دائرية أنيقة وموجزة مع تلميح نصي وشعار متصل.',
    style: {
      layoutVariant: 4,
      borderRadius: 24,
      borderWidth: 1,
      shadow: 'medium',
      isSticky: true,
      navItemStyle: 'icon',
      backgroundOpacity: 0.92,
      backdropBlur: 'lg',
    },
  },
  {
    id: 5,
    name: 'التقسيم الهندسي الثنائي',
    badge: 'هندسي حاد',
    description: 'كتلة شعار مميزة مفصولة بخطوط عمودية صلبة، مع تباين واضح للمساحات والأزرار.',
    style: {
      layoutVariant: 5,
      borderRadius: 0,
      borderWidth: 2,
      borderStyle: 'solid',
      shadow: 'none',
      isSticky: true,
      navItemStyle: 'text',
      backgroundOpacity: 1.0,
      backdropBlur: 'none',
    },
  },
  {
    id: 6,
    name: 'الخط النيون العصري',
    badge: 'إضاءة نيون',
    description: 'خط سفلي متوهج بإضاءة نيون مستمرة وناعمة مع إبراز الروابط المتفاعلة برقي.',
    style: {
      layoutVariant: 6,
      borderRadius: 0,
      borderWidth: 1,
      lightingEffect: 'neon-border',
      shadow: 'glow',
      isSticky: true,
      navItemStyle: 'text',
      backgroundOpacity: 0.9,
      backdropBlur: 'md',
    },
  },
  {
    id: 7,
    name: 'الجزيرة المتركزة (Centered Logo)',
    badge: 'تناظر فاخر',
    description: 'الشعار يتوسط النافبار تماماً مع توزيع روابط الصفحات بالتساوي على اليمين واليسار.',
    style: {
      layoutVariant: 7,
      borderRadius: 16,
      borderWidth: 1,
      shadow: 'soft',
      isSticky: true,
      navItemStyle: 'text',
      backgroundOpacity: 0.9,
      backdropBlur: 'md',
    },
  },
  {
    id: 8,
    name: 'الزجاج المضبب الفائق (Frosted Glass)',
    badge: 'زجاجي ثلجي',
    description: 'تأثير بلوري ثلجي كثيف (Frosted Glass) مع انعكاس رقيق لحدود بيضاء شفافة.',
    style: {
      layoutVariant: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
      shadow: 'medium',
      isSticky: true,
      navItemStyle: 'text',
      backgroundOpacity: 0.5,
      backdropBlur: 'xl',
    },
  },
  {
    id: 9,
    name: 'التبويبات المقسمة (Segmented Tabs)',
    badge: 'تبويبات تحكم',
    description: 'روابط الصفحات مجمعة داخل كبسولة تبويبات مشتركة متصلة بنمط لوحات التحكم الحديثة.',
    style: {
      layoutVariant: 9,
      borderRadius: 16,
      borderWidth: 1,
      shadow: 'soft',
      isSticky: true,
      navItemStyle: 'pill',
      backgroundOpacity: 0.95,
      backdropBlur: 'md',
    },
  },
  {
    id: 10,
    name: 'الأناقة التيبوغرافية الحرة',
    badge: 'بسيط وخفيف',
    description: 'تصميم فائق البساطة يركز على جماليات الخطوط والمسافات النقية بدون إطارات ثقيلة.',
    style: {
      layoutVariant: 10,
      borderRadius: 0,
      borderWidth: 0,
      shadow: 'none',
      isSticky: true,
      navItemStyle: 'text',
      backgroundOpacity: 0.2,
      backdropBlur: 'sm',
    },
  },
];

interface NavbarTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVariant?: number;
  colorScheme: PageColorScheme;
  onSelectTemplate: (template: NavbarTemplatePreset) => void;
}

export const NavbarTemplatesModal: React.FC<NavbarTemplatesModalProps> = ({
  isOpen,
  onClose,
  currentVariant = 1,
  colorScheme,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="navbar-templates-modal-backdrop"
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="navbar-templates-modal-container"
        dir="rtl"
        className="bg-white text-gray-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{
                background: `linear-gradient(135deg, ${colorScheme?.primary || '#2563eb'}, ${colorScheme?.accent || '#38bdf8'})`,
              }}
            >
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>تنسيقات نافبار الموقع المقترحة</span>
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
                  10 أشكال احترافية
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                اختر التصميم والشكل الهندسي الأنسب لموقعك مع توزيع الروابط والشعار
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 10 Grid Layout Cards */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 no-scrollbar bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NAVBAR_TEMPLATES.map((tmpl) => {
              const isSelected = currentVariant === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  className={`group relative flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer text-right bg-white hover:shadow-lg ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-gray-200/80 hover:border-blue-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                        }`}
                      >
                        {tmpl.id}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {tmpl.name}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {tmpl.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    {tmpl.description}
                  </p>

                  {/* Visual Blueprint Preview */}
                  <div className="mt-auto bg-slate-900 p-2.5 rounded-xl border border-slate-800 shadow-inner flex items-center justify-between text-[10px] text-gray-300 select-none">
                    {/* Visual schematic representing the layout */}
                    {tmpl.id === 2 ? (
                      // Floating Pill Preview
                      <div className="w-full bg-slate-800/90 border border-white/20 rounded-full px-3 py-1 flex items-center justify-between">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                        <div className="flex gap-2 text-[9px] text-gray-300">
                          <span className="text-blue-400 font-bold">الرئيسية</span>
                          <span>من نحن</span>
                          <span>الخدمات</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-[8px] text-white">اتصل</span>
                      </div>
                    ) : tmpl.id === 3 ? (
                      // Icon + Text Preview
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-blue-500" />
                          <span className="font-bold text-white text-[9px]">الموقع</span>
                        </div>
                        <div className="flex gap-2 text-[9px]">
                          <span className="flex items-center gap-0.5 text-blue-400 font-bold">🏠 رئيسية</span>
                          <span className="flex items-center gap-0.5 text-gray-400">✨ خدمات</span>
                        </div>
                        <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                      </div>
                    ) : tmpl.id === 4 ? (
                      // Compact Icon Dock
                      <div className="w-full flex items-center justify-between">
                        <div className="w-3 h-3 rounded bg-blue-500" />
                        <div className="flex gap-1.5 bg-slate-800 px-2 py-0.5 rounded-full border border-white/10">
                          <div className="w-3 h-3 rounded-full bg-blue-600" />
                          <div className="w-3 h-3 rounded-full bg-slate-700" />
                          <div className="w-3 h-3 rounded-full bg-slate-700" />
                        </div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      </div>
                    ) : tmpl.id === 6 ? (
                      // Neon Line Preview
                      <div className="w-full flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-400 font-bold text-[9px]">الهوية النيون</span>
                          <div className="flex gap-2 text-[9px] text-gray-300">
                            <span>الرئيسية</span>
                            <span>الخدمات</span>
                          </div>
                        </div>
                        <div className="w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                      </div>
                    ) : tmpl.id === 7 ? (
                      // Centered Logo Preview
                      <div className="w-full flex items-center justify-between">
                        <div className="flex gap-2 text-[9px]">
                          <span className="text-blue-400 font-bold">الرئيسية</span>
                          <span>من نحن</span>
                        </div>
                        <div className="w-4 h-4 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-[8px] shadow">
                          W
                        </div>
                        <div className="flex gap-2 text-[9px]">
                          <span>الخدمات</span>
                          <span className="text-emerald-400">اتصل</span>
                        </div>
                      </div>
                    ) : tmpl.id === 8 ? (
                      // Frosted Glass Preview
                      <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-2 py-1 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-white">زجاج بلوري</span>
                        <div className="flex gap-1.5 text-[8px] text-gray-200">
                          <span className="bg-white/20 px-1.5 py-0.5 rounded">رئيسية</span>
                          <span>أعمالنا</span>
                        </div>
                      </div>
                    ) : tmpl.id === 9 ? (
                      // Segmented Tabs Preview
                      <div className="w-full flex items-center justify-between">
                        <span className="text-[9px] font-bold text-white">شعار</span>
                        <div className="bg-slate-800 p-0.5 rounded-lg border border-white/10 flex gap-0.5 text-[8px]">
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded">رئيسية</span>
                          <span className="text-gray-400 px-2 py-0.5">من نحن</span>
                        </div>
                        <span className="text-[8px] text-emerald-400">تواصل</span>
                      </div>
                    ) : (
                      // Classic Modern / Standard Preview
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded bg-blue-600" />
                          <span className="font-bold text-white text-[9px]">العلامة</span>
                        </div>
                        <div className="flex gap-2 text-[8px] text-gray-300">
                          <span className="text-blue-400 font-bold">الرئيسية</span>
                          <span>من نحن</span>
                          <span>الخدمات</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-600 text-[8px] text-white">اتصل</span>
                      </div>
                    )}
                  </div>

                  {/* Active Indicator Checkmark */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1.5 text-gray-500 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>يمكنك تخصيص الألوان والشفافية والإطارات لأي نموذج تفرده لاحقاً.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
