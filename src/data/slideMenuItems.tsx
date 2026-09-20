import React from 'react';
import {
  Image as ImageIcon,
  FileText,
  Briefcase,
  Users,
  Tag,
  PhoneCall,
  CreditCard,
  Images,
  Video,
  CalendarCheck,
  AlignLeft,
  PlusSquare,
} from 'lucide-react';
import { SlideType } from '../types';

export interface SlideMenuItem {
  type: SlideType;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export const SLIDE_MENU_ITEMS: SlideMenuItem[] = [
  {
    type: 'intro',
    label: 'Intro',
    desc: 'المقدمة وغلاف الموقع مع العنوان والشعار والزر التفاعلي',
    icon: <ImageIcon className="w-4 h-4 text-blue-400" />,
  },
  {
    type: 'about',
    label: 'من نحن',
    desc: 'النبذة التعريفية وصورة صغيرة ونص حتى 2000 حرف',
    icon: <FileText className="w-4 h-4 text-purple-400" />,
  },
  {
    type: 'works',
    label: 'اعمالنا',
    desc: 'افتراضيا خمس صور صغيرة وخمس نصوص وخمس عناوين متجاورة',
    icon: <Briefcase className="w-4 h-4 text-cyan-400" />,
  },
  {
    type: 'team',
    label: 'فريق العمل',
    desc: 'افتراضيا نص وخمس صور صغيرة ونص اسمي ضمن خمس اشكال هندسية',
    icon: <Users className="w-4 h-4 text-emerald-400" />,
  },
  {
    type: 'offers',
    label: 'عروض',
    desc: 'افتراضيا نص عنوان وتحته نص صغير ومربع نص كبير',
    icon: <Tag className="w-4 h-4 text-rose-400" />,
  },
  {
    type: 'contact',
    label: 'اتصال',
    desc: 'معلومات الاتصال وخريطة جوجل واستمارة التواصل والشبكات',
    icon: <PhoneCall className="w-4 h-4 text-emerald-400" />,
  },
  {
    type: 'pricing',
    label: 'لائحة أسعار',
    desc: 'افتراضيا صورة كبيرة، عنوان، نص صغير شرحي، نص كبير',
    icon: <CreditCard className="w-4 h-4 text-amber-400" />,
  },
  {
    type: 'gallery',
    label: 'معرض الصور',
    desc: 'معرض صور مكون من 5 صور مترابطة ملائمة للاختصاص',
    icon: <Images className="w-4 h-4 text-amber-400" />,
  },
  {
    type: 'video',
    label: 'فيديو',
    desc: 'فيديو تعريفي وتوثيقي مع مشغل تفاعلي',
    icon: <Video className="w-4 h-4 text-rose-400" />,
  },
  {
    type: 'booking',
    label: 'حجز المواعيد',
    desc: 'افتراضيا شريحة منفصلة (سنشرحها ونفصلها فيما بعد)',
    icon: <CalendarCheck className="w-4 h-4 text-indigo-400" />,
  },
  {
    type: 'text_block',
    label: 'شريحة نص',
    desc: 'وفيها نص كبير ورؤية مهنية موسعة',
    icon: <AlignLeft className="w-4 h-4 text-sky-400" />,
  },
  {
    type: 'empty',
    label: 'شريحة فارغة تماماً',
    desc: 'شريحة فارغة بحجم الشرائح مع زر عائم صغير لإضافة العناصر',
    icon: <PlusSquare className="w-4 h-4 text-emerald-400" />,
  },
];
