import type { CSSProperties } from 'react';
import { ElementAnimationConfig, AnimationSpeed } from '../types';

export type EffectCategory = 'all' | 'stream' | 'waves' | 'ambient' | 'entrance' | 'attention';

export interface VisualEffectItem {
  id: string;
  name: string; // Arabic name
  englishName: string;
  category: Exclude<EffectCategory, 'all'>;
  categoryName: string;
  description: string;
  badge?: string;
  cssClass: string;
  defaultSpeed: AnimationSpeed;
  supportsPauseOnHover?: boolean;
  applicableTo: Array<'slide' | 'text' | 'button' | 'image'>;
}

export const VISUAL_EFFECTS_CATEGORIES: Array<{ id: EffectCategory; name: string; count?: number }> = [
  { id: 'all', name: 'جميع الحركات (25)' },
  { id: 'stream', name: 'جريان وتدفق (أخبار وبورصة)' },
  { id: 'waves', name: 'تماوج الألوان والتوهج' },
  { id: 'ambient', name: 'حيوية وطفو مستمر' },
  { id: 'entrance', name: 'حركات الظهور والدخول' },
  { id: 'attention', name: 'تفاعل ولفت الانتباه' },
];

export const VISUAL_EFFECTS_LIST: VisualEffectItem[] = [
  // 1. حركة الجريان وتدفق الأخبار والبورصة
  {
    id: 'flow-left',
    name: 'جريان البورصة والأخبار (يسار)',
    englishName: 'Ticker Flow Left',
    category: 'stream',
    categoryName: 'جريان وتدفق',
    description: 'حركة الجريان المستمرة كشريط الأخبار وأسعار البورصة متدفقة لليسار بانسيابية.',
    badge: 'أساسي ومطلوب',
    cssClass: 'effect-flow-left',
    defaultSpeed: 'normal',
    supportsPauseOnHover: true,
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'flow-right',
    name: 'جريان وتدفق معاكس (يمين)',
    englishName: 'Ticker Flow Right',
    category: 'stream',
    categoryName: 'جريان وتدفق',
    description: 'جريان أفقي متصل وسلس باتجاه اليمين للأشرطة والشعارات المتحركة.',
    badge: 'جريان يمين',
    cssClass: 'effect-flow-right',
    defaultSpeed: 'normal',
    supportsPauseOnHover: true,
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'flow-up',
    name: 'تدفق رأسي للأعلى',
    englishName: 'Vertical Flow Up',
    category: 'stream',
    categoryName: 'جريان وتدفق',
    description: 'صعود تدفقي متواصل من الأسفل للأعلى كنهايات الأفلام وقوائم الإعلانات.',
    cssClass: 'effect-flow-up',
    defaultSpeed: 'normal',
    supportsPauseOnHover: true,
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'flow-down',
    name: 'تدفق رأسي للأسفل',
    englishName: 'Vertical Flow Down',
    category: 'stream',
    categoryName: 'جريان وتدفق',
    description: 'هبوط تدفقي هادئ ومتصل من الأعلى للأسفل.',
    cssClass: 'effect-flow-down',
    defaultSpeed: 'normal',
    supportsPauseOnHover: true,
    applicableTo: ['slide', 'text', 'button', 'image'],
  },

  // 2. تماوج الألوان الطولي والعرضي والتوهج
  {
    id: 'gradient-wave-h',
    name: 'تماوج الألوان العرضي',
    englishName: 'Horizontal Color Wave',
    category: 'waves',
    categoryName: 'تماوج وتوهج',
    description: 'تماوج لوني غني وسلس ينتقل أفقياً من اليمين لليسار بألوان حيوية مذهلة.',
    badge: 'مطلوب مميز',
    cssClass: 'effect-gradient-wave-h',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'gradient-wave-v',
    name: 'تماوج الألوان الطولي',
    englishName: 'Vertical Color Wave',
    category: 'waves',
    categoryName: 'تماوج وتوهج',
    description: 'تماوج طولي للألوان يتدرج رأسياً من الأعلى للأسفل بحركة ناعمة وجذابة.',
    badge: 'مطلوب مميز',
    cssClass: 'effect-gradient-wave-v',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'rainbow-glow',
    name: 'توهج طيفي متدرج',
    englishName: 'Rainbow Ambient Glow',
    category: 'waves',
    categoryName: 'تماوج وتوهج',
    description: 'دوران هادئ لدرجات الطيف يغير ألوان الهالة والخلفية بانسيابية راقية.',
    cssClass: 'effect-rainbow-glow',
    defaultSpeed: 'slow',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'shimmer',
    name: 'بريق ضوئي منزلق',
    englishName: 'Shimmer Light Sweep',
    category: 'waves',
    categoryName: 'تماوج وتوهج',
    description: 'شعاع ضوء ماسي خاطف يمر فوق العنصر دورياً ليمنحه فخامة ولمعاناً.',
    cssClass: 'effect-shimmer',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'neon-pulse',
    name: 'نبض النيون المضيء',
    englishName: 'Neon Glow Pulse',
    category: 'waves',
    categoryName: 'تماوج وتوهج',
    description: 'إشعاع نيون عصري ينبض بوهج ساطع حول الحواف والظلال.',
    cssClass: 'effect-neon-pulse',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },

  // 3. حيوية وطفو مستمر
  {
    id: 'pulse',
    name: 'نبض حيوي هادئ',
    englishName: 'Smooth Heartbeat Pulse',
    category: 'ambient',
    categoryName: 'حيوية مستمرة',
    description: 'تمدد وتقلص إيقاعي لطيف يمنح العنصر حضوراً حيوياً ومستمراً.',
    cssClass: 'effect-pulse',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'float',
    name: 'طفو فضائي هادئ',
    englishName: 'Zero-G Float',
    category: 'ambient',
    categoryName: 'حيوية مستمرة',
    description: 'حركة طفو رأسية ناعمة توحي بانعدام الوزن والأناقة العصرية.',
    cssClass: 'effect-float',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'swing',
    name: 'تأرجح متمايل (بندول)',
    englishName: 'Pendulum Swing',
    category: 'ambient',
    categoryName: 'حيوية مستمرة',
    description: 'تأرجح هادئ كالبندول أو اللوحات المعلقة يميناً ويساراً.',
    cssClass: 'effect-swing',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'wobble',
    name: 'تمايل مرح مرن',
    englishName: 'Elastic Wobble',
    category: 'ambient',
    categoryName: 'حيوية مستمرة',
    description: 'حركة اهتزازية لولبية مرحة تضفي حيوية ومرحاً على الأزرار والشارات.',
    cssClass: 'effect-wobble',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'breathe',
    name: 'تنفس ناعم مستمر',
    englishName: 'Soft Breathe',
    category: 'ambient',
    categoryName: 'حيوية مستمرة',
    description: 'تدرج لطيف في الحجم والشفافية يوحي بالتنفس الطبيعي المتوازن.',
    cssClass: 'effect-breathe',
    defaultSpeed: 'slow',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'rotate-slow',
    name: 'دوران بطيء مستمر 360°',
    englishName: 'Slow Continuous Spin',
    category: 'ambient',
    categoryName: 'حيوية مستمرة',
    description: 'دوران دائري متواصل هادئ جداً ومثالي للرموز والشعارات والصور الدائرية.',
    cssClass: 'effect-rotate-slow',
    defaultSpeed: 'slow',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },

  // 4. حركات الظهور والدخول
  {
    id: 'slide-up',
    name: 'صعود تدريجي ناعم',
    englishName: 'Smooth Slide Up',
    category: 'entrance',
    categoryName: 'حركات الظهور',
    description: 'صعود رشيق من الأسفل للأعلى مع تلاشٍ وظهور متناسق.',
    cssClass: 'effect-slide-up',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'slide-right',
    name: 'انزلاق من اليمين',
    englishName: 'Slide In Right',
    category: 'entrance',
    categoryName: 'حركات الظهور',
    description: 'دخول انزلاقي سريع ومباشر من الجهة اليمنى.',
    cssClass: 'effect-slide-right',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'slide-left',
    name: 'انزلاق من اليسار',
    englishName: 'Slide In Left',
    category: 'entrance',
    categoryName: 'حركات الظهور',
    description: 'دخول انزلاقي رشيق من الجهة اليسرى للمحتوى.',
    cssClass: 'effect-slide-left',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'zoom-bounce',
    name: 'تكبير مع ارتداد مرن',
    englishName: 'Zoom Spring Bounce',
    category: 'entrance',
    categoryName: 'حركات الظهور',
    description: 'انبثاق وتكبير فوري مع ارتداد نوابضي مبهج يثبت في مكانه.',
    cssClass: 'effect-zoom-bounce',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'roll-in',
    name: 'تدحرج ودخول ديناميكي',
    englishName: 'Dynamic 3D Roll In',
    category: 'entrance',
    categoryName: 'حركات الظهور',
    description: 'تدحرج دوراني ثلاثي الأبعاد يدخل ببراعة ويستقر بمكانه بدقة.',
    cssClass: 'effect-roll-in',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },

  // 5. تفاعل ولفت الانتباه
  {
    id: 'flip-x',
    name: 'انقلاب أفقي ثلاثي الأبعاد',
    englishName: '3D Flip Horizontal',
    category: 'attention',
    categoryName: 'لفت الانتباه',
    description: 'انقلاب بطاقة ثلاثي الأبعاد عبر المحور الأفقي يظهر الوجه الآخر.',
    cssClass: 'effect-flip-x',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'flip-y',
    name: 'انقلاب رأسي ثلاثي الأبعاد',
    englishName: '3D Flip Vertical',
    category: 'attention',
    categoryName: 'لفت الانتباه',
    description: 'انقلاب بطاقة ثلاثي الأبعاد عبر المحور الرأسي بمظهر تكنولوجي باهر.',
    cssClass: 'effect-flip-y',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'rubber-band',
    name: 'شريط مطاطي تفاعلي',
    englishName: 'Rubber Band Stretch',
    category: 'attention',
    categoryName: 'لفت الانتباه',
    description: 'تمدد وانكماش مطاطي مرن وفوري يشد الانتباه مباشرة للنصوص والأزرار.',
    cssClass: 'effect-rubber-band',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'flash-burst',
    name: 'وميض خاطف لافت',
    englishName: 'Flash Pop Burst',
    category: 'attention',
    categoryName: 'لفت الانتباه',
    description: 'وميض خاطف متكرر رائع للعروض الحصرية والتنبيهات المستعجلة.',
    cssClass: 'effect-flash-burst',
    defaultSpeed: 'fast',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
  {
    id: 'shake',
    name: 'اهتزاز تنبيهي نشط',
    englishName: 'Alert Shake',
    category: 'attention',
    categoryName: 'لفت الانتباه',
    description: 'اهتزاز سريع ومتقطع ينبه المستخدم ويحفزه على التفاعل الفوري.',
    cssClass: 'effect-shake',
    defaultSpeed: 'normal',
    applicableTo: ['slide', 'text', 'button', 'image'],
  },
];

export const SPEED_DURATIONS: Record<string, Record<AnimationSpeed, string>> = {
  // Speed profiles for ticker streams
  stream: {
    slow: '20s',
    normal: '10s',
    fast: '5s',
  },
  // Speed profiles for color waves
  waves: {
    slow: '6s',
    normal: '3s',
    fast: '1.5s',
  },
  // Default speed profiles
  default: {
    slow: '3s',
    normal: '1.5s',
    fast: '0.8s',
  },
};

export function getEffectDuration(effectId: string, speed: AnimationSpeed = 'normal'): string {
  const effect = VISUAL_EFFECTS_LIST.find((e) => e.id === effectId);
  const category = effect?.category || 'default';
  if (category === 'stream') return SPEED_DURATIONS.stream[speed];
  if (category === 'waves') return SPEED_DURATIONS.waves[speed];
  return SPEED_DURATIONS.default[speed];
}

export function getAnimationCSSProperties(config?: ElementAnimationConfig): CSSProperties {
  if (!config || !config.type || config.type === 'none') {
    return {};
  }

  const duration = getEffectDuration(config.type, config.speed || 'normal');
  return {
    ['--anim-duration' as any]: duration,
  };
}

export function getAnimationClasses(config?: ElementAnimationConfig): string {
  if (!config || !config.type || config.type === 'none') {
    return '';
  }

  const effect = VISUAL_EFFECTS_LIST.find((e) => e.id === config.type);
  if (!effect) return '';

  const pauseClass = config.pauseOnHover ? 'hover:pause-animation' : '';
  return `${effect.cssClass} ${pauseClass}`.trim();
}
