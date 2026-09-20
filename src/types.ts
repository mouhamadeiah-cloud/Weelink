export type AppPage = 'home' | 'workshop' | 'register';

export type Gender = 'male' | 'female' | '';

export interface UserRegistrationData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  gender: Gender;
  phone: string;
  email: string;
  pageTitle: string;
  authMethod: 'direct' | 'google' | 'facebook' | 'apple';

  // Step 2: Location & Address
  governorate: string;
  locationType: 'urban' | 'rural';
  city: string;
  neighborhood: string;
  district: string;
  subdistrict: string;
  village: string;
  addressDescription: string;

  // Step 2: Profession & Catalog
  professionCategory: string;
  specialty: string;
}

// Modular Component Types (عناصر الشرائح القابلة للتعديل)
export type ModularElementType =
  | 'text_heading_large' // ١. نص عنوان كبير
  | 'text_heading_medium' // ٢. نص متوسط
  | 'text_body' // ٣. نص شرحي
  | 'text_body_2000' // صندوق نصي كبير يمكن ان يحتوي حتى ٢٠٠٠ حرف
  | 'image' // صورة
  | 'button' // زر
  | 'geometric_shape' // أشكال هندسية
  | 'google_map' // خرائط جوجل
  | 'gallery_5' // معرض الصور (مجموعة من 5 صور مترابطة)
  | 'contact_form' // استمارة اتصال (معلومات المرسل + مربع نصي + زر إرسال)
  | 'video' // فيديو
  | 'divider_line' // خطوط طولية وعرضية
  | 'html_code' // مكان للبرمجة HTML
  | 'social_icons' // أيقونات واختصارات
  | 'card' // بطاقة متكاملة
  | 'booking_calendar' // حجز مواعيد
  | 'pricing_table' // حاوية أسعار
  | 'navigation_menu'; // قائمة وتنقل

// Freeform Grid & Positioning interfaces
export interface ElementPosition {
  x: number; // horizontal coordinate in pixels
  y: number; // vertical coordinate in pixels
  width?: number | string; // element width in px or %
  height?: number | string; // element height in px or auto
  rotation?: number; // rotation in degrees (-180 to 180)
  zIndex?: number; // stacking order index
}

export interface SnapGuide {
  id: string;
  type: 'x' | 'y'; // vertical or horizontal line
  position: number; // pixel coordinate
  label?: string; // description (e.g. "المنتصف", "محاذاة مع عنصر")
}

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export interface ElementAnimationConfig {
  type: string; // 'none' or animation ID from visualEffectsData
  speed?: AnimationSpeed;
  pauseOnHover?: boolean;
}

export interface ModularElement {
  id: string;
  type: ModularElementType;
  title?: string;
  data: Record<string, any>;
  formattingStyle?: TextFormattingStyle;
  animation?: ElementAnimationConfig;
  position?: ElementPosition;
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  rotation?: number;
  zIndex?: number;
  isLocked?: boolean;
}

export type ImageLightingPosition =
  | 'none'
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface ImageLightingConfig {
  enabled: boolean;
  position: ImageLightingPosition;
  intensity: number; // 0 to 1
  color?: string; // hex or rgba
  spread?: number; // 20 to 100
}

export type ImageEffectType =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'vintage'
  | 'contrast'
  | 'vibrant'
  | 'cool'
  | 'dramatic'
  | 'blur'
  | 'neon'
  | 'invert';

export interface ImageEffectConfig {
  type: ImageEffectType;
  intensity: number; // 0 to 1
}

export type ImageShadowDirection =
  | 'none'
  | 'bottom'
  | 'bottom-right'
  | 'bottom-left'
  | 'right'
  | 'left'
  | 'top'
  | 'top-right'
  | 'top-left'
  | 'center';

export interface ImageShadowConfig {
  enabled: boolean;
  direction: ImageShadowDirection;
  blur: number; // 0 to 60px
  spread?: number; // 0 to 20px
  intensity?: number; // 0.1 to 1
  color?: string;
}

export interface ImageElementData {
  imageUrl?: string;
  alt?: string;
  isColorPlaceholder?: boolean;
  opacity?: number; // 0.1 to 1.0
  link?: {
    type: 'internal' | 'url' | 'phone' | 'whatsapp' | 'email';
    value: string;
    openInNewTab?: boolean;
  };
  lighting?: ImageLightingConfig;
  effect?: ImageEffectConfig;
  shadow?: ImageShadowConfig;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export type SlideType =
  | 'intro'
  | 'about'
  | 'works'
  | 'team'
  | 'offers'
  | 'contact'
  | 'pricing'
  | 'gallery'
  | 'video'
  | 'booking'
  | 'text_block'
  | 'empty';

export type SlideArrangement = 'straight' | 'overlapping';

export interface PageColorScheme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  gradient: string;
  navbarBg: string;
  cardBg: string;
  previewColors: [string, string, string];
  bgRadial?: string;
  bgStart?: string;
  bgEnd?: string;
  borderColor?: string;
  borderHighlight?: string;
  textAccent?: string;
  isCustom?: boolean;
}

export type SlideCornerShape =
  | 'rounded' // دائرية متناسقة
  | 'sharp' // حادة ومستقيمة
  | 'leaf' // ورقة شجر (قطريتان دائريتان ومتقابلتان حادتان)
  | 'pill' // كبسولة كاملة
  | 'ticket' // قسيمة مقطوعة الأطراف
  | 'scoop'; // مقوسة للداخل أو غير متماثلة

export interface SlideStyle {
  backgroundColor?: string;
  transparent?: boolean;
  backgroundImage?: string;
  borderWidth?: number; // 0, 1, 2, 4, 8
  borderColor?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge';
  borderRadius?: number; // 0, 8, 16, 24, 32, 48
  cornerShape?: SlideCornerShape; // شكل حواف الإطار
  customBorderRadius?: string; // قيمة CSS مخصصة مثل '32px 4px 32px 4px'
  gradientColorStart?: string;
  gradientColorMiddle?: string;
  gradientColorEnd?: string;
  colorScheme?: PageColorScheme;
  backgroundImageOpacity?: number; // من 0 إلى 1 لشفافية الصورة الخلفية
  backgroundAttachment?: 'fixed' | 'scroll'; // وضع تثبيت الصورة أو حركتها عند السحب
  backgroundLightingAngle?: 'top-left' | 'top-right' | 'center' | 'bottom' | 'none';
  backgroundEffect?: 'none' | 'blur' | 'grain' | 'vintage' | 'glow' | 'neon';
  shadow?: string;
  lightingEffect?: string;
  height?: number; // الارتفاع المخصص للشريحة بالبكسل
  minHeight?: number; // الحد الأدنى لارتفاع الشريحة
  animation?: ElementAnimationConfig; // التأثير البصري أو الحركة المطبقة على الشريحة
}

export interface Slide {
  id: string;
  type: SlideType;
  name: string;
  elements: ModularElement[];
  layoutVariant?: number; // 1 to 5: النموذج والتنسيق المختار
  style?: SlideStyle;
}

export interface SlideTemplateInfo {
  variantId: number; // 1 | 2 | 3 | 4 | 5
  name: string;
  description: string;
  badge: string;
  tagline: string;
}

export interface NavbarStyle {
  backgroundColor?: string;
  transparent?: boolean;
  backgroundImage?: string;
  backgroundImageOpacity?: number; // 0.1 to 1.0
  backgroundOpacity?: number; // 0.05 to 1.0 (شفافية خلفية النافبار مع بقاء النصوص حادة)
  backdropBlur?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  borderWidth?: number; // 0, 1, 2, 4
  borderColor?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderRadius?: number; // 0, 8, 16, 24, 9999 (زوايا الإطار)
  lightingEffect?: 'none' | 'glow-soft' | 'glow-cyan' | 'glow-purple' | 'glow-amber' | 'neon-border'; // الإضاءة
  shadow?: 'none' | 'soft' | 'medium' | 'deep' | 'glow'; // الظلال
  isSticky?: boolean; // 📌 تثبيت: true = ثابت عائم أثناء التمرير، false = متحرك مع الصفحة
  layoutVariant?: number; // 1 to 10: أشكال وتنسيقات النافبار المقترحة
  showLogo?: boolean;
  showCta?: boolean;
  ctaText?: string;
  navItemStyle?: 'text' | 'icon' | 'both' | 'pill';
}

export interface WebPage {
  id: string;
  title: string;
  slug: string;
  colorScheme: PageColorScheme;
  arrangement: SlideArrangement;
  slides: Slide[];
  navbarStyle?: NavbarStyle;
}

export interface TextFormattingStyle {
  align?: 'right' | 'center' | 'left';
  color?: string;
  backgroundColor?: string;
  opacity?: number; // 0.1 to 1.0 (شفافية النص)
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string;
  fontSize?: string; // e.g. '14px', '18px', '24px', '32px'
  listType?: 'none' | 'bullet' | 'numbered';
  link?: {
    type: 'internal' | 'url' | 'phone' | 'whatsapp' | 'email';
    value: string;
  };
  boxStyle?: {
    backgroundColor?: string;
    hasBackground?: boolean;
    backgroundOpacity?: number;
    transparent?: boolean;
    hasBorder?: boolean;
    borderWidth?: number; // 0, 1, 2, 4
    borderColor?: string;
    borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
    borderRadius?: number; // 0, 8, 16, 9999
    padding?: number; // 4, 8, 16, 24
    width?: string; // e.g. 'fit-content', '100%', '320px'
    minWidth?: string; // e.g. '48px', 'auto'
    minHeight?: string; // e.g. 'auto', '80px', '120px'
    autoFit?: boolean; // true = fits text automatically
  };
  animation?: ElementAnimationConfig; // التأثير البصري أو الحركة المطبقة على النص
  textShadow?: string;
  textGradient?: string;
  WebkitTextStroke?: string;
}

