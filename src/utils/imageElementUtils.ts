import React from 'react';
import {
  ImageEffectConfig,
  ImageEffectType,
  ImageLightingConfig,
  ImageLightingPosition,
  ImageShadowConfig,
  ImageShadowDirection,
} from '../types';

export const EFFECTS_LIST: Array<{
  id: ImageEffectType;
  label: string;
  desc: string;
  previewFilter: string;
}> = [
  { id: 'none', label: 'طبيعي', desc: 'بدون أي تأثير', previewFilter: 'none' },
  { id: 'grayscale', label: 'أبيض وأسود', desc: 'كلاسيكي رمادي', previewFilter: 'grayscale(100%)' },
  { id: 'sepia', label: 'سيبيا دافئ', desc: 'لمسة ذهبية دافئة', previewFilter: 'sepia(90%)' },
  { id: 'vintage', label: 'فينتيج ريترو', desc: 'تصوير كلاسيكي عتيق', previewFilter: 'sepia(50%) contrast(120%) brightness(95%)' },
  { id: 'contrast', label: 'تباين حاد', desc: 'ألوان عميقة وقوية', previewFilter: 'contrast(160%)' },
  { id: 'vibrant', label: 'ألوان فاقعة', desc: 'تشبع نضر وحيوي', previewFilter: 'saturate(200%) contrast(110%)' },
  { id: 'cool', label: 'أزرق سينمائي', desc: 'تدرج بارد وعصري', previewFilter: 'hue-rotate(30deg) saturate(120%)' },
  { id: 'dramatic', label: 'درامي داكن', desc: 'ظلال سينمائية عميقة', previewFilter: 'contrast(150%) brightness(85%)' },
  { id: 'neon', label: 'نيون مشع', desc: 'إشراق ألوان رقمية', previewFilter: 'saturate(220%) contrast(135%)' },
  { id: 'blur', label: 'ضبابي ناعم', desc: 'تغبيش رقيق جذاب', previewFilter: 'blur(3px)' },
  { id: 'invert', label: 'معكوس الألوان', desc: 'تأثير نيجاتيف فني', previewFilter: 'invert(100%)' },
];

export const LIGHTING_POSITIONS: Array<{
  id: ImageLightingPosition;
  label: string;
  iconName: string;
}> = [
  { id: 'center', label: 'من الوسط', iconName: 'Sun' },
  { id: 'right', label: 'جانبية يمين', iconName: 'ArrowRight' },
  { id: 'left', label: 'جانبية يسار', iconName: 'ArrowLeft' },
  { id: 'top-right', label: 'زاوية عليا يمين', iconName: 'ArrowUpRight' },
  { id: 'top-left', label: 'زاوية عليا يسار', iconName: 'ArrowUpLeft' },
  { id: 'top', label: 'من الأعلى', iconName: 'ArrowUp' },
  { id: 'bottom-right', label: 'زاوية سفلى يمين', iconName: 'ArrowDownRight' },
  { id: 'bottom-left', label: 'زاوية سفلى يسار', iconName: 'ArrowDownLeft' },
  { id: 'bottom', label: 'من الأسفل', iconName: 'ArrowDown' },
];

export const SHADOW_DIRECTIONS: Array<{
  id: ImageShadowDirection;
  label: string;
  iconName: string;
}> = [
  { id: 'bottom', label: 'أسفل', iconName: 'ArrowDown' },
  { id: 'bottom-right', label: 'أسفل يمين', iconName: 'ArrowDownRight' },
  { id: 'bottom-left', label: 'أسفل يسار', iconName: 'ArrowDownLeft' },
  { id: 'right', label: 'يمين', iconName: 'ArrowRight' },
  { id: 'center', label: 'محيطي من الوسط', iconName: 'Sun' },
  { id: 'left', label: 'يسار', iconName: 'ArrowLeft' },
  { id: 'top', label: 'أعلى', iconName: 'ArrowUp' },
  { id: 'top-right', label: 'أعلى يمين', iconName: 'ArrowUpRight' },
  { id: 'top-left', label: 'أعلى يسار', iconName: 'ArrowUpLeft' },
];

export const LIGHT_COLORS = [
  { id: 'white', label: 'أبيض ناصع', value: '#ffffff' },
  { id: 'gold', label: 'ذهبي دافئ', value: '#fbbf24' },
  { id: 'cyan', label: 'سماوي نيون', value: '#38bdf8' },
  { id: 'purple', label: 'بنفسجي متوهج', value: '#c084fc' },
  { id: 'rose', label: 'وردي لطيف', value: '#f43f5e' },
];

export const SHADOW_COLORS = [
  { id: 'dark', label: 'أسود داكن', value: 'rgba(0, 0, 0, VAR_OPACITY)' },
  { id: 'charcoal', label: 'رمادي عميق', value: 'rgba(30, 41, 59, VAR_OPACITY)' },
  { id: 'blue', label: 'أزرق ليلي', value: 'rgba(30, 58, 138, VAR_OPACITY)' },
  { id: 'amber', label: 'توهج عنبري', value: 'rgba(217, 119, 6, VAR_OPACITY)' },
  { id: 'cyan', label: 'توهج سماوي', value: 'rgba(6, 182, 212, VAR_OPACITY)' },
];

/**
 * Calculates CSS filter string based on effect configuration
 */
export function getImageFilterCSS(effect?: ImageEffectConfig): string {
  if (!effect || effect.type === 'none') return 'none';
  const intensity = effect.intensity !== undefined ? Math.max(0, Math.min(1, effect.intensity)) : 1;

  switch (effect.type) {
    case 'grayscale':
      return `grayscale(${Math.round(intensity * 100)}%)`;
    case 'sepia':
      return `sepia(${Math.round(intensity * 100)}%)`;
    case 'vintage':
      return `sepia(${Math.round(intensity * 60)}%) contrast(${100 + Math.round(intensity * 25)}%) brightness(${100 - Math.round(intensity * 10)}%)`;
    case 'contrast':
      return `contrast(${100 + Math.round(intensity * 75)}%)`;
    case 'vibrant':
      return `saturate(${100 + Math.round(intensity * 110)}%) contrast(${100 + Math.round(intensity * 15)}%)`;
    case 'cool':
      return `hue-rotate(${Math.round(intensity * 35)}deg) saturate(${100 + Math.round(intensity * 20)}%)`;
    case 'dramatic':
      return `contrast(${100 + Math.round(intensity * 65)}%) brightness(${100 - Math.round(intensity * 20)}%)`;
    case 'blur':
      return `blur(${Math.max(1, Math.round(intensity * 6))}px)`;
    case 'neon':
      return `saturate(${100 + Math.round(intensity * 130)}%) contrast(${100 + Math.round(intensity * 40)}%)`;
    case 'invert':
      return `invert(${Math.round(intensity * 100)}%)`;
    default:
      return 'none';
  }
}

/**
 * Calculates CSS box-shadow string based on shadow configuration
 */
export function getImageShadowCSS(shadow?: ImageShadowConfig, customColor?: string): string {
  if (!shadow || !shadow.enabled || shadow.direction === 'none') return 'none';

  const blur = shadow.blur !== undefined ? shadow.blur : 25;
  const spread = shadow.spread !== undefined ? shadow.spread : 0;
  const intensity = shadow.intensity !== undefined ? shadow.intensity : 0.6;

  let color = shadow.color || customColor || `rgba(0, 0, 0, ${intensity})`;
  if (color.includes('VAR_OPACITY')) {
    color = color.replace('VAR_OPACITY', String(intensity));
  } else if (color.startsWith('#')) {
    // Convert hex to rgba with intensity
    const r = parseInt(color.slice(1, 3), 16) || 0;
    const g = parseInt(color.slice(3, 5), 16) || 0;
    const b = parseInt(color.slice(5, 7), 16) || 0;
    color = `rgba(${r}, ${g}, ${b}, ${intensity})`;
  }

  switch (shadow.direction) {
    case 'bottom':
      return `0px ${Math.round(blur * 0.75)}px ${blur}px ${spread}px ${color}`;
    case 'bottom-right':
      return `${Math.round(blur * 0.55)}px ${Math.round(blur * 0.65)}px ${blur}px ${spread}px ${color}`;
    case 'bottom-left':
      return `-${Math.round(blur * 0.55)}px ${Math.round(blur * 0.65)}px ${blur}px ${spread}px ${color}`;
    case 'right':
      return `${Math.round(blur * 0.75)}px 0px ${blur}px ${spread}px ${color}`;
    case 'left':
      return `-${Math.round(blur * 0.75)}px 0px ${blur}px ${spread}px ${color}`;
    case 'top':
      return `0px -${Math.round(blur * 0.75)}px ${blur}px ${spread}px ${color}`;
    case 'top-right':
      return `${Math.round(blur * 0.55)}px -${Math.round(blur * 0.65)}px ${blur}px ${spread}px ${color}`;
    case 'top-left':
      return `-${Math.round(blur * 0.55)}px -${Math.round(blur * 0.65)}px ${blur}px ${spread}px ${color}`;
    case 'center':
      return `0px 0px ${blur}px ${spread + 2}px ${color}`;
    default:
      return `0px 15px 30px rgba(0, 0, 0, ${intensity})`;
  }
}

/**
 * Calculates CSS properties for the lighting overlay
 */
export function getImageLightingStyle(lighting?: ImageLightingConfig): React.CSSProperties | null {
  if (!lighting || !lighting.enabled || lighting.position === 'none') return null;

  const intensity = lighting.intensity !== undefined ? Math.max(0.05, Math.min(1, lighting.intensity)) : 0.7;
  const lightColor = lighting.color || '#ffffff';
  const spread = lighting.spread !== undefined ? lighting.spread : 60;

  let bg = '';
  switch (lighting.position) {
    case 'center':
      bg = `radial-gradient(circle at 50% 50%, ${lightColor} 0%, transparent ${spread}%)`;
      break;
    case 'top':
      bg = `linear-gradient(to bottom, ${lightColor} 0%, transparent ${spread}%)`;
      break;
    case 'bottom':
      bg = `linear-gradient(to top, ${lightColor} 0%, transparent ${spread}%)`;
      break;
    case 'right':
      bg = `linear-gradient(to left, ${lightColor} 0%, transparent ${spread}%)`;
      break;
    case 'left':
      bg = `linear-gradient(to right, ${lightColor} 0%, transparent ${spread}%)`;
      break;
    case 'top-right':
      bg = `radial-gradient(circle at 100% 0%, ${lightColor} 0%, transparent ${spread}%)`;
      break;
    case 'top-left':
      bg = `radial-gradient(circle at 0% 0%, ${lightColor} 0%, transparent ${spread}%)`;
      break;
    case 'bottom-right':
      bg = `radial-gradient(circle at 100% 100%, ${lightColor} 0%, transparent ${spread}%)`;
      break;
    case 'bottom-left':
      bg = `radial-gradient(circle at 0% 100%, ${lightColor} 0%, transparent ${spread}%)`;
      break;
    default:
      bg = `radial-gradient(circle at 50% 50%, ${lightColor} 0%, transparent ${spread}%)`;
  }

  return {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    backgroundImage: bg,
    opacity: intensity,
    mixBlendMode: 'screen',
    zIndex: 2,
    transition: 'opacity 0.2s ease, background-image 0.2s ease',
  };
}
