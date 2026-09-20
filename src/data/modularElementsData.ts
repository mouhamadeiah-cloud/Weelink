import React from 'react';
import {
  Type,
  AlignLeft,
  FileText,
  Image as ImageIcon,
  MousePointerClick,
  CreditCard,
  Images,
  Video,
  Send,
  MapPin,
  Shapes,
  Minus,
  Share2,
  Code,
} from 'lucide-react';
import { ModularElement, ModularElementType, UserRegistrationData, PageColorScheme } from '../types';

export interface AvailableElementOption {
  type: ModularElementType;
  label: string;
  desc: string;
  category: string;
  icon: React.ElementType;
  colorClass: string;
}

export const AVAILABLE_ELEMENT_OPTIONS: AvailableElementOption[] = [
  {
    type: 'text_heading_large',
    label: 'نص عنوان كبير',
    desc: 'عنوان رئيسي عريض للمواضيع',
    category: 'نصوص',
    icon: Type,
    colorClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  },
  {
    type: 'text_heading_medium',
    label: 'نص متوسط',
    desc: 'عنوان فرعي توضيحي للفقرات',
    category: 'نصوص',
    icon: AlignLeft,
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    type: 'text_body_2000',
    label: 'مستند نصي',
    desc: 'صندوق نصي للمحتوى وسرد التفاصيل',
    category: 'نصوص',
    icon: FileText,
    colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  },
  {
    type: 'image',
    label: 'صورة',
    desc: 'صورة افتراضية بتدرجات ألوان الصفحة',
    category: 'وسائط',
    icon: ImageIcon,
    colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    type: 'button',
    label: 'زر',
    desc: 'زر تفاعلي بعنوان زر بدون أي روابط',
    category: 'تفاعل',
    icon: MousePointerClick,
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    type: 'card',
    label: 'بطاقة متكاملة',
    desc: 'بطاقة تجمع الألوان والمستند النصي والزر',
    category: 'تفاعل',
    icon: CreditCard,
    colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    type: 'gallery_5',
    label: 'معرض صور',
    desc: 'معرض مكون من خمس صور متناسقة الألوان',
    category: 'وسائط',
    icon: Images,
    colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    type: 'video',
    label: 'فيديو',
    desc: 'مشغل فيديو تفاعلي بتنسيق الصفحة',
    category: 'وسائط',
    icon: Video,
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    type: 'contact_form',
    label: 'استمارة اتصال',
    desc: 'استمارة مراسلة سريعة مع زر إرسال',
    category: 'تفاعل',
    icon: Send,
    colorClass: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  },
  {
    type: 'google_map',
    label: 'خرائط جوجل',
    desc: 'عرض خريطة جغرافية بتنسيق الصفحة',
    category: 'مواقع',
    icon: MapPin,
    colorClass: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
  {
    type: 'geometric_shape',
    label: 'أشكال هندسية',
    desc: 'كتلة زخرفية بألوان الصفحة',
    category: 'رسوم',
    icon: Shapes,
    colorClass: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30',
  },
  {
    type: 'divider_line',
    label: 'خطوط فاصلة',
    desc: 'خط فاصل أفقي أنيق بألوان الصفحة',
    category: 'تنسيق',
    icon: Minus,
    colorClass: 'text-gray-400 bg-white/5 border-white/15',
  },
  {
    type: 'social_icons',
    label: 'أيقونات تواصل اجتماعي',
    desc: 'أيقونات تواصل تفاعلية بألوان الصفحة',
    category: 'روابط',
    icon: Share2,
    colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  },
  {
    type: 'html_code',
    label: 'مكان للبرمجة HTML',
    desc: 'حاوية كود وتنسيق مخصص',
    category: 'برمجة',
    icon: Code,
    colorClass: 'text-green-400 bg-green-500/10 border-green-500/30',
  },
];

/**
 * Creates a default modular element conforming to:
 * - بدون اسم (title: '')
 * - النص ينزل باسم مستند نصي
 * - الصورة تنزل بصورة افتراضية مجرد الوان
 * - الزر ينزل عنوانه زر بدون اي روابط
 * - كل النصوص والازرار والصور تنزل بنفس تنسيق الصفحة افتراضيا
 */
export function createDefaultModularElement(
  type: ModularElementType,
  user?: UserRegistrationData,
  colorScheme?: PageColorScheme,
  initialPosition?: { x: number; y: number },
  customData?: Record<string, any>,
  customFormatting?: Record<string, any>
): ModularElement {
  const timestamp = Date.now();
  const textAccent = colorScheme?.textAccent || colorScheme?.accent || '#f59e0b';
  const userCity = user?.city || user?.governorate || 'سوريا';

  const textDefaultWidth =
    type === 'text_heading_large'
      ? 220
      : type === 'text_heading_medium'
      ? 170
      : type === 'text_body'
      ? 140
      : type === 'text_body_2000'
      ? 260
      : 440;

  const basePos = {
    x: initialPosition?.x ?? 60,
    y: initialPosition?.y ?? 60,
    width:
      type === 'button'
        ? 180
        : type === 'card'
        ? 380
        : type === 'image'
        ? 340
        : type === 'booking_calendar'
        ? 380
        : type === 'pricing_table'
        ? 420
        : type === 'navigation_menu'
        ? 520
        : type === 'divider_line'
        ? 520
        : type === 'social_icons'
        ? 260
        : type.startsWith('text_')
        ? 'auto'
        : textDefaultWidth,
    height: type === 'button' ? 48 : type.startsWith('text_') ? 'auto' : undefined,
    rotation: 0,
    zIndex: 10,
  };

  let created: ModularElement;

  switch (type) {
    case 'text_heading_large':
      created = {
        id: `el-text-${timestamp}`,
        type,
        title: '', // بدون اسم
        data: {
          text: 'مستند نصي', // النص ينزل باسم مستند نصي
          style: {
            fontSize: '36px',
            fontFamily: 'Cairo, sans-serif',
            color: '#ffffff',
            align: 'right',
            bold: true,
            boxStyle: {
              padding: 8,
              transparent: true,
            },
          },
        },
        formattingStyle: {
          align: 'right',
          color: '#ffffff',
          fontFamily: 'Cairo, sans-serif',
          fontSize: '36px',
          bold: true,
          boxStyle: {
            padding: 8,
            transparent: true,
          },
        },
        width: 'auto',
        height: 'auto',
      };
      break;

    case 'text_heading_medium':
      created = {
        id: `el-text-${timestamp}`,
        type,
        title: '', // بدون اسم
        data: {
          text: 'مستند نصي',
          style: {
            fontSize: '24px',
            fontFamily: 'Cairo, sans-serif',
            color: textAccent,
            align: 'right',
            bold: true,
            boxStyle: {
              padding: 8,
              transparent: true,
            },
          },
        },
        formattingStyle: {
          align: 'right',
          color: textAccent,
          fontFamily: 'Cairo, sans-serif',
          fontSize: '24px',
          bold: true,
          boxStyle: {
            padding: 8,
            transparent: true,
          },
        },
        width: 'auto',
        height: 'auto',
      };
      break;

    case 'text_body':
      created = {
        id: `el-text-${timestamp}`,
        type,
        title: '', // بدون اسم
        data: {
          text: 'مستند نصي',
          style: {
            fontSize: '16px',
            fontFamily: 'Cairo, sans-serif',
            color: '#e5e7eb',
            align: 'right',
            boxStyle: {
              padding: 8,
              transparent: true,
            },
          },
        },
        formattingStyle: {
          align: 'right',
          color: '#e5e7eb',
          fontFamily: 'Cairo, sans-serif',
          fontSize: '16px',
          boxStyle: {
            padding: 8,
            transparent: true,
          },
        },
        width: 'auto',
        height: 'auto',
      };
      break;

    case 'text_body_2000':
      created = {
        id: `el-text-${timestamp}`,
        type,
        title: '', // بدون اسم
        data: {
          text: 'مستند نصي',
          style: {
            fontSize: '16px',
            fontFamily: 'Cairo, sans-serif',
            color: '#e5e7eb',
            align: 'right',
            boxStyle: {
              padding: 8,
              transparent: true,
            },
          },
        },
        formattingStyle: {
          align: 'right',
          color: '#e5e7eb',
          fontFamily: 'Cairo, sans-serif',
          fontSize: '16px',
          boxStyle: {
            padding: 8,
            transparent: true,
          },
        },
        width: 'auto',
        height: 'auto',
      };
      break;

    case 'image':
      created = {
        id: `el-img-${timestamp}`,
        type: 'image',
        title: '', // بدون اسم
        data: {
          isColorPlaceholder: true, // الصورة تنزل بصورة افتراضية مجرد ألوان
          alt: 'ألوان افتراضية',
        },
      };
      break;

    case 'button':
      created = {
        id: `el-btn-${timestamp}`,
        type: 'button',
        title: '', // بدون اسم
        width: 180,
        height: 48,
        data: {
          label: 'زر', // الزر ينزل عنوانه زر
          link: '', // بدون أي روابط
          style: {
            fontSize: '14px',
          },
        },
      };
      break;

    case 'card':
      created = {
        id: `el-card-${timestamp}`,
        type: 'card',
        title: '', // بدون اسم
        data: {
          text: 'مستند نصي',
          buttonLabel: 'زر',
          buttonLink: '',
          isColorPlaceholder: true,
        },
      };
      break;

    case 'gallery_5':
      created = {
        id: `el-gallery-${timestamp}`,
        type: 'gallery_5',
        title: '', // بدون اسم
        data: {
          isColorPlaceholder: true,
        },
      };
      break;

    case 'video':
      created = {
        id: `el-video-${timestamp}`,
        type: 'video',
        title: '', // بدون اسم
        data: {
          isColorPlaceholder: true,
          videoUrl: '',
        },
      };
      break;

    case 'contact_form':
      created = {
        id: `el-contact-${timestamp}`,
        type: 'contact_form',
        title: '', // بدون اسم
        data: {
          buttonLabel: 'زر',
        },
      };
      break;

    case 'google_map':
      created = {
        id: `el-map-${timestamp}`,
        type: 'google_map',
        title: '', // بدون اسم
        data: {
          mapQuery: userCity,
          isColorPlaceholder: true,
        },
      };
      break;

    case 'geometric_shape':
      created = {
        id: `el-shape-${timestamp}`,
        type: 'geometric_shape',
        title: '', // بدون اسم
        data: {
          shapeType: 'circle',
        },
      };
      break;

    case 'divider_line':
      created = {
        id: `el-divider-${timestamp}`,
        type: 'divider_line',
        title: '', // بدون اسم
        data: {},
      };
      break;

    case 'social_icons':
      created = {
        id: `el-social-${timestamp}`,
        type: 'social_icons',
        title: '', // بدون اسم
        data: {},
      };
      break;

    case 'html_code':
      created = {
        id: `el-html-${timestamp}`,
        type: 'html_code',
        title: '', // بدون اسم
        data: {
          htmlCode: '<div style="padding: 12px; text-align: center;">مستند نصي مخصص</div>',
        },
      };
      break;

    case 'booking_calendar':
      created = {
        id: `el-booking-${timestamp}`,
        type: 'booking_calendar',
        title: '',
        data: {
          title: 'حجز موعد واستشارة',
          description: 'اختر الوقت والتاريخ المناسب لحجز موعدك',
          buttonLabel: 'تأكيد الحجز',
          slots: ['10:00 ص', '11:30 ص', '02:00 م', '04:30 م'],
        },
      };
      break;

    case 'pricing_table':
      created = {
        id: `el-pricing-${timestamp}`,
        type: 'pricing_table',
        title: '',
        data: {
          planName: 'الباقة المميزة',
          price: '99',
          period: 'شهرياً',
          features: ['دعم فني متواصل 24/7', 'تخصيص كامل للتصميم', 'إحصائيات متقدمة وتقارير'],
          buttonLabel: 'اشترك الآن',
        },
      };
      break;

    case 'navigation_menu':
      created = {
        id: `el-menu-${timestamp}`,
        type: 'navigation_menu',
        title: '',
        data: {
          links: ['الرئيسية', 'من نحن', 'خدماتنا', 'أعمالنا', 'تواصل معنا'],
        },
      };
      break;

    default:
      created = {
        id: `el-custom-${timestamp}`,
        type,
        title: '', // بدون اسم
        data: {
          text: 'مستند نصي',
        },
      };
      break;
  }

  if (customData) {
    created.data = {
      ...created.data,
      ...customData,
    };
  }

  if (customFormatting) {
    created.formattingStyle = {
      ...(created.formattingStyle || {}),
      ...customFormatting,
    };
    if (created.data) {
      created.data.style = {
        ...(created.data.style || {}),
        ...customFormatting,
      };
    }
  }

  const resolvedPos = created.position || basePos;
  return {
    ...created,
    position: resolvedPos,
    x: resolvedPos.x,
    y: resolvedPos.y,
    width: resolvedPos.width,
    rotation: resolvedPos.rotation,
    zIndex: resolvedPos.zIndex,
  };
}
