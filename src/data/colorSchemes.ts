import { PageColorScheme } from '../types';

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num) || clean.length !== 6) {
    return { r: 37, g: 99, b: 235 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function createCustomColorScheme(
  primary: string,
  accent: string,
  customName: string = 'ألوان مخصصة متناسقة'
): PageColorScheme {
  const pRgb = hexToRgb(primary);
  const aRgb = hexToRgb(accent);

  const bgR = Math.round(pRgb.r * 0.12);
  const bgG = Math.round(pRgb.g * 0.12);
  const bgB = Math.round(pRgb.b * 0.12);

  const deepR = Math.round(pRgb.r * 0.03);
  const deepG = Math.round(pRgb.g * 0.03);
  const deepB = Math.round(pRgb.b * 0.03);

  const cardR = Math.round(pRgb.r * 0.14 + aRgb.r * 0.04);
  const cardG = Math.round(pRgb.g * 0.14 + aRgb.g * 0.04);
  const cardB = Math.round(pRgb.b * 0.14 + aRgb.b * 0.04);

  const bgRadial = `radial-gradient(ellipse at top, rgb(${bgR + 15}, ${bgG + 15}, ${bgB + 25}) 0%, rgb(${deepR}, ${deepG}, ${deepB}) 100%)`;
  const navbarBg = `rgba(${cardR}, ${cardG}, ${cardB}, 0.95)`;
  const cardBg = `rgba(${cardR}, ${cardG}, ${cardB}, 0.85)`;
  const borderColor = `rgba(${aRgb.r}, ${aRgb.g}, ${aRgb.b}, 0.25)`;
  const borderHighlight = `rgba(${aRgb.r}, ${aRgb.g}, ${aRgb.b}, 0.6)`;

  return {
    id: `custom-${primary.replace('#', '')}-${accent.replace('#', '')}`,
    name: customName,
    primary,
    accent,
    gradient: `from-[${primary}] to-[${accent}]`,
    navbarBg,
    cardBg,
    borderColor,
    borderHighlight,
    textAccent: accent,
    bgRadial,
    previewColors: [primary, accent, `rgb(${bgR}, ${bgG}, ${bgB})`],
    isCustom: true,
  };
}

export const PRESET_COLOR_SCHEMES: PageColorScheme[] = [
  {
    id: 'navy-blue',
    name: 'تدرجات الأزرق الكحلي والبحري',
    primary: '#2563eb',
    accent: '#38bdf8',
    gradient: 'from-[#07132a] via-[#0d2044] to-[#050e20]',
    navbarBg: 'bg-[#081530]/90 border-blue-500/20',
    cardBg: 'rgba(11, 27, 61, 0.85)',
    bgRadial: 'radial-gradient(ellipse at top, #0b1c38 0%, #050b18 100%)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderHighlight: 'rgba(56, 189, 248, 0.6)',
    textAccent: '#38bdf8',
    previewColors: ['#1d4ed8', '#38bdf8', '#07132a'],
  },
  {
    id: 'purple-royal',
    name: 'تدرجات النهدي والبنفسجي',
    primary: '#8b5cf6',
    accent: '#c084fc',
    gradient: 'from-[#170a2c] via-[#28114b] to-[#0f051e]',
    navbarBg: 'bg-[#190a32]/90 border-purple-500/20',
    cardBg: 'rgba(35, 14, 70, 0.85)',
    bgRadial: 'radial-gradient(ellipse at top, #28114b 0%, #0d0519 100%)',
    borderColor: 'rgba(192, 132, 252, 0.25)',
    borderHighlight: 'rgba(192, 132, 252, 0.6)',
    textAccent: '#c084fc',
    previewColors: ['#7c3aed', '#c084fc', '#170a2c'],
  },
  {
    id: 'ruby-crimson',
    name: 'تدرجات الأحمر والعنابي',
    primary: '#e11d48',
    accent: '#fb7185',
    gradient: 'from-[#240610] via-[#3f081a] to-[#17030a]',
    navbarBg: 'bg-[#260712]/90 border-rose-500/20',
    cardBg: 'rgba(54, 9, 25, 0.85)',
    bgRadial: 'radial-gradient(ellipse at top, #3b0a1a 0%, #140309 100%)',
    borderColor: 'rgba(251, 113, 133, 0.25)',
    borderHighlight: 'rgba(251, 113, 133, 0.6)',
    textAccent: '#fb7185',
    previewColors: ['#e11d48', '#fb7185', '#240610'],
  },
  {
    id: 'emerald-green',
    name: 'تدرجات الأخضر والزمردي',
    primary: '#059669',
    accent: '#34d399',
    gradient: 'from-[#052319] via-[#093d2c] to-[#031711]',
    navbarBg: 'bg-[#06241b]/90 border-emerald-500/20',
    cardBg: 'rgba(10, 53, 39, 0.85)',
    bgRadial: 'radial-gradient(ellipse at top, #093d2c 0%, #03140e 100%)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
    borderHighlight: 'rgba(52, 211, 153, 0.6)',
    textAccent: '#34d399',
    previewColors: ['#059669', '#34d399', '#052319'],
  },
  {
    id: 'amber-gold',
    name: 'تدرجات الكهرماني والبرتقالي',
    primary: '#ea580c',
    accent: '#fbbf24',
    gradient: 'from-[#261005] via-[#3d1a08] to-[#180903]',
    navbarBg: 'bg-[#240f05]/90 border-orange-500/20',
    cardBg: 'rgba(53, 22, 8, 0.85)',
    bgRadial: 'radial-gradient(ellipse at top, #3d1a08 0%, #150802 100%)',
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderHighlight: 'rgba(251, 191, 36, 0.6)',
    textAccent: '#fbbf24',
    previewColors: ['#ea580c', '#fbbf24', '#261005'],
  },
  {
    id: 'slate-charcoal',
    name: 'تدرجات الفحمي والرمادي الراقي',
    primary: '#64748b',
    accent: '#cbd5e1',
    gradient: 'from-[#0b0f19] via-[#182234] to-[#070a12]',
    navbarBg: 'bg-[#0f172a]/90 border-slate-500/20',
    cardBg: 'rgba(24, 35, 56, 0.85)',
    bgRadial: 'radial-gradient(ellipse at top, #1e293b 0%, #090d14 100%)',
    borderColor: 'rgba(203, 213, 225, 0.25)',
    borderHighlight: 'rgba(203, 213, 225, 0.6)',
    textAccent: '#cbd5e1',
    previewColors: ['#475569', '#cbd5e1', '#0b0f19'],
  },
  {
    id: 'teal-ocean',
    name: 'تدرجات التيل والتركواز المائي',
    primary: '#0d9488',
    accent: '#2dd4bf',
    gradient: 'from-[#042021] via-[#09393a] to-[#021516]',
    navbarBg: 'bg-[#052223]/90 border-teal-500/20',
    cardBg: 'rgba(10, 49, 51, 0.85)',
    bgRadial: 'radial-gradient(ellipse at top, #09393a 0%, #021415 100%)',
    borderColor: 'rgba(45, 212, 191, 0.25)',
    borderHighlight: 'rgba(45, 212, 191, 0.6)',
    textAccent: '#2dd4bf',
    previewColors: ['#0d9488', '#2dd4bf', '#042021'],
  },
];

export const DEFAULT_COLOR_SCHEME = PRESET_COLOR_SCHEMES[0];
