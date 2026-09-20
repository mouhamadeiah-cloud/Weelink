import React from 'react';
import {
  Type,
  AlignLeft,
  FileText,
  Image as ImageIcon,
  Square,
  Shapes,
  MapPin,
  Images,
  Send,
  Video,
  Minus,
  Code,
  Share2,
  Check,
  X,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { ModularElementType } from '../../types';

interface ModularCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSlide: (slideId: string) => void;
}

interface ComponentItem {
  id: ModularElementType | string;
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  slidesUsed: string[];
}

export const MODULAR_ELEMENTS_CATALOG: ComponentItem[] = [
  {
    id: 'text_heading_large',
    category: 'النصوص',
    title: '١. نص عنوان كبير',
    description: 'خط عريض وبارز للعناوين الرئيسية للشرائح والصفحات',
    icon: <Type className="w-4 h-4 text-orange-400" />,
    slidesUsed: ['Intro', 'من نحن', 'معرض الصور', 'فيديو', 'معلومات الاتصال'],
  },
  {
    id: 'text_heading_medium',
    category: 'النصوص',
    title: '٢. نص متوسط',
    description: 'عناوين فرعية وتوضيحية للمهنة والاختصاص والفقرات',
    icon: <AlignLeft className="w-4 h-4 text-amber-400" />,
    slidesUsed: ['Intro', 'معرض الصور', 'فيديو'],
  },
  {
    id: 'text_body_2000',
    category: 'النصوص',
    title: '٣. نص شرحي (حتى 2000 حرف)',
    description: 'صندوق نصي واسع للمحتوى التعريفي وسرد الخبرات والخدمات',
    icon: <FileText className="w-4 h-4 text-yellow-400" />,
    slidesUsed: ['من نحن', 'معلومات الاتصال'],
  },
  {
    id: 'image',
    category: 'الوسائط',
    title: 'صورة',
    description: 'صورة غلاف ملائمة، صورة صغيرة، ولوغو معلق بأسلوب فيسبوك',
    icon: <ImageIcon className="w-4 h-4 text-blue-400" />,
    slidesUsed: ['Intro', 'من نحن'],
  },
  {
    id: 'button',
    category: 'التفاعل',
    title: 'زر',
    description: 'أزرار اتخاذ الإجراء والتواصل والحجز السريع',
    icon: <Square className="w-4 h-4 text-emerald-400" />,
    slidesUsed: ['Intro', 'استمارة الاتصال'],
  },
  {
    id: 'geometric_shape',
    category: 'العناصر الرسومية',
    title: 'أشكال هندسية',
    description: 'خلفيات زخرفية، أطر دائرية ومنحنية بصرية معيارية',
    icon: <Shapes className="w-4 h-4 text-purple-400" />,
    slidesUsed: ['Intro', 'من نحن'],
  },
  {
    id: 'google_map',
    category: 'المواقع',
    title: 'خرائط جوجل',
    description: 'إحداثيات جغرافية دقيقة لموقع النشاط في المحافظات والمدن السورية',
    icon: <MapPin className="w-4 h-4 text-red-400" />,
    slidesUsed: ['معلومات الاتصال'],
  },
  {
    id: 'gallery_5',
    category: 'المعارض',
    title: 'معرض الصور (5 صور مترابطة)',
    description: 'مجموعة متكاملة من خمس صور مهنية مترابطة مع تكبير Lightbox',
    icon: <Images className="w-4 h-4 text-cyan-400" />,
    slidesUsed: ['معرض الصور'],
  },
  {
    id: 'contact_form',
    category: 'التفاعل',
    title: 'استمارة اتصال',
    description: 'معلومات عن المرسل + مربع نصي تفصيلي + زر إرسال فوري',
    icon: <Send className="w-4 h-4 text-orange-400" />,
    slidesUsed: ['معلومات الاتصال'],
  },
  {
    id: 'video',
    category: 'الوسائط',
    title: 'فيديو',
    description: 'مكان مخصص لمقطع فيديو تعريفي وتوثيقي مع غلاف مشغل',
    icon: <Video className="w-4 h-4 text-rose-400" />,
    slidesUsed: ['فيديو'],
  },
  {
    id: 'divider_line',
    category: 'التنسيق',
    title: 'خطوط طولية وعرضية',
    description: 'فواصل خطية قياسية تفصل الشرائح والمحتويات',
    icon: <Minus className="w-4 h-4 text-gray-400" />,
    slidesUsed: ['من نحن', 'فيديو'],
  },
  {
    id: 'html_code',
    category: 'البرمجة',
    title: 'مكان للبرمجة HTML',
    description: 'حاوية قياسية لتضمين كود التذييل وحقوق المنصة أو كود مخصص',
    icon: <Code className="w-4 h-4 text-emerald-300" />,
    slidesUsed: ['معلومات الاتصال (شريط حقوق Weelink)'],
  },
  {
    id: 'social_icons',
    category: 'الروابط',
    title: 'أيقونات ربط بوسائل التواصل',
    description: 'أيقونات تواصل تفاعلية (واتساب، فيسبوك، انستغرام، لينكدإن، هاتف)',
    icon: <Share2 className="w-4 h-4 text-sky-400" />,
    slidesUsed: ['معلومات الاتصال'],
  },
];

export const ModularCatalogModal: React.FC<ModularCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectSlide,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modular-catalog-modal"
      data-modal-portal="true"
      data-catalog-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
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
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto modular-catalog-modal"
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-3xl bg-[#fafbfc] border border-slate-200/90 p-6 sm:p-8 shadow-2xl my-8 modular-catalog-modal text-slate-800"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center border border-slate-200/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              القطع والمكونات المعيارية (Modulare Elemente)
            </h3>
            <p className="text-xs text-slate-500">
              العناصر الثابتة المعيارية التي تشكل منها شرائح الصفحة الأولى في Weelink
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 mb-6 text-xs text-blue-800 flex items-center justify-between">
          <span>✓ هذه العناصر هي المكونات الحصرية لكل الشرائح ولا يمكن استخدام غيرها في هذا التصميم الأولي.</span>
          <span className="font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200">11 قطعة معيارية</span>
        </div>

        {/* 5 Slides Quick Navigation */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-slate-500 block mb-2">الشرائح الخمس المبنية:</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'slide-intro', title: '1. شريحة Intro' },
              { id: 'slide-about', title: '2. من نحن' },
              { id: 'slide-gallery', title: '3. معرض الصور' },
              { id: 'slide-video', title: '4. فيديو' },
              { id: 'slide-contact', title: '5. الاتصال والحقوق' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onClose();
                  onSelectSlide(s.id);
                }}
                className="p-2 text-center rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all cursor-pointer"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {MODULAR_ELEMENTS_CATALOG.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400/60 shadow-2xs hover:shadow-sm transition-all text-right space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">{item.icon}</div>
              </div>
              <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
              <div className="pt-1 flex items-center gap-1 flex-wrap text-[10px] text-slate-400">
                <span className="text-slate-400 font-medium">مستخدم في:</span>
                {item.slidesUsed.map((sl, i) => (
                  <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/50">
                    {sl}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            العودة لساحة المعاينة
          </button>
        </div>
      </div>
    </div>
  );
};
