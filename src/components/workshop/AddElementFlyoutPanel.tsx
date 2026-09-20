import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';
import {
  Type,
  Image as ImageIcon,
  MousePointerClick,
  Shapes,
  CreditCard,
  Images,
  Video,
  Send,
  MapPin,
  Calendar,
  Receipt,
  Share2,
  Menu as MenuIcon,
  Code,
  Search,
  X,
  Sparkles,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Phone,
  MessageCircle,
  Compass,
  Tag,
  Clock,
  UserCheck,
  DollarSign,
  Globe,
  Award,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ModularElement,
  ModularElementType,
  UserRegistrationData,
  PageColorScheme,
} from '../../types';
import { createDefaultModularElement } from '../../data/modularElementsData';

export interface AddElementFlyoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddElement: (element: ModularElement) => void;
  user?: UserRegistrationData;
  colorScheme?: PageColorScheme;
  slideTitle?: string;
}

// 14 Categories as specified by user
export type ElementCategoryKey =
  | 'text'
  | 'image'
  | 'button'
  | 'shapes_grafik'
  | 'cards'
  | 'gallery'
  | 'video'
  | 'contact_form'
  | 'google_map'
  | 'bookings'
  | 'pricing'
  | 'social'
  | 'menu'
  | 'html';

interface CategoryNavDefinition {
  id: ElementCategoryKey;
  label: string;
  icon: React.ElementType;
  badge?: string;
  description: string;
}

const CATEGORIES: CategoryNavDefinition[] = [
  { id: 'text', label: 'نصوص', icon: Type, description: 'عناوين، نصوص بتأثيرات، ومقاطع مركبة' },
  { id: 'image', label: 'صور', icon: ImageIcon, description: 'صور مخصصة، دائرية، ومكتبة Unsplash' },
  { id: 'button', label: 'أزرار', icon: MousePointerClick, description: 'أزرار أساسية، متدرجة، نيون، وشبحية' },
  { id: 'shapes_grafik', label: 'أشكال وجرافيك', icon: Shapes, description: 'أشكال هندسية، شارات، ورسوميات فكتور' },
  { id: 'cards', label: 'بطاقات', icon: CreditCard, description: 'بطاقات خدمات، محتوى، وبروفايل' },
  { id: 'gallery', label: 'معرض صور', icon: Images, description: 'معارض خماسية، شبكات صور، وشرائح' },
  { id: 'video', label: 'فيديو', icon: Video, description: 'مشغل فيديو تفاعلي ويوتيوب' },
  { id: 'contact_form', label: 'استمارة تواصل', icon: Send, description: 'مراسلة سريعة وحقول طلب واستفسار' },
  { id: 'google_map', label: 'خرائط جوجل', icon: MapPin, description: 'خريطة تفاعلية وموقع المقر أو الفرع' },
  { id: 'bookings', label: 'حجز مواعيد', icon: Calendar, description: 'تقويم مواعيد وبطاقات حجز استشارة' },
  { id: 'pricing', label: 'حاوية أسعار', icon: Receipt, description: 'باقات أسعار فردية ومقارنة باقات' },
  { id: 'social', label: 'أيقونات سوسيال', icon: Share2, description: 'أزرار شبكات التواصل والمراسلة الفورية' },
  { id: 'menu', label: 'قائمة وتنقل', icon: MenuIcon, description: 'شريط روابط تنقل أفقي ورأسي' },
  { id: 'html', label: 'حاوية HTML', icon: Code, description: 'مساحة برمجية مخصصة وتضمين iFrame' },
];

export interface ElementCatalogItem {
  id: string;
  category: ElementCategoryKey;
  subCategory: string;
  title: string;
  subtitle?: string;
  type: ModularElementType;
  previewType: 'text' | 'image' | 'button' | 'shape' | 'card' | 'gallery' | 'video' | 'form' | 'map' | 'booking' | 'pricing' | 'social' | 'menu' | 'html';
  previewData?: Record<string, any>;
  customData?: Record<string, any>;
  customFormatting?: Record<string, any>;
}

const POPULAR_ICONS = [
  'Phone', 'PhoneCall', 'Smartphone', 'MessageCircle', 'MessageSquare', 'Send', 'Mail', 'Inbox',
  'MapPin', 'Map', 'Compass', 'Navigation', 'Globe', 'Home', 'Building', 'Building2',
  'Star', 'Heart', 'ThumbsUp', 'Award', 'Trophy', 'Crown', 'Gift', 'Sparkles',
  'Search', 'Settings', 'Sliders', 'Wrench', 'Check', 'X', 'AlertTriangle', 'Info', 'HelpCircle',
  'User', 'Users', 'UserCheck', 'UserPlus', 'Lock', 'Unlock', 'Shield', 'ShieldCheck',
  'ShoppingCart', 'ShoppingBag', 'CreditCard', 'Tag', 'DollarSign', 'Percent', 'TrendingUp',
  'Camera', 'Image', 'Images', 'Video', 'Play', 'Tv', 'Film', 'Music', 'Volume2', 'Mic',
  'File', 'FileText', 'Clipboard', 'Calendar', 'Clock', 'Timer', 'Book', 'BookOpen', 'GraduationCap',
  'Link', 'Link2', 'Share2', 'ExternalLink', 'Coffee', 'Utensils', 'Pizza', 'Wine', 'Car', 'Plane',
  'Dumbbell', 'Zap', 'Lightbulb', 'Download', 'Upload', 'Save', 'Trash2', 'Edit2', 'Smile', 'Bell',
  'Plus', 'Minus', 'ChevronRight', 'ChevronLeft', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'
];

const ARABIC_TO_LUCIDE_MAP: Record<string, string[]> = {
  'هاتف': ['Phone', 'PhoneCall', 'PhoneIncoming', 'PhoneOutgoing', 'Smartphone'],
  'اتصال': ['Phone', 'PhoneCall', 'Contact', 'MessageSquare', 'Mail'],
  'رسالة': ['Mail', 'MessageSquare', 'MessageCircle', 'Send'],
  'بريد': ['Mail', 'Inbox'],
  'ايميل': ['Mail'],
  'دردشة': ['MessageSquare', 'MessageCircle'],
  'موقع': ['MapPin', 'Map', 'Compass', 'Navigation', 'Globe'],
  'خريطة': ['Map', 'MapPin', 'Compass'],
  'عنوان': ['MapPin', 'Home'],
  'نجمة': ['Star', 'Award', 'Trophy'],
  'تقييم': ['Star', 'ThumbsUp', 'Award'],
  'قلب': ['Heart'],
  'اعجاب': ['ThumbsUp', 'Heart'],
  'حب': ['Heart'],
  'سهم': ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight', 'ChevronLeft', 'ChevronsRight', 'ChevronsLeft'],
  'يمين': ['ArrowRight', 'ChevronRight', 'ChevronsRight'],
  'يسار': ['ArrowLeft', 'ChevronLeft', 'ChevronsLeft'],
  'فوق': ['ArrowUp', 'ChevronUp'],
  'تحت': ['ArrowDown', 'ChevronDown'],
  'بحث': ['Search'],
  'إغلاق': ['X', 'XCircle', 'XSquare'],
  'قفل': ['Lock', 'Unlock'],
  'حماية': ['Shield', 'ShieldCheck', 'Lock'],
  'أمان': ['Shield', 'ShieldCheck', 'Lock'],
  'إعدادات': ['Settings', 'Sliders', 'Wrench'],
  'ترس': ['Settings'],
  'مستخدم': ['User', 'Users', 'UserCheck', 'UserPlus'],
  'بروفايل': ['User', 'Users'],
  'ناس': ['Users'],
  'عربة': ['ShoppingCart', 'ShoppingBag'],
  'تسوق': ['ShoppingCart', 'ShoppingBag', 'Tag', 'DollarSign'],
  'شراء': ['ShoppingCart', 'ShoppingBag', 'CreditCard'],
  'سلة': ['ShoppingCart', 'ShoppingBag'],
  'حقيبة': ['ShoppingBag', 'Briefcase'],
  'كاميرا': ['Camera', 'Image', 'Video'],
  'صورة': ['Image', 'Images', 'Camera'],
  'فيديو': ['Video', 'Play', 'Tv', 'Film'],
  'تشغيل': ['Play', 'PlayCircle', 'Video'],
  'موسيقى': ['Music', 'Volume2', 'Mic', 'Headphones'],
  'صوت': ['Volume2', 'VolumeX', 'Megaphone'],
  'ملف': ['File', 'FileText', 'Clipboard'],
  'ورقة': ['File', 'FileText'],
  'ساعة': ['Clock', 'Calendar'],
  'وقت': ['Clock', 'Calendar', 'Timer'],
  'تاريخ': ['Calendar', 'Clock'],
  'رقم': ['Calculator', 'Hash'],
  'كتاب': ['Book', 'BookOpen', 'Bookmark'],
  'دراسة': ['BookOpen', 'GraduationCap'],
  'بيت': ['Home'],
  'منزل': ['Home'],
  'عقار': ['Home', 'Building', 'MapPin'],
  'مبنى': ['Building', 'Building2'],
  'رابط': ['Link', 'Link2'],
  'مشاركة': ['Share2', 'ExternalLink'],
  'طعام': ['Utensils', 'Coffee', 'Pizza'],
  'قهوة': ['Coffee'],
  'كأس': ['Wine', 'Beer', 'Coffee'],
  'شرب': ['Wine', 'Beer', 'Coffee'],
  'سيارة': ['Car'],
  'سفر': ['Plane', 'Map', 'Compass'],
  'رياضة': ['Dumbbell', 'Trophy', 'Activity'],
  'جيم': ['Dumbbell', 'Activity'],
  'كهرباء': ['Zap', 'Lightbulb'],
  'فكرة': ['Lightbulb', 'Brain'],
  'مصباح': ['Lightbulb'],
  'تنزيل': ['Download', 'ArrowDownToLine'],
  'رفع': ['Upload', 'ArrowUpFromLine'],
  'حفظ': ['Save', 'Bookmark'],
  'حذف': ['Trash2', 'Trash'],
  'تعديل': ['Edit3', 'Edit2', 'PenTool'],
  'قلم': ['PenTool', 'Edit2'],
  'صحة': ['Activity', 'Heart', 'ShieldAlert'],
  'طبيب': ['Activity', 'Heart', 'Stethoscope'],
  'مستشفى': ['Activity', 'Heart', 'ShieldAlert'],
  'مال': ['DollarSign', 'CreditCard', 'TrendingUp'],
  'نقود': ['DollarSign', 'CreditCard'],
  'سعر': ['Tag', 'DollarSign'],
  'عرض': ['Tag', 'Percent'],
  'تاج': ['Crown', 'Award'],
  'ألعاب': ['Gamepad2', 'Gamepad'],
  'كمبيوتر': ['Laptop', 'Monitor', 'Cpu'],
  'هاتف ذكي': ['Smartphone'],
  'انترنت': ['Globe', 'Wifi'],
  'سحابة': ['Cloud', 'CloudDownload', 'CloudUpload'],
  'شمس': ['Sun'],
  'قمر': ['Moon'],
  'مطر': ['CloudRain'],
  'نار': ['Flame', 'Zap'],
  'طبيعة': ['TreePine', 'Leaf', 'Flower'],
  'مرح': ['Smile', 'Laughing'],
  'تنبيه': ['Bell', 'BellRing'],
  'جرس': ['Bell', 'BellRing'],
  'إضافة': ['Plus', 'PlusCircle'],
  'ناقص': ['Minus', 'MinusCircle'],
  'صح': ['Check', 'CheckCircle'],
  'خطأ': ['X', 'XCircle'],
  'تحذير': ['AlertTriangle', 'AlertCircle'],
  'معلومات': ['Info', 'HelpCircle'],
  'سؤال': ['HelpCircle']
};

export const AddElementFlyoutPanel: React.FC<AddElementFlyoutPanelProps> = ({
  isOpen,
  onClose,
  onAddElement,
  user,
  colorScheme,
  slideTitle,
}) => {
  const [activeCategory, setActiveCategory] = useState<ElementCategoryKey>('text');
  const [activeSubTab, setActiveSubTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setActiveSubTab('all');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const primaryColor = colorScheme?.primary || '#2563eb';
  const accentColor = colorScheme?.accent || '#f59e0b';

  // PRESET_COLORS available for user to cycle through on text items before adding
  const PRESET_COLORS = useMemo(() => [
    '#ffffff', // أبيض
    '#ef4444', // أحمر
    '#f97316', // برتقالي
    '#eab308', // أصفر
    '#22c55e', // أخضر
    '#06b6d4', // سماوي
    '#3b82f6', // أزرق
    '#8b5cf6', // بنفسجي
    '#ec4899', // وردي
  ], []);

  const [itemColorIndexes, setItemColorIndexes] = useState<Record<string, number>>({});

  const handleCycleColor = (itemId: string, direction: number) => {
    setItemColorIndexes((prev) => {
      const currentIndex = prev[itemId] ?? 0;
      let nextIndex = currentIndex + direction;
      if (nextIndex < 0) nextIndex = PRESET_COLORS.length - 1;
      if (nextIndex >= PRESET_COLORS.length) nextIndex = 0;
      return {
        ...prev,
        [itemId]: nextIndex,
      };
    });
  };

  const getModifiedItem = (item: ElementCatalogItem) => {
    const colorIndex = itemColorIndexes[item.id] ?? -1;
    if (colorIndex === -1) return item; // default color unchanged

    const selectedColor = PRESET_COLORS[colorIndex];
    const modified: ElementCatalogItem = {
      ...item,
      customFormatting: {
        ...(item.customFormatting || {}),
        color: selectedColor,
      },
    };

    // If it's a neon/glow text effect, update the textShadow to match the selectedColor!
    if (
      item.id.startsWith('text-fx-neon') ||
      item.id.includes('glow') ||
      item.id === 'text-fx-fire-lava' ||
      item.id === 'text-fx-gothic-blood' ||
      item.id === 'text-fx-matrix' ||
      item.id === 'text-fx-emerald-glow'
    ) {
      // Custom shadow tailored to the chosen color
      modified.customFormatting.textShadow = `0 0 10px ${selectedColor}, 0 0 20px ${selectedColor}80, 0 0 35px ${selectedColor}40`;
    }

    // If it has a textGradient, generate a beautiful gradient starting with the selectedColor!
    if (item.customFormatting?.textGradient) {
      modified.customFormatting.textGradient = `linear-gradient(135deg, ${selectedColor} 0%, #8b5cf6 50%, #ec4899 100%)`;
    }

    // If it has a textStroke, update WebkitTextStroke color!
    if (item.customFormatting?.WebkitTextStroke) {
      const strokeSize = item.customFormatting.WebkitTextStroke.split(' ')[0] || '1.5px';
      modified.customFormatting.WebkitTextStroke = `${strokeSize} ${selectedColor}`;
    }

    return modified;
  };

  // Subtabs for each category
  const categorySubTabs: Record<ElementCategoryKey, { id: string; label: string }[]> = useMemo(() => ({
    text: [
      { id: 'all', label: 'الكل' },
      { id: 'titles', label: 'عناوين ونصوص أساسية' },
      { id: 'effects', label: 'نصوص بتأثيرات وتوهج' },
      { id: 'paragraphs', label: 'مقاطع نصية وفقرات' },
      { id: 'combinations', label: 'نصوص مركبة' },
    ],
    image: [
      { id: 'all', label: 'الكل' },
      { id: 'standard', label: 'صور مخصصة' },
      { id: 'rounded', label: 'صور دائرية وبيضوية' },
      { id: 'framed', label: 'إطارات فنية' },
      { id: 'unsplash', label: 'صور طبيعة وأعمال' },
    ],
    button: [
      { id: 'all', label: 'الكل' },
      { id: 'standard', label: 'أزرار أساسية' },
      { id: 'gradient', label: 'أزرار متدرجة ونيون' },
      { id: 'icons', label: 'أزرار مع أيقونات' },
      { id: 'outline', label: 'أزرار مفرغة (Ghost)' },
      { id: 'lucide_icons_search', label: 'بحث الأيقونات الاحترافية 🌟' },
    ],
    shapes_grafik: [
      { id: 'all', label: 'الكل' },
      { id: 'geometric', label: 'أشكال هندسية' },
      { id: 'vectors', label: 'رسوميات فكتور Grafiken' },
      { id: 'dividers', label: 'فواصل وزخارف' },
    ],
    cards: [
      { id: 'all', label: 'الكل' },
      { id: 'services', label: 'بطاقات خدمات' },
      { id: 'featured', label: 'بطاقات متكاملة' },
      { id: 'profile', label: 'بطاقات بروفايل' },
    ],
    gallery: [
      { id: 'all', label: 'الكل' },
      { id: 'layout5', label: 'معرض خماسي متناسق' },
      { id: 'grid', label: 'شبكة صور متجاوبة' },
      { id: 'strip', label: 'شريط صور أفقي' },
    ],
    video: [
      { id: 'all', label: 'الكل' },
      { id: 'player', label: 'مشغل فيديو تفاعلي' },
      { id: 'youtube', label: 'فيديو يوتيوب' },
      { id: 'cinema', label: 'خلفية سينمائية' },
    ],
    contact_form: [
      { id: 'all', label: 'الكل' },
      { id: 'quick', label: 'استمارة سريعة' },
      { id: 'detailed', label: 'استمارة مفصلة' },
      { id: 'newsletter', label: 'اشتراك بريدي' },
    ],
    google_map: [
      { id: 'all', label: 'الكل' },
      { id: 'interactive', label: 'خريطة تفاعلية' },
      { id: 'branch', label: 'خريطة فرع ومقر' },
    ],
    bookings: [
      { id: 'all', label: 'الكل' },
      { id: 'quick_book', label: 'حجز موعد سريع' },
      { id: 'calendar', label: 'تقويم أسبوعي' },
      { id: 'consultation', label: 'استشارة مجدولة' },
    ],
    pricing: [
      { id: 'all', label: 'الكل' },
      { id: 'single_plan', label: 'باقة فردية' },
      { id: 'comparison', label: 'مقارنة 3 باقات' },
    ],
    social: [
      { id: 'all', label: 'الكل' },
      { id: 'circle_icons', label: 'أيقونات دائرية' },
      { id: 'buttons', label: 'أزرار تواصل عريضة' },
    ],
    menu: [
      { id: 'all', label: 'الكل' },
      { id: 'horizontal', label: 'شريط قائمة أفقي' },
      { id: 'vertical', label: 'قائمة تنقل رأسية' },
    ],
    html: [
      { id: 'all', label: 'الكل' },
      { id: 'code_box', label: 'حاوية HTML' },
      { id: 'iframe', label: 'تضمين خارجي iFrame' },
    ],
  }), []);

  // Catalog items
  const catalogItems: ElementCatalogItem[] = useMemo(() => [
    // ================= 1. نصوص TEXT =================
    {
      id: 'text-h1',
      category: 'text',
      subCategory: 'titles',
      title: 'عنوان رئيسي ضخم (H1)',
      subtitle: 'خط 40px عريض للمقدمات والمواضيع الأساسية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'عنوان رئيسي' },
      customFormatting: { fontSize: '40px', bold: true, color: '#0f172a' },
    },
    {
      id: 'text-h2',
      category: 'text',
      subCategory: 'titles',
      title: 'عنوان متوسط (H2)',
      subtitle: 'خط 28px للفقرات والأقسام الفرعية',
      type: 'text_heading_medium',
      previewType: 'text',
      customData: { text: 'عنوان القسم الفرعي' },
      customFormatting: { fontSize: '28px', bold: true, color: primaryColor },
    },
    {
      id: 'text-h3',
      category: 'text',
      subCategory: 'titles',
      title: 'عنوان صغير (H3)',
      subtitle: 'خط 20px للبطاقات والقوائم',
      type: 'text_body',
      previewType: 'text',
      customData: { text: 'عنوان فرعي توضيحي' },
      customFormatting: { fontSize: '20px', bold: true, color: '#334155' },
    },
    {
      id: 'text-explanatory-small',
      category: 'text',
      subCategory: 'titles',
      title: 'نص شرحي (خط صغير ومربع كبير)',
      subtitle: 'مربع نصي متسع بخط صغير 13px مخصص لشروحات الأفكار الجانبية والتوضيحات المفصلة',
      type: 'text_body',
      previewType: 'text',
      customData: { text: 'هنا يمكنك كتابة شرح مفصل وواضح للفكرة أو توضيح للتعليمات التي ترغب في إبرازها للمستخدم؛ حيث يتيح هذا التنسيق قراءة مريحة للفقرات الطويلة والهوامش التوضيحية بخط صغير ومنسق وبأبعاد مريحة في مساحة واسعة تتيح سهولة القراءة وتمنع تشتت الانتباه.' },
      customFormatting: { fontSize: '13px', color: '#64748b', lineHeight: 1.6 },
    },
    {
      id: 'text-body-standard',
      category: 'text',
      subCategory: 'paragraphs',
      title: 'نص شرحي وفقرة',
      subtitle: 'خط 16px متوازن للقراءة وسرد التفاصيل',
      type: 'text_body',
      previewType: 'text',
      customData: { text: 'نص شرحي يصف الخدمات والمعلومات بأسلوب واضح ومريح للقراءة والتصفح.' },
      customFormatting: { fontSize: '15px', color: '#475569', lineHeight: 1.6 },
    },
    {
      id: 'text-body-2000-doc',
      category: 'text',
      subCategory: 'paragraphs',
      title: 'مستند نصي متسع (2000 حرف)',
      subtitle: 'حاوية نصوص للمقالات وسرد القصص الطويلة',
      type: 'text_body_2000',
      previewType: 'text',
      customData: { text: 'مستند نصي متكامل للمقالات والتقارير والشروحات المفصلة.' },
      customFormatting: { fontSize: '16px', color: '#334155' },
    },
    // النصوص بتأثيرات وتوهج Text-Effekte
    {
      id: 'text-fx-neon-blue',
      category: 'text',
      subCategory: 'effects',
      title: 'نص نيون أزرق مشع (Neon Glow)',
      subtitle: 'توهج إشعاعي بتقنية الظلال المضيئة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'توهج نيون مضيء' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#38bdf8',
        textShadow: '0 0 10px rgba(56,189,248,0.9), 0 0 20px rgba(14,165,233,0.7), 0 0 35px rgba(2,132,199,0.5)',
      },
    },
    {
      id: 'text-fx-gradient-sunset',
      category: 'text',
      subCategory: 'effects',
      title: 'نص متدرج فني (Gradient Text)',
      subtitle: 'تدرج غروب ساحر مطبوع داخل النص',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'نص متدرج الألوان' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#f97316',
        textGradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
      },
    },
    {
      id: 'text-fx-royal-gold',
      category: 'text',
      subCategory: 'effects',
      title: 'ذهب ملكي مذهب (Royal Gold)',
      subtitle: 'بريق ذهبي دافئ مع عمق بصري',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'بريق الذهب الملكي' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#f59e0b',
        textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 12px rgba(245,158,11,0.5)',
      },
    },
    {
      id: 'text-fx-3d-pop',
      category: 'text',
      subCategory: 'effects',
      title: 'نص ثلاثي الأبعاد بارز (3D Pop)',
      subtitle: 'طبقات ظل متتابعة تعطي بروزاً حقيقياً',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'نص ثلاثي الأبعاد' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#2563eb',
        textShadow: '1px 1px 0px #1d4ed8, 2px 2px 0px #1e40af, 3px 3px 0px #1e3a8a, 4px 4px 8px rgba(0,0,0,0.3)',
      },
    },
    {
      id: 'text-fx-outline-stroke',
      category: 'text',
      subCategory: 'effects',
      title: 'نص مفرغ بإطار (Outline Stroke)',
      subtitle: 'نص بتحديد خارجي مفرغ من الداخل',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'نص مفرغ أنيق' },
      customFormatting: {
        fontSize: '34px',
        bold: true,
        color: 'transparent',
        WebkitTextStroke: '1.5px #2563eb',
      },
    },
    // === تأثيرات متوهجة وفنية إضافية (أكثر من 30 نمطاً احترافياً متنوّعاً للمستخدم) ===
    {
      id: 'text-fx-neon-pink',
      category: 'text',
      subCategory: 'effects',
      title: 'نيون وردي صارخ (Pink Fever)',
      subtitle: 'توهج وردي نيون للمناسبات الشبابية والتصاميم الحيوية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'نيون وردي مشع' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#ec4899',
        textShadow: '0 0 10px rgba(236,72,153,0.9), 0 0 20px rgba(219,39,119,0.7), 0 0 35px rgba(190,24,93,0.5)',
      },
    },
    {
      id: 'text-fx-neon-green',
      category: 'text',
      subCategory: 'effects',
      title: 'نيون أخضر سايبر (Cyber Lime)',
      subtitle: 'توهج أخضر نيون بطابع رقمي مستقبلي',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'أخضر سايبر مشع' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#22c55e',
        textShadow: '0 0 10px rgba(34,197,94,0.9), 0 0 20px rgba(22,163,74,0.7), 0 0 35px rgba(21,128,61,0.5)',
      },
    },
    {
      id: 'text-fx-neon-purple',
      category: 'text',
      subCategory: 'effects',
      title: 'نيون أرجواني سحري (Magic Purple)',
      subtitle: 'توهج غامض وجذاب لعشاق الخيال والفضاء',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'نيون أرجواني سحري' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#a855f7',
        textShadow: '0 0 10px rgba(168,85,247,0.9), 0 0 20px rgba(147,51,234,0.7), 0 0 35px rgba(126,34,206,0.5)',
      },
    },
    {
      id: 'text-fx-neon-orange',
      category: 'text',
      subCategory: 'effects',
      title: 'وهج نيون برتقالي (Vibrant Amber)',
      subtitle: 'توهج دافئ ملفت للنظر بقوة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'نيون برتقالي متوهج' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#f97316',
        textShadow: '0 0 10px rgba(249,115,22,0.9), 0 0 20px rgba(234,88,12,0.7), 0 0 35px rgba(194,65,12,0.5)',
      },
    },
    {
      id: 'text-fx-fire-lava',
      category: 'text',
      subCategory: 'effects',
      title: 'نص الحمم البركانية (Fire & Lava)',
      subtitle: 'مزيج توهج ناري حارق من الأحمر والبرتقالي',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'نص بركاني ملتهب' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#ef4444',
        textShadow: '0 0 4px #fff, 0 -2px 10px #facc15, 0 -4px 18px #f97316, 0 -8px 28px #ef4444',
      },
    },
    {
      id: 'text-fx-electric-ice',
      category: 'text',
      subCategory: 'effects',
      title: 'جليد كهربائي (Electric Ice)',
      subtitle: 'توهج ثلجي بظلال سماوية باردة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'جليد كهربائي متوهج' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#e0f2fe',
        textShadow: '0 0 8px #38bdf8, 0 0 22px #0284c7, 0 0 40px #0369a1',
      },
    },
    {
      id: 'text-fx-cosmic-nebula',
      category: 'text',
      subCategory: 'effects',
      title: 'سديم كوني متدرج (Cosmic Nebula)',
      subtitle: 'تدرج فلكي من البنفسجي إلى الأزرق الكوني الداكن',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'سديم كوني فخم' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#c084fc',
        textGradient: 'linear-gradient(135deg, #c084fc 0%, #6366f1 50%, #1e1b4b 100%)',
      },
    },
    {
      id: 'text-fx-aurora-borealis',
      category: 'text',
      subCategory: 'effects',
      title: 'أضواء الشفق القطبي (Aurora Borealis)',
      subtitle: 'تدرج سماوي أخضر ليموني وزمردي رائع',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'أضواء الشفق القطبي' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#4ade80',
        textGradient: 'linear-gradient(135deg, #4ade80 0%, #2dd4bf 50%, #0284c7 100%)',
      },
    },
    {
      id: 'text-fx-mint-fresh',
      category: 'text',
      subCategory: 'effects',
      title: 'نعناع منعش (Mint Fresh)',
      subtitle: 'تدرج باستيل هادئ مريح ومنعش',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'نعناع منعش هادئ' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#34d399',
        textGradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
      },
    },
    {
      id: 'text-fx-candy-pastel',
      category: 'text',
      subCategory: 'effects',
      title: 'حلوى الباستيل (Candy Pop)',
      subtitle: 'تدرج مرح من الوردي والأصفر المشرق',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'حلوى باستيل مرحة' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#f472b6',
        textGradient: 'linear-gradient(135deg, #f472b6 0%, #fb7185 50%, #facc15 100%)',
      },
    },
    {
      id: 'text-fx-sunset-beach',
      category: 'text',
      subCategory: 'effects',
      title: 'غروب الشاطئ الرومنسي (Sunset Beach)',
      subtitle: 'تدرج ذهبي دافئ مع البنفسجي الحالم',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'غروب شاطئ دافئ' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#fb923c',
        textGradient: 'linear-gradient(135deg, #fb923c 0%, #db2777 50%, #6366f1 100%)',
      },
    },
    {
      id: 'text-fx-deep-ocean',
      category: 'text',
      subCategory: 'effects',
      title: 'المحيط العميق (Deep Ocean)',
      subtitle: 'تدرج مائي عميق من الكحلي للزمردي',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'أعماق المحيط الساحرة' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#38bdf8',
        textGradient: 'linear-gradient(135deg, #0f172a 0%, #0284c7 50%, #14b8a6 100%)',
      },
    },
    {
      id: 'text-fx-holographic',
      category: 'text',
      subCategory: 'effects',
      title: 'سحر الهولوغرام (Holo Magic)',
      subtitle: 'تدرج فني ثلاثي الأبعاد يعكس طيف الضوء',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'بريق الهولوغرام الفني' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#a5f3fc',
        textGradient: 'linear-gradient(90deg, #a5f3fc 0%, #fbcfe8 33%, #c084fc 66%, #a5f3fc 100%)',
      },
    },
    {
      id: 'text-fx-platinum-silver',
      category: 'text',
      subCategory: 'effects',
      title: 'كروم فضي بلاتيني (Platinum Chrome)',
      subtitle: 'بريق معدني مصقول ومحكم بنقاء الفضة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'بريق الفضة البلاتينية' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#cbd5e1',
        textGradient: 'linear-gradient(to bottom, #ffffff 0%, #94a3b8 50%, #cbd5e1 100%)',
        textShadow: '0 1px 1px rgba(0,0,0,0.4)',
      },
    },
    {
      id: 'text-fx-metallic-copper',
      category: 'text',
      subCategory: 'effects',
      title: 'نحاس برونزي مصقول (Polished Copper)',
      subtitle: 'لمعان معدني دافئ يحاكي النحاس المصقول',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'نحاس برونزي لامع' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#ea580c',
        textGradient: 'linear-gradient(to bottom, #ffedd5 0%, #d97706 50%, #78350f 100%)',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
      },
    },
    {
      id: 'text-fx-cyberpunk-yellow',
      category: 'text',
      subCategory: 'effects',
      title: 'سايبر عريض مظلل (Cyberpunk Grid)',
      subtitle: 'نص أصفر جريء محدد بظل أسود مزدوج حاد',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'سايبر بانك فني' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#facc15',
        textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
      },
    },
    {
      id: 'text-fx-retro-80s',
      category: 'text',
      subCategory: 'effects',
      title: 'توهج ريترو ثمانيناتي (80s Retro Glow)',
      subtitle: 'نمط كلاسيكي بلون وردي نيون وظل أزرق',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'ريترو ثمانينات مميز' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#f43f5e',
        textShadow: '2px 2px 0px #06b6d4, 4px 4px 0px #1e1b4b, 0 0 8px rgba(244,63,94,0.6)',
      },
    },
    {
      id: 'text-fx-vaporwave',
      category: 'text',
      subCategory: 'effects',
      title: 'نمط موجة البخار (Vaporwave Synth)',
      subtitle: 'ألوان وردية وأزرق سماوي بأسلوب الحفلات الرقمية القديمة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'فيبور ويف فني' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#38bdf8',
        textGradient: 'linear-gradient(135deg, #38bdf8 0%, #ec4899 100%)',
        textShadow: '2px 2px 0px rgba(126,34,206,0.5)',
      },
    },
    {
      id: 'text-fx-chalkboard',
      category: 'text',
      subCategory: 'effects',
      title: 'تخطيط طبشوري كلاسيكي (Chalkboard)',
      subtitle: 'نص طبشوري مفرغ يضفي طابع الدراسة الكلاسيكية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'مكتوب بالطبشور' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: 'transparent',
        WebkitTextStroke: '1px rgba(255,255,255,0.8)',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
      },
    },
    {
      id: 'text-fx-gothic-blood',
      category: 'text',
      subCategory: 'effects',
      title: 'وهج قوطي غامض (Gothic Crimson)',
      subtitle: 'لون قرمزي داكن بوهج غامض كلاسيكي',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'وهج قرمزي غامض' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#991b1b',
        textShadow: '0 0 12px #ef4444, 2px 2px 4px #000000',
      },
    },
    {
      id: 'text-fx-matrix',
      category: 'text',
      subCategory: 'effects',
      title: 'شيفرة مصفوفة البرمجة (Matrix Code)',
      subtitle: 'نص بلون فسفوري بوهج رقمي حاد',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'شيفرة مصفوفة سايبر' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#22c55e',
        textShadow: '0 0 8px #22c55e, 0 0 15px rgba(34,197,94,0.4)',
      },
    },
    {
      id: 'text-fx-bubblegum',
      category: 'text',
      subCategory: 'effects',
      title: 'علكة بالون وردي (Bubblegum Pink)',
      subtitle: 'شكل ثلاثي أبعاد ناعم باللون الوردي والأبيض اللطيف',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'وردي بالون ناعم' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#f472b6',
        textShadow: '1px 1px 0px #db2777, 2px 2px 0px #be185d, 3px 3px 5px rgba(0,0,0,0.3)',
      },
    },
    {
      id: 'text-fx-soft-gradient',
      category: 'text',
      subCategory: 'effects',
      title: 'تدرج فخم دافئ (Muted Warmth)',
      subtitle: 'تدرج غني وهادئ جداً يتناسب مع البراندات الراقية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'أناقة التدرج الفاخر' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#fdba74',
        textGradient: 'linear-gradient(135deg, #fdba74 0%, #f472b6 100%)',
      },
    },
    {
      id: 'text-fx-emerald-glow',
      category: 'text',
      subCategory: 'effects',
      title: 'الزمرد المشع (Emerald Ray)',
      subtitle: 'وهج أخضر زمردي عميق ذو بريق رائع',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'وهج أخضر زمردي' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#34d399',
        textShadow: '0 0 8px #059669, 0 0 20px rgba(52,211,153,0.5)',
      },
    },
    {
      id: 'text-fx-neon-yellow',
      category: 'text',
      subCategory: 'effects',
      title: 'وهج فسفوري ليموني (Lemon Volt)',
      subtitle: 'توهج شديد القوة باللون الأصفر الفسفوري الصارخ',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'أصفر فسفوري ليموني' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#eab308',
        textShadow: '0 0 10px #facc15, 0 0 25px rgba(234,179,8,0.7)',
      },
    },
    {
      id: 'text-fx-candy-cane',
      category: 'text',
      subCategory: 'effects',
      title: 'تدرج حلوى الكرز (Cherry Cane)',
      subtitle: 'تدرج رائع من الأحمر المبهج والأبيض',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'حلوى كرز مبهجة' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#ef4444',
        textGradient: 'linear-gradient(135deg, #ef4444 0%, #fca5a5 100%)',
      },
    },
    {
      id: 'text-fx-ghost',
      category: 'text',
      subCategory: 'effects',
      title: 'شبح ناعم ضبابي (Chamber Ghost)',
      subtitle: 'ظل ضبابي أبيض خافت يعطي طابعاً طيفياً غامضاً',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'شبح طيفي ناعم' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: 'rgba(255,255,255,0.85)',
        textShadow: '0 0 15px rgba(255,255,255,0.7), 0 0 30px rgba(255,255,255,0.3)',
      },
    },
    {
      id: 'text-fx-comic-3d',
      category: 'text',
      subCategory: 'effects',
      title: 'كوميك ثلاثي الأبعاد (Comic Pop)',
      subtitle: 'نمط القصص المصورة بوهج محدد وظل عريض مائل',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'كوميك ممتع وعريض' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: '#f43f5e',
        textShadow: '3px 3px 0px #1e1b4b, 4px 4px 0px rgba(0,0,0,0.15)',
      },
    },
    {
      id: 'text-fx-glass',
      category: 'text',
      subCategory: 'effects',
      title: 'زجاج شفاف عاكس (Glassmorphic Text)',
      subtitle: 'تأثير زجاجي بظل داخلي ناعم وتوهج خفيف جداً',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'نص زجاجي فخم' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: 'rgba(255,255,255,0.95)',
        textShadow: '0 1px 0 rgba(255,255,255,0.4), 0 8px 16px rgba(0,0,0,0.2)',
      },
    },
    {
      id: 'text-fx-outline-pink',
      category: 'text',
      subCategory: 'effects',
      title: 'إطار وردي مفرغ (Outline Pink)',
      subtitle: 'نص مفرغ رقيق بحد خارجي وردي ناعم للغاية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: 'مفرغ وردي ناعم' },
      customFormatting: {
        fontSize: '32px',
        bold: true,
        color: 'transparent',
        WebkitTextStroke: '1.2px #ec4899',
      },
    },
    // مقاطع نصية ونصوص مركبة
    {
      id: 'text-quote-block',
      category: 'text',
      subCategory: 'paragraphs',
      title: 'اقتباس فني مميز (Quote Block)',
      subtitle: 'نص محاط برمز اقتباس وتنسيق أنيق',
      type: 'text_body',
      previewType: 'text',
      customData: { text: '«النجاح لا يأتي بالصدفة، بل هو نتاج الإتقان والعمل الدؤوب والشغف المستمر.»' },
      customFormatting: { fontSize: '18px', fontStyle: 'italic', color: '#1e293b' },
    },
    // ================= 30 تصميم نصوص مركبة عربية احترافية (Arabic Lockups) =================
    {
      id: 'text-combo-ar-cafe',
      category: 'text',
      subCategory: 'combinations',
      title: 'مزيج القهوة المختصة',
      subtitle: 'خط لاليزار عريض مع سطر فرعي أنيق لمقاهي البُن',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "مَقهى الفَخر\nأجود حبوب البُن المحمّصة بحُب" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#f59e0b',
        fontFamily: "'Lalezar', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-boutique',
      category: 'text',
      subCategory: 'combinations',
      title: 'دار الأناقة والجمال',
      subtitle: 'خط المسيري الكلاسيكي للعلامات الفاخرة والأزياء',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "دار الأناقة\nأحدث خطوط الموضة والأزياء الراقية" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#ec4899',
        fontFamily: "'El Messiri', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-perfume',
      category: 'text',
      subCategory: 'combinations',
      title: 'شعار نفحات العود',
      subtitle: 'خط أميري تراثي فخم باللون النحاسي الدافئ',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "نفَحات العُود\nعطور شرقية ملكية تعكس هيبتك" },
      customFormatting: {
        fontSize: '30px',
        bold: true,
        color: '#ea580c',
        fontFamily: "'Amiri', serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-salon',
      category: 'text',
      subCategory: 'combinations',
      title: 'صالون لمسة جمال',
      subtitle: 'خط ليمونادا انسيابي بلون وردي ناعم',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "لمسة جمال\nالعناية الكاملة بجمالك وتألقكِ اليومي" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#f472b6',
        fontFamily: "'Lemonada', sans-serif",
        textAlign: 'center',
        lineHeight: '1.6'
      },
    },
    {
      id: 'text-combo-ar-realestate',
      category: 'text',
      subCategory: 'combinations',
      title: 'صروح المعمار العقارية',
      subtitle: 'خط كوفام معاصر صلب وثابت للهويات العقارية والمشاريع',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "صُروح المِعمار\nشقق وفلل سكنية بمقاييس عالمية فخمة" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#1e3a8a',
        fontFamily: "'Kufam', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-restaurant',
      category: 'text',
      subCategory: 'combinations',
      title: 'مذاق الشام للأطعمة',
      subtitle: 'خط رقاص فني ومبهج مناسب للمطاعم والمأكولات',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "مذاق الشام\nأشهى المأكولات الشرقية على أصولها" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#ef4444',
        fontFamily: "'Rakkas', display",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-law',
      category: 'text',
      subCategory: 'combinations',
      title: 'ميزان العدل والمحاماة',
      subtitle: 'خط أميري كلاسيكي ذو وقار ورسمية تامة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "ميزان العَدل\nاستشارات قانونية ومحاماة بدقة واحترافية" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#1e293b',
        fontFamily: "'Amiri', serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-clinic',
      category: 'text',
      subCategory: 'combinations',
      title: 'عيادة النخبة الطبية',
      subtitle: 'خط المراعي الرسمي المتزن للمراكز الطبية والأطباء',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "عِيادة النّخبة\nرعاية طبية متميزة بأحدث التقنيات العالمية" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#06b6d4',
        fontFamily: "'Almarai', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-spa',
      category: 'text',
      subCategory: 'combinations',
      title: 'واحة الاسترخاء والعناية',
      subtitle: 'خط حرمل مريح للعين يعكس الهدوء والسكينة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "واحة الاسترخاء\nجلسات مساج وعناية طبيعية لراحة بالك" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#10b981',
        fontFamily: "'Harmattan', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-academy',
      category: 'text',
      subCategory: 'combinations',
      title: 'منصة علم للتعليم والتدريب',
      subtitle: 'خط تجوال الهندسي الأنيق والواضح للمؤسسات التعليمية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "منصة عِلم\nدورات تدريبية معتمدة تصنع مستقبلك المهني" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#3b82f6',
        fontFamily: "'Tajawal', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-bakery',
      category: 'text',
      subCategory: 'combinations',
      title: 'رغيف الذهب للمخبوزات',
      subtitle: 'خط مرحي إبداعي وشهي للمخابز ومصانع الحلوى',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "رغيف الذهب\nمخبوزات طازجة وحلويات شهية يومياً" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#d97706',
        fontFamily: "'Marhey', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-gym',
      category: 'text',
      subCategory: 'combinations',
      title: 'قوة وعزيمة للياقة البدنية',
      subtitle: 'خط شانغا الصلب والمضلع المناسب للرياضة والجيم',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "قوة وعزيمة\nنادي رياضي متكامل لبناء جسد متناسق وسليم" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#f97316',
        fontFamily: "'Changa', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-tech',
      category: 'text',
      subCategory: 'combinations',
      title: 'أفق الرقمية للتقنية',
      subtitle: 'خط القاهرة الحديث لشركات البرمجيات والتكنولوجيا',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "أفق الرقمية\nحلول برمجية وتطبيقات ذكية تلبي طموحك" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#2563eb',
        fontFamily: "'Cairo', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-flowers',
      category: 'text',
      subCategory: 'combinations',
      title: 'زهور الأمل للهدايا',
      subtitle: 'خط زين الناعم للمتاجر الأنيقة ومحلات الورد',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "زهور الأمل\nباقات ورد طبيعي وتنسيق حفلات فاخرة" },
      customFormatting: {
        fontSize: '25px',
        bold: true,
        color: '#db2777',
        fontFamily: "'Zain', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-furniture',
      category: 'text',
      subCategory: 'combinations',
      title: 'فخامة البيت للأثاث',
      subtitle: 'خط الإسكندرية الفخم والعصري لمعارض الأثاث المنزلي',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "فخامة البيت\nأثاث وديكورات داخلية تضفي لمسة ساحرة" },
      customFormatting: {
        fontSize: '25px',
        bold: true,
        color: '#7c3aed',
        fontFamily: "'Alexandria', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-jewelry',
      category: 'text',
      subCategory: 'combinations',
      title: 'بريق الذهب والمجوهرات',
      subtitle: 'بريق ذهبي فاخر مع خط أميري عريق للمصوغات',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "بريق الذهب\nمجوهرات مصاغة بحرفية لجميع مناسباتكِ" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#fbbf24',
        fontFamily: "'Amiri', serif",
        textShadow: '0 1px 3px rgba(0,0,0,0.2), 0 0 8px rgba(245,158,11,0.3)',
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-honey',
      category: 'text',
      subCategory: 'combinations',
      title: 'شهد الطبيعة للعسل نقي',
      subtitle: 'خط عارف رقعة فني تراثي دافئ لمناحل العسل والمواد الطبيعية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "شهد الطبيعة\nعسل نحل طبيعي نقي 100% وخالٍ من الإضافات" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#d97706',
        fontFamily: "'Aref Ruqaa', serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-optics',
      category: 'text',
      subCategory: 'combinations',
      title: 'نظرة الغد للبصريات',
      subtitle: 'خط تجوال الهندسي المتناسق لمحلات النظارات والعيون',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "نظرة الغد\nأحدث موديلات النظارات الطبية والشمسية" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#0ea5e9',
        fontFamily: "'Tajawal', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-books',
      category: 'text',
      subCategory: 'combinations',
      title: 'أوراق المعرفة للمكتبات',
      subtitle: 'خط أميري فخم مريح ومناسب لدور النشر والكتب',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "أوراق المعرفة\nمكتبة شاملة لأروع الكتب والروايات العالمية" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#475569',
        fontFamily: "'Amiri', serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-sweets',
      category: 'text',
      subCategory: 'combinations',
      title: 'شوكولا وحلوى الأفراح',
      subtitle: 'خط ليمونادا الانسيابي الرائع لعلب الهدايا والشوكولاتة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "شوكولا وحلوى\nعلب شوكولاتة فاخرة لكل لحظاتك السعيدة" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#db2777',
        fontFamily: "'Lemonada', sans-serif",
        textAlign: 'center',
        lineHeight: '1.6'
      },
    },
    {
      id: 'text-combo-ar-travel',
      category: 'text',
      subCategory: 'combinations',
      title: 'رحلات السندباد للسياحة',
      subtitle: 'خط رقاص إبداعي حركي يعكس الترحال والاستكشاف',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "رحلات السندباد\nسياحة وسفر وحجز تذاكر لأجمل وجهات العالم" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#059669',
        fontFamily: "'Rakkas', display",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-dates',
      category: 'text',
      subCategory: 'combinations',
      title: 'تمور البركة الفاخرة',
      subtitle: 'خط عارف رقعة تراثي فخم وتاريخي لمحلات التمور والضيافة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "تمور البركة\nتمور فاخرة منتقاة بعناية من مزارع المدينة" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#78350f',
        fontFamily: "'Aref Ruqaa', serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-dentist',
      category: 'text',
      subCategory: 'combinations',
      title: 'تألق أسنانك تجميل وزراعة',
      subtitle: 'خط القاهرة الطبي العصري لعيادات تجميل وصحة الأسنان',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "تألق أسنانك\nتجميل وزراعة الأسنان بابتسامة هوليود المشرقة" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#10b981',
        fontFamily: "'Cairo', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-event',
      category: 'text',
      subCategory: 'combinations',
      title: 'ليلة العمر لتنسيق الحفلات',
      subtitle: 'خط المسيري المزخرف الرائع للأعراس والمناسبات السعيدة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "ليلة العمر\nتنظيم وتنسيق أفخم المناسبات والمؤتمرات" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#8b5cf6',
        fontFamily: "'El Messiri', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-car',
      category: 'text',
      subCategory: 'combinations',
      title: 'محرك السرعة لصيانة سيارات',
      subtitle: 'خط شانغا الحاد والقوي لورش ومراكز صيانة السيارات والسرعة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "محرك السرعة\nصيانة وفحص السيارات بأحدث الأجهزة والخبرات" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#dc2626',
        fontFamily: "'Changa', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-studio',
      category: 'text',
      subCategory: 'combinations',
      title: 'عدسة الإبداع للتصوير والتوثيق',
      subtitle: 'خط الإسكندرية الحديث للاستوديوهات الفنية والمبدعين',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "عدسة الإبداع\nجلسات تصوير فوتوغرافي وتوثيق ذكرياتك الجميلة" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#6366f1',
        fontFamily: "'Alexandria', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-kids',
      category: 'text',
      subCategory: 'combinations',
      title: 'ألعاب الفرح للأطفال والملابس',
      subtitle: 'خط مرحي الجذاب والطفولي الملائم لعالم الأطفال والألعاب',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "ألعاب الفرح\nعالم من الألعاب والملابس الآمنة والممتعة لأطفالك" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#f59e0b',
        fontFamily: "'Marhey', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-marketing',
      category: 'text',
      subCategory: 'combinations',
      title: 'شعلة التسويق الرقمي والإعلان',
      subtitle: 'خط القاهرة الهندسي الأنيق المناسب لشركات الإعلان والتسويق',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "شعلة التسويق\nخطط تسويقية ذكية تضمن نمو مبيعاتك وأرباحك" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#ea580c',
        fontFamily: "'Cairo', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-ar-pets',
      category: 'text',
      subCategory: 'combinations',
      title: 'صديق الأليف للحيوانات ورعايتها',
      subtitle: 'خط زين الممتع والناعم لمحلات وعيادات الحيوانات الأليفة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "صديق الأليف\nرعاية طبية وطعام مخصص لحيوانك الأليف المميز" },
      customFormatting: {
        fontSize: '25px',
        bold: true,
        color: '#06b6d4',
        fontFamily: "'Zain', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-ar-design',
      category: 'text',
      subCategory: 'combinations',
      title: 'إتقان الفني للهوية البصرية',
      subtitle: 'خط كوفام معاصر ومتزن للمصممين وشركات الجرافيك',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "إتقان الفني\nهوية بصرية وتصاميم جرافيك تعبر عن جوهر مشروعك" },
      customFormatting: {
        fontSize: '25px',
        bold: true,
        color: '#4f46e5',
        fontFamily: "'Kufam', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },

    // ================= 30 تصميم نصوص مركبة ثنائية اللغة (Arabic-English Bilingual Lockups) =================
    {
      id: 'text-combo-bi-cafe',
      category: 'text',
      subCategory: 'combinations',
      title: 'قهوة المزاج - Mood Coffee',
      subtitle: 'خط لاليزار عريض مدمج بلغة إنجليزية راقية للمقاهي والمحامص',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "قهوة المَزاج\nMOOD COFFEE" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#78350f',
        fontFamily: "'Lalezar', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-boutique',
      category: 'text',
      subCategory: 'combinations',
      title: 'فاشن بوتيك - Fashion Boutique',
      subtitle: 'خط المسيري الكلاسيكي المدمج مع الإنجليزية للموضة والأزياء',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "فاشن بوتيك\nFASHION BOUTIQUE" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#ec4899',
        fontFamily: "'El Messiri', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-perfume',
      category: 'text',
      subCategory: 'combinations',
      title: 'أريج العطور - Scent of Luxury',
      subtitle: 'خط أميري تراثي فخم مع سياق إنجليزي لعلامات العطور',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "أريج العطور\nSCENT OF LUXURY" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#d97706',
        fontFamily: "'Amiri', serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-realestate',
      category: 'text',
      subCategory: 'combinations',
      title: 'مجموعة العقارات - Estate Group',
      subtitle: 'خط القاهرة الحديث مدمج مع سطر إنجليزي للمطورين العقاريين',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "مجموعة العقارات\nESTATE GROUP" },
      customFormatting: {
        fontSize: '25px',
        bold: true,
        color: '#1e3a8a',
        fontFamily: "'Cairo', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-restaurant',
      category: 'text',
      subCategory: 'combinations',
      title: 'البرجر الذهبي - Golden Burger',
      subtitle: 'خط شانغا الصلب والمضلع مع تسمية برجر بالإنجليزية للمطاعم',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "البرجر الذهبي\nTHE GOLDEN BURGER" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#ef4444',
        fontFamily: "'Changa', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-salon',
      category: 'text',
      subCategory: 'combinations',
      title: 'سحر الجمال - Beauty Charm',
      subtitle: 'خط زين الناعم والرقيق مع سياق تجميلي بالإنجليزية لمراكز التجميل',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "سحر الجمال\nBEAUTY CHARM" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#f472b6',
        fontFamily: "'Zain', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-law',
      category: 'text',
      subCategory: 'combinations',
      title: 'دار العدالة - Justice Chambers',
      subtitle: 'خط أميري كلاسيكي رسمي فخم مع ترجمة إنجليزية لمكاتب المحاماة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "دار العدالة\nJUSTICE CHAMBERS" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#1e293b',
        fontFamily: "'Amiri', serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-clinic',
      category: 'text',
      subCategory: 'combinations',
      title: 'مستشفى الأمل - Hope Hospital',
      subtitle: 'خط المراعي الطبي الجاد والمتزن للمراكز الطبية والمستشفيات ثنائية اللغة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "مستشفى الأمل\nHOPE HOSPITAL" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#06b6d4',
        fontFamily: "'Almarai', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-academy',
      category: 'text',
      subCategory: 'combinations',
      title: 'أكاديمية النجاح - Success Academy',
      subtitle: 'خط تجوال الهندسي الأنيق والمهني مدمج مع لغة إنجليزية مخصصة للتعليم',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "أكاديمية النجاح\nSUCCESS ACADEMY" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#2563eb',
        fontFamily: "'Tajawal', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-spa',
      category: 'text',
      subCategory: 'combinations',
      title: 'نادي الرخاء - Relax Spa',
      subtitle: 'خط حرمل الانسيابي والمريح للأعصاب مع سياق إنجليزي للسبا والاسترخاء',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "نادي الرخاء\nRELAX SPA & WELLNESS" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#10b981',
        fontFamily: "'Harmattan', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-bakery',
      category: 'text',
      subCategory: 'combinations',
      title: 'كيك وحلوى - Bake & Sweets',
      subtitle: 'خط مرحي الإبداعي الطريف لمخابز الكب كيك والكيك الفاخر',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "كيك وحلوى\nBAKE & SWEETS" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#f59e0b',
        fontFamily: "'Marhey', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-gym',
      category: 'text',
      subCategory: 'combinations',
      title: 'بناء الأجسام - Iron Body Gym',
      subtitle: 'خط شانغا الصلب مع عنوان إنجليزي ضخم ومتحفز لبناء الأجسام والحديد',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "بناء الأجسام\nIRON BODY GYM" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#ea580c',
        fontFamily: "'Changa', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-tech',
      category: 'text',
      subCategory: 'combinations',
      title: 'مستقبل الذكاء - Future Intelligence',
      subtitle: 'خط القاهرة المتطور مدمجاً مع تسمية تكنولوجية إنجليزية للذكاء الاصطناعي',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "مستقبل الذكاء\nFUTURE INTELLIGENCE" },
      customFormatting: {
        fontSize: '25px',
        bold: true,
        color: '#3b82f6',
        fontFamily: "'Cairo', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-flowers',
      category: 'text',
      subCategory: 'combinations',
      title: 'روز للتنسيق - Rose Event Design',
      subtitle: 'خط ليمونادا الانسيابي المبهج لتنسيق الحفلات والمناسبات الوردية الراقية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "روز للتنسيق\nROSE Event Design" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#db2777',
        fontFamily: "'Lemonada', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-furniture',
      category: 'text',
      subCategory: 'combinations',
      title: 'معرض المفروشات - Home Furniture',
      subtitle: 'خط الإسكندرية الفخم والعصري مدمجاً مع تسمية إنجليزية لمعارض الأثاث',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "معرض المفروشات\nHOME FURNITURE" },
      customFormatting: {
        fontSize: '25px',
        bold: true,
        color: '#4f46e5',
        fontFamily: "'Alexandria', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-jewelry',
      category: 'text',
      subCategory: 'combinations',
      title: 'جواهر الماس - Diamond Jewelry',
      subtitle: 'خط أميري الكلاسيكي الفاخر ببريق الذهب المذهب مع عنوان إنجليزي فخم',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "جواهر الماس\nDIAMOND JEWELRY" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#fbbf24',
        fontFamily: "'Amiri', serif",
        textShadow: '0 1px 3px rgba(0,0,0,0.2), 0 0 8px rgba(245,158,11,0.3)',
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-honey',
      category: 'text',
      subCategory: 'combinations',
      title: 'رحيق الطبيعة - Nature Honey',
      subtitle: 'خط عارف رقعة فني وتراثي عريق مدمج مع الإنجليزية لمستخلصات النحل والمنتجات العضوية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "رحيق الطبيعة\nNATURE HONEY" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#b45309',
        fontFamily: "'Aref Ruqaa', serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-optics',
      category: 'text',
      subCategory: 'combinations',
      title: 'رؤية واضحة - Clear Vision',
      subtitle: 'خط تجوال متقن وهندسي مع تسمية إنجليزية ملائمة لعيادات ومتاجر البصريات',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "رؤية واضحة\nCLEAR VISION" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#0ea5e9',
        fontFamily: "'Tajawal', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-books',
      category: 'text',
      subCategory: 'combinations',
      title: 'منبر الفكر - Book Hub',
      subtitle: 'خط أميري رفيع ذو وقار وعلم مدمج مع سياق إنجليزي للمكاتب ودور النشر',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "منبر الفكر\nBOOK HUB" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#475569',
        fontFamily: "'Amiri', serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-sweets',
      category: 'text',
      subCategory: 'combinations',
      title: 'شوكولاتة الحب - Love Chocolate',
      subtitle: 'خط مرحي الإبداعي الفني بلون مخملي رائع لعلب الشوكولاتة الفاخرة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "شوكولاتة الحب\nLOVE CHOCOLATE" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#be185d',
        fontFamily: "'Marhey', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-travel',
      category: 'text',
      subCategory: 'combinations',
      title: 'طيران الأفق - Sky Travel',
      subtitle: 'خط رقاص ذو حركة ترحالية جميلة مدمج مع تسمية طيران وسياحة بالإنجليزية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "طيران الأفق\nSKY TRAVEL" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#059669',
        fontFamily: "'Rakkas', display",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-dates',
      category: 'text',
      subCategory: 'combinations',
      title: 'تمور نجد - Najd Dates',
      subtitle: 'خط عارف رقعة فني وتراثي عريق مخصص لتجارة التمور والضيافة العربية الفاخرة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "تمور نجد\nNAJD DATES" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#78350f',
        fontFamily: "'Aref Ruqaa', serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-dentist',
      category: 'text',
      subCategory: 'combinations',
      title: 'عيادة الابتسامة - Smile Clinic',
      subtitle: 'خط القاهرة الحديث مع تسمية إنجليزية ملائمة لعيادات ومراكز الأسنان وتجميلها',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "عيادة الابتسامة\nSMILE CLINIC" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#14b8a6',
        fontFamily: "'Cairo', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-event',
      category: 'text',
      subCategory: 'combinations',
      title: 'مناسبات النخبة - Royal Events',
      subtitle: 'خط المسيري المزخرف الرائع للأعراس والمناسبات والمؤتمرات الكبرى الفخمة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "مناسبات النخبة\nROYAL EVENTS" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#8b5cf6',
        fontFamily: "'El Messiri', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-car',
      category: 'text',
      subCategory: 'combinations',
      title: 'مركز المحركات - Engine Center',
      subtitle: 'خط شانغا الحاد والقوي مع تسمية إنجليزية لمراكز صيانة سيارات السباق والصيانة',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "مركز المحركات\nENGINE CENTER" },
      customFormatting: {
        fontSize: '26px',
        bold: true,
        color: '#dc2626',
        fontFamily: "'Changa', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-studio',
      category: 'text',
      subCategory: 'combinations',
      title: 'استوديو العدسة - Lens Studio',
      subtitle: 'خط الإسكندرية الفني الأنيق مدمج مع تسمية إنجليزية لاستوديوهات التصوير الفوتوغرافي',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "استوديو العدسة\nLENS STUDIO" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#4f46e5',
        fontFamily: "'Alexandria', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-kids',
      category: 'text',
      subCategory: 'combinations',
      title: 'ألعاب الأطفال - Kids Zone',
      subtitle: 'خط مرحي الترفيهي الجذاب والطفولي الملائم لعالم ومحلات ألعاب ومستلزمات الأطفال',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "ألعاب الأطفال\nKIDS ZONE" },
      customFormatting: {
        fontSize: '28px',
        bold: true,
        color: '#f59e0b',
        fontFamily: "'Marhey', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-marketing',
      category: 'text',
      subCategory: 'combinations',
      title: 'قمة التسويق - Max Marketing',
      subtitle: 'خط القاهرة الهندسي الأنيق مع تسمية إنجليزية ذكية لوكالات الدعاية والإعلان الرقمي',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "قمة التسويق\nMAX MARKETING" },
      customFormatting: {
        fontSize: '24px',
        bold: true,
        color: '#ea580c',
        fontFamily: "'Cairo', sans-serif",
        textAlign: 'center',
        lineHeight: '1.5'
      },
    },
    {
      id: 'text-combo-bi-pets',
      category: 'text',
      subCategory: 'combinations',
      title: 'أليف الغالي - My Dear Pet',
      subtitle: 'خط زين الناعم والجميل مع سياق إنجليزي لعيادات ومتاجر رعاية الأليفين والحيوانات',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "أليف الغالي\nMY DEAR PET" },
      customFormatting: {
        fontSize: '25px',
        bold: true,
        color: '#0ea5e9',
        fontFamily: "'Zain', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },
    {
      id: 'text-combo-bi-design',
      category: 'text',
      subCategory: 'combinations',
      title: 'إبداع جرافيك - Creative Graphic',
      subtitle: 'خط كوفام معاصر ومتزن جداً لشركات ومصممي الجرافيك وصانعي الهويات البصرية',
      type: 'text_heading_large',
      previewType: 'text',
      customData: { text: "إبداع جرافيك\nCREATIVE GRAPHIC" },
      customFormatting: {
        fontSize: '25px',
        bold: true,
        color: '#4f46e5',
        fontFamily: "'Kufam', sans-serif",
        textAlign: 'center',
        lineHeight: '1.4'
      },
    },

    // ================= 2. صور IMAGE =================
    {
      id: 'img-standard-color',
      category: 'image',
      subCategory: 'standard',
      title: 'صورة متناسقة مع ألوان الصفحة',
      subtitle: 'صورة افتراضية بألوان الهوية المحددة',
      type: 'image',
      previewType: 'image',
      customData: { isColorPlaceholder: true, alt: 'صورة مخصصة' },
    },
    {
      id: 'img-circle-avatar',
      category: 'image',
      subCategory: 'rounded',
      title: 'صورة دائرية (أفاتار / شعار)',
      subtitle: 'قص دائري كامل بحواف ناعمة',
      type: 'image',
      previewType: 'image',
      customData: { isColorPlaceholder: true, alt: 'صورة دائرية' },
      customFormatting: { borderRadius: '9999px' },
    },
    {
      id: 'img-rounded-frame',
      category: 'image',
      subCategory: 'framed',
      title: 'صورة بظل ثلاثي الأبعاد وزوايا ناعمة',
      subtitle: 'حواف مستديرة 24px وظل عميق يبرز الصورة',
      type: 'image',
      previewType: 'image',
      customData: { isColorPlaceholder: true, alt: 'صورة بإطار مميز' },
      customFormatting: { borderRadius: '24px', boxShadow: '0 20px 35px -10px rgba(0,0,0,0.3)' },
    },
    {
      id: 'img-unsplash-nature',
      category: 'image',
      subCategory: 'unsplash',
      title: 'صورة طبيعة وتصميم (Unsplash)',
      subtitle: 'صورة عالية الجودة من تصاميم الطبيعة والمعمار',
      type: 'image',
      previewType: 'image',
      customData: {
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
        alt: 'عمارة وتصميم راقي',
      },
    },

    // ================= 3. أزرار BUTTON =================
    {
      id: 'btn-classic-rect',
      category: 'button',
      subCategory: 'standard',
      title: 'زر مستطيل ناعم',
      subtitle: 'زر بتصميم كلاسيكي متوازن بحواف 12px',
      type: 'button',
      previewType: 'button',
      customData: { label: 'زر', style: { borderRadius: '12px' } },
    },
    {
      id: 'btn-pill-rounded',
      category: 'button',
      subCategory: 'standard',
      title: 'زر كبسولي دائري (Pill)',
      subtitle: 'حواف دائرية كاملة تمنح مظهراً عصرياً',
      type: 'button',
      previewType: 'button',
      customData: { label: 'تصفح الآن', style: { borderRadius: '9999px' } },
    },
    {
      id: 'btn-gradient-lux',
      category: 'button',
      subCategory: 'gradient',
      title: 'زر متدرج الألوان (Gradient)',
      subtitle: 'تدرج فخم من ألوان الهوية البصرية',
      type: 'button',
      previewType: 'button',
      customData: {
        label: 'ابدأ التجربة',
        style: {
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
          color: '#ffffff',
          boxShadow: '0 10px 20px -5px rgba(37,99,235,0.4)',
        },
      },
    },
    {
      id: 'btn-neon-glow',
      category: 'button',
      subCategory: 'gradient',
      title: 'زر نيون متوهج (Glow Button)',
      subtitle: 'إشعاع نيون خفيف يلفت انتباه الزائر',
      type: 'button',
      previewType: 'button',
      customData: {
        label: 'احجز مكانك',
        style: {
          backgroundColor: '#0284c7',
          color: '#ffffff',
          boxShadow: '0 0 20px rgba(2,132,199,0.7)',
        },
      },
    },
    {
      id: 'btn-icon-whatsapp',
      category: 'button',
      subCategory: 'icons',
      title: 'زر تواصل واتساب فوري',
      subtitle: 'زر أخضر مجهز للتواصل المباشر',
      type: 'button',
      previewType: 'button',
      customData: {
        label: 'تواصل عبر واتساب',
        style: {
          backgroundColor: '#16a34a',
          color: '#ffffff',
          borderRadius: '16px',
        },
      },
    },
    {
      id: 'btn-outline-ghost',
      category: 'button',
      subCategory: 'outline',
      title: 'زر مفرغ أنيق (Ghost / Outline)',
      subtitle: 'خلفية شفافة بإطار متقن ينسجم مع الخلفيات',
      type: 'button',
      previewType: 'button',
      customData: {
        label: 'معرفة المزيد',
        style: {
          backgroundColor: 'transparent',
          color: primaryColor,
          border: `2px solid ${primaryColor}`,
        },
      },
    },

    // ================= 4. أشكال هندسية وصور GRAFIK =================
    {
      id: 'shape-box-soft',
      category: 'shapes_grafik',
      subCategory: 'geometric',
      title: 'مستطيل بحواف ناعمة (Card Shape)',
      subtitle: 'كتلة هندسية ملونة كخلفية أو عنصر تركيز',
      type: 'geometric_shape',
      previewType: 'shape',
      customData: { shapeType: 'rectangle' },
    },
    {
      id: 'shape-circle-gradient',
      category: 'shapes_grafik',
      subCategory: 'geometric',
      title: 'دائرة متدرجة ناعمة',
      subtitle: 'شكل دائري متناسق لزينة الخلفيات والشارات',
      type: 'geometric_shape',
      previewType: 'shape',
      customData: { shapeType: 'circle' },
    },
    {
      id: 'shape-capsule',
      category: 'shapes_grafik',
      subCategory: 'geometric',
      title: 'كبسولة هندسية أفقية',
      subtitle: 'شكل كبسولي للوسوم والعلامات البارزة',
      type: 'geometric_shape',
      previewType: 'shape',
      customData: { shapeType: 'capsule' },
    },
    {
      id: 'shape-star-badge',
      category: 'shapes_grafik',
      subCategory: 'vectors',
      title: 'نجمة التميز (Star Badge)',
      subtitle: 'شعار نجمي لتمييز العروض والتقييمات',
      type: 'geometric_shape',
      previewType: 'shape',
      customData: { shapeType: 'star' },
    },
    {
      id: 'shape-arrow-graphic',
      category: 'shapes_grafik',
      subCategory: 'vectors',
      title: 'سهم توجيهي فكتور (Arrow Graphic)',
      subtitle: 'رسم توجيهي يلفت الأنظار للأزرار والمحتوى',
      type: 'geometric_shape',
      previewType: 'shape',
      customData: { shapeType: 'arrow' },
    },
    {
      id: 'shape-divider-line',
      category: 'shapes_grafik',
      subCategory: 'dividers',
      title: 'خط فاصل أفقي متدرج',
      subtitle: 'فاصل ناعم يقسم أقسام الشريحة برقة',
      type: 'divider_line',
      previewType: 'shape',
      customData: {},
    },

    // ================= 5. بطاقات CARDS =================
    {
      id: 'card-service-feature',
      category: 'cards',
      subCategory: 'services',
      title: 'بطاقة خدمة وميزة',
      subtitle: 'أيقونة مميزة + عنوان + شرح موجز + زر',
      type: 'card',
      previewType: 'card',
      customData: {
        text: 'خدمة احترافية متميزة',
        description: 'نقدم حلولاً متكاملة ترتقي بأعمالك وتلبي طموحاتك بأعلى معايير الجودة.',
        buttonLabel: 'اكتشف الخدمة',
      },
    },
    {
      id: 'card-media-combo',
      category: 'cards',
      subCategory: 'featured',
      title: 'بطاقة متكاملة (صورة + نص + زر)',
      subtitle: 'صورة في الأعلى يعقبها محتوى غني وزر تفاعلي',
      type: 'card',
      previewType: 'card',
      customData: {
        text: 'باقة المنتجات المختارة',
        buttonLabel: 'اطلب الآن',
        isColorPlaceholder: true,
      },
    },
    {
      id: 'card-profile-user',
      category: 'cards',
      subCategory: 'profile',
      title: 'بطاقة تعريفية شخصية / بروفايل',
      subtitle: 'أفاتار + اسم + منصب + أزرار تواصل',
      type: 'card',
      previewType: 'card',
      customData: {
        text: user?.fullName || 'محمد الأحمد',
        role: user?.professionCategory || 'مستشار ومطور أعمال',
        buttonLabel: 'حجز استشارة',
      },
    },

    // ================= 6. معرض صور GALLERY =================
    {
      id: 'gallery-5-balanced',
      category: 'gallery',
      subCategory: 'layout5',
      title: 'معرض خماسي متناسق (5 صور مترابطة)',
      subtitle: 'توزيع ذكي صورة كبرى رئيسية مع 4 صور جانبية',
      type: 'gallery_5',
      previewType: 'gallery',
      customData: { isColorPlaceholder: true },
    },
    {
      id: 'gallery-grid-responsive',
      category: 'gallery',
      subCategory: 'grid',
      title: 'شبكة صور متجاوبة (Photo Grid)',
      subtitle: 'عرض شبكي متناسق لعرض المنتجات والأعمال',
      type: 'gallery_5',
      previewType: 'gallery',
      customData: { layout: 'grid' },
    },

    // ================= 7. فيديو VIDEO =================
    {
      id: 'video-player-responsive',
      category: 'video',
      subCategory: 'player',
      title: 'مشغل فيديو تفاعلي',
      subtitle: 'حاوية فيديو أنيقة متوافقة مع جميع المقاسات',
      type: 'video',
      previewType: 'video',
      customData: { isColorPlaceholder: true },
    },
    {
      id: 'video-youtube-embed',
      category: 'video',
      subCategory: 'youtube',
      title: 'فيديو يوتيوب (YouTube Player)',
      subtitle: 'تضمين فيديو يوتيوب مع زر تشغيل أنيق',
      type: 'video',
      previewType: 'video',
      customData: { videoUrl: 'https://www.youtube.com' },
    },

    // ================= 8. استمارة تواصل CONTACT =================
    {
      id: 'form-quick-contact',
      category: 'contact_form',
      subCategory: 'quick',
      title: 'استمارة تواصل ومراسلة سريعة',
      subtitle: 'حقول الاسم، الهاتف، الرسالة، وزر الإرسال',
      type: 'contact_form',
      previewType: 'form',
      customData: { buttonLabel: 'إرسال الرسالة' },
    },
    {
      id: 'form-newsletter-subscribe',
      category: 'contact_form',
      subCategory: 'newsletter',
      title: 'صندوق اشتراك ونشرة بريدية',
      subtitle: 'حقل إدخال البريد الإلكتروني مع زر اشتراك فوري',
      type: 'contact_form',
      previewType: 'form',
      customData: {
        title: 'اشترك في النشرة الإخبارية',
        buttonLabel: 'اشتراك',
        isNewsletter: true,
      },
    },

    // ================= 9. خرائط جوجل GOOGLE MAP =================
    {
      id: 'map-interactive-view',
      category: 'google_map',
      subCategory: 'interactive',
      title: 'خريطة تفاعلية كاملة',
      subtitle: 'عرض جغرافي مباشر لمدينة أو عنوان المقر',
      type: 'google_map',
      previewType: 'map',
      customData: {
        mapQuery: user?.city || user?.governorate || 'دمشق، سوريا',
        isColorPlaceholder: true,
      },
    },

    // ================= 10. حجز مواعيد BOOKINGS =================
    {
      id: 'booking-quick-slot',
      category: 'bookings',
      subCategory: 'quick_book',
      title: 'بطاقة حجز موعد واستشارة سريعة',
      subtitle: 'أوقات متاحة للاختيار مع زر تأكيد الحجز',
      type: 'booking_calendar',
      previewType: 'booking',
      customData: {
        title: 'حجز موعد استشارة',
        description: 'اختر التوقيت المفضل لحجز جلستك بسهولة',
        buttonLabel: 'تأكيد الموعد',
        slots: ['10:00 ص', '12:00 م', '03:30 م', '05:00 م'],
      },
    },

    // ================= 11. حاوية أسعار PRICING =================
    {
      id: 'pricing-single-card',
      category: 'pricing',
      subCategory: 'single_plan',
      title: 'بطاقة باقة تسعير فردية',
      subtitle: 'عنوان الباقة، السعر، قائمة ميزات، وزر اشتراك',
      type: 'pricing_table',
      previewType: 'pricing',
      customData: {
        planName: 'الباقة المتقدمة',
        price: '99',
        period: 'شهرياً',
        features: ['وصول لكافة الأدوات', 'دعم فني على مدار الساعة', 'تحديثات مجانية مستمرة'],
        buttonLabel: 'اختر هذه الباقة',
      },
    },

    // ================= 12. أيقونات سوسيال SOCIAL =================
    {
      id: 'social-icons-strip',
      category: 'social',
      subCategory: 'circle_icons',
      title: 'شريط أيقونات شبكات التواصل',
      subtitle: 'واتساب، اتصال، فيسبوك، انستغرام بألوان متناسقة',
      type: 'social_icons',
      previewType: 'social',
      customData: {},
    },

    // ================= 13. قائمة وتنقل MENU =================
    {
      id: 'menu-nav-horizontal',
      category: 'menu',
      subCategory: 'horizontal',
      title: 'شريط روابط تنقل أفقي (Header Menu)',
      subtitle: 'روابط أقسام الصفحة: الرئيسية، من نحن، خدماتنا، اتصل بنا',
      type: 'navigation_menu',
      previewType: 'menu',
      customData: {
        links: ['الرئيسية', 'من نحن', 'خدماتنا', 'أعمالنا', 'اتصل بنا'],
      },
    },

    // ================= 14. حاوية HTML =================
    {
      id: 'html-custom-embed',
      category: 'html',
      subCategory: 'code_box',
      title: 'حاوية كود وتنسيق HTML مخصص',
      subtitle: 'مكان لإدراج ويدجت خارجية، إطارات، أو تصاميم برمجية',
      type: 'html_code',
      previewType: 'html',
      customData: {
        htmlCode: '<div style="padding: 16px; text-align: center; font-weight: bold; border-radius: 12px; background: rgba(37,99,235,0.08); border: 1px dashed #2563eb;">مستند برمجي مخصص HTML</div>',
      },
    },
  ], [primaryColor, accentColor, user]);

  // Filtered items based on active category, subTab, and search
  const filteredItems = useMemo(() => {
    let list = catalogItems;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q)
      );
    }

    list = list.filter((item) => item.category === activeCategory);

    if (activeSubTab !== 'all') {
      list = list.filter((item) => item.subCategory === activeSubTab);
    }

    return list;
  }, [catalogItems, activeCategory, activeSubTab, searchQuery]);

  const handleSelectItem = (item: ElementCatalogItem) => {
    const modifiedItem = getModifiedItem(item);
    const newElement = createDefaultModularElement(
      modifiedItem.type,
      user,
      colorScheme,
      { x: 80, y: 80 },
      modifiedItem.customData,
      modifiedItem.customFormatting
    );

    onAddElement(newElement);

    // Provide visual feedback
    setLastAddedId(item.id);
    setTimeout(() => {
      setLastAddedId(null);
    }, 1200);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] pointer-events-auto flex justify-start items-stretch">
      {/* 1. Backdrop to click outside and close smoothly */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* 2. Large White Panel covering ~40% of the screen (Wix Studio style) */}
      <div
        ref={panelRef}
        dir="ltr"
        id="flyout-add-element-panel"
        className="relative z-10 w-full sm:w-[540px] md:w-[45vw] md:min-w-[500px] md:max-w-[700px] h-full bg-white shadow-[0_25px_80px_rgba(0,0,0,0.35)] flex flex-row border-r border-slate-200 overflow-hidden select-none animate-in slide-in-from-left duration-300"
      >
        {/* ================= LEFT NAVBAR (نافبار يساري بأيقونات العناصر) ================= */}
        <aside
          id="flyout-left-navbar"
          onMouseEnter={() => setIsNavHovered(true)}
          onMouseLeave={() => setIsNavHovered(false)}
          className={`h-full bg-slate-50 border-r border-slate-200/90 flex flex-col justify-between py-3 transition-all duration-300 ease-out z-20 shrink-0 ${
            isNavHovered ? 'w-52 shadow-2xl' : 'w-16'
          }`}
          title="تمرير الماوس لتوسيع وشرح الأيقونات"
        >
          {/* Top Categories List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 py-1 space-y-1">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isActive = activeCategory === cat.id && !searchQuery;

              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`cat-btn-${cat.id}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setActiveSubTab('all');
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-right group relative ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 font-medium'
                  }`}
                  title={`${cat.label}: ${cat.description}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600 group-hover:scale-110'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  {/* Text Label: visible when navbar expands on hover */}
                  <div
                    dir="rtl"
                    className={`flex flex-col text-right min-w-0 transition-all duration-200 ${
                      isNavHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'
                    } ${!isNavHovered ? 'hidden' : ''}`}
                  >
                    <span className="text-xs font-bold whitespace-nowrap leading-tight">
                      {cat.label}
                    </span>
                    <span className={`text-[10px] whitespace-nowrap truncate max-w-[120px] mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {cat.description}
                    </span>
                  </div>

                  {/* Active Indicator dot when collapsed */}
                  {isActive && !isNavHovered && (
                    <span className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom helper tip */}
          <div className="px-2 pt-2 border-t border-slate-200 text-center">
            <div
              className={`text-[10px] text-slate-400 flex items-center justify-center gap-1 transition-opacity ${
                isNavHovered ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              {isNavHovered && <span className="whitespace-nowrap font-medium text-slate-600">14 فئة جاهزة</span>}
            </div>
          </div>
        </aside>

        {/* ================= RIGHT MAIN CONTENT AREA ================= */}
        <main dir="rtl" className="flex-1 flex flex-col h-full bg-white overflow-hidden min-w-0">
          {/* Top Panel Bar: Search & Header & Close */}
          <header className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-white/95 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Plus className="w-4 h-4" />
                  </span>
                  <span>إضافة عناصر للشريحة</span>
                </h2>
                {slideTitle && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    إضافة عناصر تفاعلية إلى: <span className="font-semibold text-slate-600">{slideTitle}</span>
                  </p>
                )}
              </div>

              {/* Close Button [X] */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="إغلاق اللوحة (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن نص، زر، صورة، بطاقة، خريطة، حجز..."
                className="w-full pr-10 pl-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="مسح البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </header>

          {/* Horizontal Subcategory Header Tabs (في رأس المربع بشكل عرضي) */}
          {!searchQuery && (
            <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-xs font-bold text-slate-800 shrink-0 ml-1">
                {CATEGORIES.find((c) => c.id === activeCategory)?.label}:
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {categorySubTabs[activeCategory]?.map((sub) => {
                  const isSelected = activeSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setActiveSubTab(sub.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 hover:text-slate-900'
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catalog Cards Grid (المحتوى والبطاقات المجهزة) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200">
            {activeCategory === 'button' && activeSubTab === 'lucide_icons_search' ? (
              <div className="space-y-4">
                {/* 1. حقل بحث الأيقونات */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الأيقونة بالعربي أو الإنجليزي (مثال: هاتف، نجمة، heart)..."
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  {iconSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setIconSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 2. تصفية وعرض الأيقونات */}
                {(() => {
                  const q = iconSearchQuery.toLowerCase().trim();
                  let matchedIconNames = POPULAR_ICONS;

                  if (q) {
                    let arabicKeys = Object.keys(ARABIC_TO_LUCIDE_MAP).filter(key => key.includes(q) || q.includes(key));
                    let matchedFromArabic: string[] = [];
                    arabicKeys.forEach(key => {
                      matchedFromArabic.push(...ARABIC_TO_LUCIDE_MAP[key]);
                    });

                    const allLucideKeys = Object.keys(LucideIcons).filter(key => {
                      return typeof (LucideIcons as any)[key] === 'function' && key[0] === key[0].toUpperCase() && key !== 'LucideIcon';
                    });

                    const matchedFromEnglish = allLucideKeys.filter(name => 
                      name.toLowerCase().includes(q)
                    );

                    const combined = Array.from(new Set([...matchedFromArabic, ...matchedFromEnglish]));
                    matchedIconNames = combined.slice(0, 120);
                  }

                  if (matchedIconNames.length === 0) {
                    return (
                      <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                        <HelpCircle className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-xs font-bold text-slate-600">لم نجد أيقونة مطابقة لبحثك</p>
                        <p className="text-[10px] text-slate-400 mt-1">جرب البحث بكلمة أخرى مثل: "اتصال"، "عربة"، "صح"</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="text-[11px] text-slate-400 font-medium">
                        تم العثور على {matchedIconNames.length} أيقونة احترافية:
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50 scrollbar-thin">
                        {matchedIconNames.map((name) => {
                          const IconComponent = (LucideIcons as any)[name];
                          if (!IconComponent) return null;
                          const isJustAdded = lastAddedId === name;

                          return (
                            <div
                              key={name}
                              className={`relative group bg-white border rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 transition-all hover:shadow-xs cursor-pointer h-20 text-center ${
                                isJustAdded ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/30' : 'border-slate-100 hover:border-blue-500'
                              }`}
                              title={name}
                            >
                              {isJustAdded ? (
                                <Check className="w-6 h-6 text-emerald-600" />
                              ) : (
                                <IconComponent className="w-6 h-6 text-slate-700 group-hover:text-blue-600 group-hover:scale-110 transition-all" />
                              )}
                              <span className="text-[9px] text-slate-400 truncate max-w-full font-mono">
                                {isJustAdded ? 'تمت الإضافة' : name}
                              </span>

                              {/* Hover Options Overlay */}
                              {!isJustAdded && (
                                <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center gap-1.5 p-1 transition-opacity z-10 shadow-xs border border-blue-100">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const customData = {
                                        label: 'زر بأيقونة',
                                        icon: name,
                                        style: {
                                          fontSize: '14px',
                                          backgroundColor: primaryColor,
                                          color: '#ffffff',
                                          borderRadius: 12,
                                        }
                                      };
                                      const newElement = createDefaultModularElement(
                                        'button',
                                        user,
                                        colorScheme,
                                        { x: 80, y: 80 },
                                        customData
                                      );
                                      onAddElement(newElement);
                                      setLastAddedId(name);
                                      setTimeout(() => setLastAddedId(null), 1200);
                                    }}
                                    className="w-full text-[9px] font-bold py-1 px-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center transition-colors"
                                  >
                                    زر بأيقونة 🔘
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const customData = {
                                        label: '', // Only icon
                                        icon: name,
                                        style: {
                                          fontSize: '24px',
                                          backgroundColor: 'transparent',
                                          color: primaryColor,
                                          borderStyle: 'none',
                                          borderWidth: 0,
                                          borderRadius: 8,
                                        }
                                      };
                                      const newElement = createDefaultModularElement(
                                        'button',
                                        user,
                                        colorScheme,
                                        { x: 80, y: 80 },
                                        customData
                                      );
                                      onAddElement(newElement);
                                      setLastAddedId(name);
                                      setTimeout(() => setLastAddedId(null), 1200);
                                    }}
                                    className="w-full text-[9px] font-bold py-1 px-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-md text-center transition-colors"
                                  >
                                    أيقونة فقط ✨
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Search className="w-10 h-10 mb-2 opacity-30 text-slate-500" />
                <p className="text-sm font-bold text-slate-600">لا توجد عناصر مطابقة لبحثك</p>
                <p className="text-xs text-slate-400 mt-1">جرب البحث بكلمة أخرى مثل: "عنوان"، "نيون"، "زر"، أو "خريطة"</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveSubTab('all');
                  }}
                  className="mt-4 px-4 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredItems.map((item) => {
                  const isJustAdded = lastAddedId === item.id;
                  const modifiedItem = getModifiedItem(item);

                  return (
                    <div
                      key={item.id}
                      id={`catalog-card-${item.id}`}
                      onClick={() => handleSelectItem(item)}
                      className={`relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group bg-white ${
                        isJustAdded
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/40 shadow-md'
                          : 'border-slate-200 hover:border-blue-500 hover:shadow-md hover:translate-y-[-1px]'
                      }`}
                    >
                      {/* Item Visual Preview Container */}
                      <div className="w-full min-h-[90px] rounded-xl bg-slate-50 border border-slate-100/90 p-3 flex items-center justify-center text-center mb-2.5 overflow-hidden transition-colors group-hover:bg-blue-50/30">
                        {renderItemPreview(modifiedItem, primaryColor, accentColor)}
                      </div>

                      {/* Color Selector Arrows (حلقة تغير لون النص قبل الإضافة) */}
                      {item.category === 'text' && (
                        <div 
                          className="flex items-center justify-between w-full bg-slate-100/70 hover:bg-slate-100 rounded-lg px-2 py-1 mb-2.5 text-[10px] text-slate-500 font-bold"
                          onClick={(e) => e.stopPropagation()} // منع الإضافة عند تحديد اللون
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCycleColor(item.id, -1);
                            }}
                            className="p-1 hover:bg-white rounded-md transition-colors animate-pulse"
                            title="اللون السابق"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                          
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-slate-200/80 shadow-xs" 
                              style={{ backgroundColor: PRESET_COLORS[itemColorIndexes[item.id] ?? 0] }}
                            />
                            <span>تغيير اللون</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCycleColor(item.id, 1);
                            }}
                            className="p-1 hover:bg-white rounded-md transition-colors animate-pulse"
                            title="اللون التالي"
                          >
                            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        </div>
                      )}

                      {/* Item Info */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h4>
                          {isJustAdded ? (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                              <Check className="w-3 h-3" />
                              تمت الإضافة
                            </span>
                          ) : (
                            <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold flex items-center gap-0.5">
                              <Plus className="w-3 h-3" />
                              إضافة
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <footer className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
            <span>انقر على أي عنصر لإضافته فوراً إلى الشريحة الحالية</span>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              إغلاق
            </button>
          </footer>
        </main>
      </div>
    </div>,
    document.body
  );
};

// Helper renderer for item previews inside cards
function renderItemPreview(item: ElementCatalogItem, primaryColor: string, accentColor: string) {
  switch (item.previewType) {
    case 'text': {
      if (item.id === 'text-quote-block') {
        return (
          <div className="border-r-2 border-blue-500 pr-2 text-[11px] text-slate-700 italic text-right w-full">
            «اقتباس مميز ومُلهم»
          </div>
        );
      }
      if (item.id === 'text-explanatory-small') {
        return (
          <div className="w-full h-full p-2.5 flex flex-col justify-center text-right overflow-hidden">
            <span className="text-[9px] font-bold text-slate-400 mb-1 block">نص شرحي توضيحي</span>
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
              {item.customData?.text}
            </p>
          </div>
        );
      }
      if (item.id === 'text-combo-stat-number') {
        return (
          <div className="flex flex-col items-center">
            <span className="text-xl font-extrabold text-blue-600">+99%</span>
            <span className="text-[9px] text-slate-500">نسبة الرضا</span>
          </div>
        );
      }

      // Dynamic text preview rendering supporting custom formatting & neons & gradients perfectly
      const fmt = item.customFormatting || {};
      const previewStyle: React.CSSProperties = {
        fontSize: '18px', // scaled down slightly for aesthetic fit inside the small preview card
        fontFamily: fmt.fontFamily || "'Cairo', sans-serif",
        fontWeight: fmt.bold ? 'bold' : 'normal',
        fontStyle: fmt.italic ? 'italic' : undefined,
        textDecoration: fmt.underline ? 'underline' : undefined,
        color: fmt.color || '#0f172a',
        textShadow: fmt.textShadow || undefined,
        lineHeight: fmt.lineHeight || '1.4',
        direction: 'rtl',
        whiteSpace: 'pre-wrap',
        textAlign: 'center',
      };

      if (fmt.textGradient) {
        previewStyle.backgroundImage = fmt.textGradient;
        previewStyle.WebkitBackgroundClip = 'text';
        previewStyle.WebkitTextFillColor = 'transparent';
        previewStyle.backgroundClip = 'text';
      }

      if (fmt.WebkitTextStroke) {
        previewStyle.WebkitTextStroke = fmt.WebkitTextStroke;
      }

      return (
        <span className="font-extrabold text-center px-2 select-none line-clamp-2 w-full" style={previewStyle}>
          {item.customData?.text || item.title}
        </span>
      );
    }

    case 'button':
      return (
        <div
          className="px-4 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-transform group-hover:scale-105"
          style={{
            backgroundColor: item.customData?.style?.backgroundColor || primaryColor,
            color: item.customData?.style?.color || '#ffffff',
            borderRadius: item.customData?.style?.borderRadius || '12px',
            border: item.customData?.style?.border || 'none',
            background: item.customData?.style?.background,
            boxShadow: item.customData?.style?.boxShadow,
          }}
        >
          {item.customData?.label || 'زر'}
        </div>
      );

    case 'image':
      if (item.id === 'img-circle-avatar') {
        return (
          <div
            className="w-12 h-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <ImageIcon className="w-5 h-5" />
          </div>
        );
      }
      if (item.id === 'img-unsplash-nature') {
        return (
          <div className="w-24 h-14 rounded-lg overflow-hidden relative shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80"
              alt="معاينة"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        );
      }
      return (
        <div
          className="w-24 h-14 rounded-xl border border-dashed flex items-center justify-center text-white shadow-2xs"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}20 0%, ${accentColor}30 100%)`,
            borderColor: `${primaryColor}60`,
          }}
        >
          <ImageIcon className="w-5 h-5 text-blue-600" />
        </div>
      );

    case 'shape':
      if (item.id === 'shape-star-badge') {
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
        );
      }
      if (item.id === 'shape-arrow-graphic') {
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <ArrowRight className="w-5 h-5" />
          </div>
        );
      }
      if (item.id === 'shape-divider-line') {
        return (
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full" />
        );
      }
      if (item.id === 'shape-circle-gradient') {
        return (
          <div
            className="w-11 h-11 rounded-full shadow-sm"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
          />
        );
      }
      return (
        <div
          className="w-16 h-10 rounded-xl shadow-xs"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
        />
      );

    case 'card':
      return (
        <div className="w-full max-w-[170px] p-2 bg-white rounded-xl border border-slate-200 shadow-2xs text-right space-y-1">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="h-2 w-3/4 bg-slate-200 rounded" />
          <div className="h-1.5 w-full bg-slate-100 rounded" />
        </div>
      );

    case 'gallery':
      return (
        <div className="grid grid-cols-3 gap-1 w-28">
          <div className="h-9 col-span-2 rounded bg-blue-200" />
          <div className="h-9 rounded bg-amber-200" />
          <div className="h-6 rounded bg-emerald-200" />
          <div className="h-6 rounded bg-purple-200" />
          <div className="h-6 rounded bg-sky-200" />
        </div>
      );

    case 'video':
      return (
        <div className="w-24 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
            <Video className="w-3.5 h-3.5" />
          </div>
        </div>
      );

    case 'form':
      return (
        <div className="w-full max-w-[150px] p-1.5 bg-white rounded-lg border border-slate-200 space-y-1 text-[8px] text-slate-400">
          <div className="p-1 rounded bg-slate-50 border border-slate-100">الاسم الكامل</div>
          <div className="p-1 rounded bg-slate-50 border border-slate-100">رقم الهاتف</div>
        </div>
      );

    case 'map':
      return (
        <div className="w-24 h-14 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center text-blue-600">
          <MapPin className="w-5 h-5 mb-0.5 text-red-500" />
          <span className="text-[8px] font-bold text-slate-600">خريطة الموقع</span>
        </div>
      );

    case 'booking':
      return (
        <div className="w-full max-w-[150px] p-2 bg-white rounded-xl border border-slate-200 text-center space-y-1">
          <Calendar className="w-4 h-4 mx-auto text-blue-600" />
          <span className="text-[9px] font-bold block text-slate-800">حجز موعد</span>
          <div className="flex justify-center gap-1">
            <span className="text-[7px] px-1 py-0.5 rounded bg-blue-50 text-blue-600">10:00</span>
            <span className="text-[7px] px-1 py-0.5 rounded bg-blue-50 text-blue-600">02:00</span>
          </div>
        </div>
      );

    case 'pricing':
      return (
        <div className="w-full max-w-[140px] p-2 bg-white rounded-xl border border-slate-200 text-center space-y-1">
          <span className="text-[9px] font-bold text-slate-800 block">الباقة المميزة</span>
          <span className="text-xs font-black text-blue-600 block">99$</span>
        </div>
      );

    case 'social':
      return (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">W</span>
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">F</span>
          <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">I</span>
        </div>
      );

    case 'menu':
      return (
        <div className="flex items-center gap-1 text-[8px] font-bold text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg border">
          <span>الرئيسية</span>
          <span>•</span>
          <span>خدماتنا</span>
          <span>•</span>
          <span>تواصل</span>
        </div>
      );

    case 'html':
      return (
        <div className="font-mono text-[9px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
          &lt;/&gt; كود مخصص
        </div>
      );

    default:
      return <Sparkles className="w-6 h-6 text-blue-500" />;
  }
}
