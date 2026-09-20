import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
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
  Trash2,
  ChevronDown,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Grid,
  LayoutList,
  Lock,
  Link as LinkIcon,
  Link2Off,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Star,
  Check,
  ArrowRight,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Slide, UserRegistrationData, PageColorScheme, ModularElement, ModularElementType, TextFormattingStyle, SlideStyle, ImageElementData } from '../../types';
import { AVAILABLE_ELEMENT_OPTIONS, createDefaultModularElement } from '../../data/modularElementsData';
import { FreeformGridContainer } from './FreeformGridContainer';
import { useTextEdit } from '../../context/TextEditContext';
import { getImageFilterCSS, getImageShadowCSS, getImageLightingStyle } from '../../utils/imageElementUtils';
import { GalleryElementView } from './GalleryElementView';
import { getAnimationClasses, getAnimationCSSProperties } from '../../data/visualEffectsData';
import { AddElementFlyoutPanel } from './AddElementFlyoutPanel';

interface EmptySlideViewProps {
  slide: Slide;
  user: UserRegistrationData;
  colorScheme?: PageColorScheme;
  isEditReady?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (elementId: string) => void;
  onSelectSlide?: () => void;
  onAddElement?: (element: ModularElement) => void;
  onDeleteElement?: (elementId: string) => void;
  onUpdateElement?: (element: ModularElement) => void;
  onUpdateElements?: (elements: ModularElement[]) => void;
  onMoveElement?: (elementIndex: number, direction: 'up' | 'down') => void;
  onUpdateSlideStyle?: (styleUpdates: Partial<SlideStyle>) => void;
}

// Component for robust Arabic text editing that supports boxStyle, live formatting sync, and locking
interface ArabicEditableTextElementProps {
  element: ModularElement;
  isSelected: boolean;
  isEditReady: boolean;
  tag: 'h2' | 'h3' | 'p';
  className: string;
  style?: React.CSSProperties;
  onUpdateElement?: (updated: ModularElement) => void;
  onDeleteElement?: (elementId: string) => void;
}

const ArabicEditableTextElement: React.FC<ArabicEditableTextElementProps> = ({
  element,
  isSelected,
  isEditReady,
  tag: Tag,
  className,
  style,
  onUpdateElement,
  onDeleteElement,
}) => {
  const contentRef = useRef<HTMLElement>(null);
  const textValue = element.data?.text !== undefined ? element.data.text : 'مستند نصي';
  const isTypingRef = useRef(false);
  const { activeSession, updateCurrentText } = useTextEdit();

  const isCurrentlyActive = activeSession?.elementId === element.id;

  const defaultColor = Tag === 'h2' ? '#ffffff' : Tag === 'h3' ? '#f59e0b' : '#e5e7eb';
  const defaultSize = Tag === 'h2' ? '36px' : Tag === 'h3' ? '24px' : '16px';
  const defaultBold = Tag === 'h2' || Tag === 'h3';

  // Priority order for style merge:
  // When an activeSession exists for this element, its style takes immediate live priority
  const isSessionAnimSpecified = Boolean(isCurrentlyActive && activeSession?.currentStyle && ('animation' in activeSession.currentStyle));
  const activeSessionAnim = isSessionAnimSpecified ? activeSession?.currentStyle?.animation : undefined;
  const isSessionAnimNone = isSessionAnimSpecified && (!activeSessionAnim || activeSessionAnim.type === 'none');

  const effectiveFormatting: TextFormattingStyle = {
    ...(element.formattingStyle || {}),
    ...(element.data?.style || {}),
    ...(isCurrentlyActive && activeSession?.currentStyle ? activeSession.currentStyle : {}),
    boxStyle: {
      ...(element.formattingStyle?.boxStyle || {}),
      ...(element.data?.style?.boxStyle || {}),
      ...(isCurrentlyActive && activeSession?.currentStyle?.boxStyle ? activeSession.currentStyle.boxStyle : {}),
    },
  };
  if (isSessionAnimNone) {
    delete effectiveFormatting.animation;
  }

  const latestFormattingRef = useRef(effectiveFormatting);
  useEffect(() => {
    latestFormattingRef.current = effectiveFormatting;
  }, [effectiveFormatting]);

  const buildMergedStyle = () => {
    const res: any = {
      ...(element.formattingStyle || {}),
      ...(element.data?.style || {}),
      ...latestFormattingRef.current,
      boxStyle: {
        ...(element.formattingStyle?.boxStyle || {}),
        ...(element.data?.style?.boxStyle || {}),
        ...(latestFormattingRef.current?.boxStyle || {}),
      },
    };
    if (isSessionAnimNone || !latestFormattingRef.current?.animation || latestFormattingRef.current.animation.type === 'none') {
      delete res.animation;
    }
    return res;
  };

  // Explicit font size calculation: ensures live edits and toolbar clicks reflect immediately
  const activeFontSize =
    (isCurrentlyActive && activeSession?.currentStyle?.fontSize) ||
    element.formattingStyle?.fontSize ||
    element.data?.style?.fontSize ||
    style?.fontSize ||
    defaultSize;

  const boxStyle = effectiveFormatting.boxStyle;
  const hasBg =
    boxStyle?.hasBackground === true ||
    (boxStyle?.transparent === false && Boolean(boxStyle?.backgroundColor)) ||
    Boolean(boxStyle?.backgroundColor && boxStyle.backgroundColor !== 'transparent') ||
    Boolean(effectiveFormatting.backgroundColor && effectiveFormatting.backgroundColor !== 'transparent');

  const bgOpacity = boxStyle?.backgroundOpacity !== undefined ? boxStyle.backgroundOpacity : 1;
  let boxBg = 'transparent';
  if (hasBg) {
    const rawColor = boxStyle?.backgroundColor || effectiveFormatting.backgroundColor || '#ffffff';
    if (rawColor && rawColor !== 'transparent') {
      if (rawColor.startsWith('#') && rawColor.length === 7 && bgOpacity < 1) {
        const alphaHex = Math.round(bgOpacity * 255).toString(16).padStart(2, '0');
        boxBg = `${rawColor}${alphaHex}`;
      } else {
        boxBg = rawColor;
      }
    }
  }

  const hasBorder = boxStyle?.hasBorder !== undefined
    ? boxStyle.hasBorder
    : ((boxStyle?.borderWidth || 0) > 0 && boxStyle?.borderStyle !== 'none');
  const boxBorderWidth = hasBorder ? `${boxStyle?.borderWidth || 1}px` : undefined;
  const boxBorderStyle = hasBorder ? (boxStyle?.borderStyle || 'solid') : undefined;
  const boxBorderColor = hasBorder ? (boxStyle?.borderColor || '#3b82f6') : undefined;
  const boxBorderRadius = boxStyle?.borderRadius !== undefined ? `${boxStyle.borderRadius}px` : undefined;
  const boxPadding = typeof boxStyle?.padding === 'number'
    ? `${boxStyle.padding}px`
    : (boxStyle?.padding || '8px');
  const boxMinHeight = boxStyle?.minHeight || '36px';
  const boxMinWidth = boxStyle?.minWidth || '48px';
  const boxWidth = boxStyle?.autoFit ? 'fit-content' : (boxStyle?.width || '100%');
  const isListBullet = effectiveFormatting.listType === 'bullet';
  const isListNumbered = effectiveFormatting.listType === 'numbered';

  // Sync DOM with state only when not actively typing in it, or when element ID changes
  useEffect(() => {
    if (contentRef.current && !isTypingRef.current) {
      if (contentRef.current.innerText !== textValue) {
        contentRef.current.innerText = textValue;
      }
    }
  }, [textValue, element.id]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    isTypingRef.current = true;
    const currentVal = e.currentTarget.innerText;
    if (isCurrentlyActive) {
      updateCurrentText(currentVal);
    }
    if (onUpdateElement) {
      const merged = buildMergedStyle();
      const updatedElem: any = {
        ...element,
        data: {
          ...element.data,
          text: currentVal, // Allows empty string cleanly so Backspace works
          style: merged,
        },
        formattingStyle: merged,
      };
      if (isSessionAnimNone || !merged.animation || merged.animation.type === 'none') {
        delete updatedElem.animation;
        if (updatedElem.data?.style) delete updatedElem.data.style.animation;
        if (updatedElem.formattingStyle) delete updatedElem.formattingStyle.animation;
      } else {
        updatedElem.animation = merged.animation;
      }
      onUpdateElement(updatedElem);
    }
  };

  const handleBlur = () => {
    isTypingRef.current = false;
    const currentText = contentRef.current?.innerText || '';
    const trimmed = currentText.trim();
    // النقر خارجاً بدون حروف في الصندوق يحذف العنصر نهائياً
    if (trimmed.length === 0) {
      if (onDeleteElement) {
        onDeleteElement(element.id);
      }
      return;
    }

    // النقر خارجاً يحفظ العنصر في آخر حالة مع الصندوق إن كان هناك نص بالداخل
    if (contentRef.current && onUpdateElement) {
      const merged = buildMergedStyle();
      const updatedElem: any = {
        ...element,
        data: {
          ...element.data,
          text: currentText,
          style: merged,
        },
        formattingStyle: merged,
      };
      if (isSessionAnimNone || !merged.animation || merged.animation.type === 'none') {
        delete updatedElem.animation;
        if (updatedElem.data?.style) delete updatedElem.data.style.animation;
        if (updatedElem.formattingStyle) delete updatedElem.formattingStyle.animation;
      } else {
        updatedElem.animation = merged.animation;
      }
      onUpdateElement(updatedElem);
    }
  };

  const rawAnim = isSessionAnimNone
    ? undefined
    : (isCurrentlyActive && activeSession?.currentStyle && ('animation' in activeSession.currentStyle))
    ? (activeSession.currentStyle.animation && activeSession.currentStyle.animation.type !== 'none' ? activeSession.currentStyle.animation : undefined)
    : (effectiveFormatting.animation && effectiveFormatting.animation.type !== 'none')
    ? effectiveFormatting.animation
    : (element.animation && element.animation.type !== 'none')
    ? element.animation
    : undefined;

  const textAnim = rawAnim;
  const isFlow = textAnim?.type === 'flow-left' || textAnim?.type === 'flow-right';
  const animClasses = getAnimationClasses(textAnim);
  const animStyles = getAnimationCSSProperties(textAnim);

  return (
    <div
      className={`relative transition-all duration-150 w-full flex items-center ${isFlow ? 'overflow-hidden' : ''}`}
      style={{
        backgroundColor: boxBg,
        borderWidth: boxBorderWidth,
        borderStyle: boxBorderStyle,
        borderColor: boxBorderColor,
        borderRadius: boxBorderRadius || (hasBg ? '8px' : undefined),
        padding: hasBg && !boxStyle?.padding ? '6px 12px' : boxPadding,
        minHeight: boxMinHeight,
        minWidth: boxMinWidth,
        width: boxWidth,
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Tag
        ref={contentRef as any}
        id={`editable-text-${element.id}`}
        contentEditable={isEditReady && isSelected && !element.isLocked}
        suppressContentEditableWarning
        dir="rtl"
        lang="ar"
        spellCheck={false}
        onInput={handleInput}
        onBlur={handleBlur}
        data-placeholder=""
        className={`${className} ${animClasses} outline-none ${isFlow ? 'w-auto' : 'w-full'} ${
          element.isLocked ? 'cursor-not-allowed select-none' : 'cursor-text select-text'
        }`}
        style={{
          ...style,
          ...animStyles,
          color: effectiveFormatting.textGradient ? 'transparent' : (effectiveFormatting.color || defaultColor),
          fontFamily: effectiveFormatting.fontFamily || "'Cairo', sans-serif",
          fontSize: activeFontSize,
          fontWeight:
            effectiveFormatting.bold !== undefined
              ? effectiveFormatting.bold ? 'bold' : 'normal'
              : defaultBold ? 'bold' : 'normal',
          fontStyle: effectiveFormatting.italic ? 'italic' : undefined,
          textDecoration: effectiveFormatting.underline ? 'underline' : undefined,
          textAlign: effectiveFormatting.align || 'right',
          direction: 'rtl',
          unicodeBidi: 'plaintext',
          whiteSpace: isFlow ? 'nowrap' : 'pre-wrap',
          wordBreak: isFlow ? 'keep-all' : 'normal',
          overflowWrap: isFlow ? 'normal' : 'break-word',
          boxSizing: 'border-box',
          lineHeight: '1.4',
          minWidth: isFlow ? 'max-content' : '24px',
          minHeight: '1.2em',
          display: isFlow ? 'inline-block' : isListBullet || isListNumbered ? 'list-item' : 'block',
          listStyleType: isListBullet ? 'disc' : isListNumbered ? 'decimal' : undefined,
          listStylePosition: 'inside',
          width: isFlow ? 'max-content' : '100%',
          opacity: effectiveFormatting.opacity !== undefined ? effectiveFormatting.opacity : 1,
          textShadow: effectiveFormatting.textShadow || undefined,
          backgroundImage: effectiveFormatting.textGradient || undefined,
          WebkitBackgroundClip: effectiveFormatting.textGradient ? 'text' : undefined,
          WebkitTextFillColor: effectiveFormatting.textGradient ? 'transparent' : undefined,
          backgroundClip: effectiveFormatting.textGradient ? 'text' : undefined,
          WebkitTextStroke: effectiveFormatting.WebkitTextStroke || undefined,
        }}
      />

      {/* الرابط المرفق بالنص */}
      {effectiveFormatting.link?.value && (
        <div className="absolute -bottom-2.5 left-2 pointer-events-none z-10">
          <span className="text-[10px] bg-blue-600/90 text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
            🔗 {effectiveFormatting.link.value}
          </span>
        </div>
      )}

      {/* شارة القفل إذا كان العنصر مقفلاً */}
      {element.isLocked && isSelected && (
        <div className="absolute -top-3.5 right-2 bg-amber-500 text-black font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 pointer-events-none z-20">
          <Lock className="w-2.5 h-2.5" />
          <span>مقفل</span>
        </div>
      )}
    </div>
  );
};

export const EmptySlideView: React.FC<EmptySlideViewProps> = ({
  slide,
  user,
  colorScheme,
  isEditReady = false,
  selectedElementId,
  onSelectElement,
  onSelectSlide,
  onAddElement,
  onDeleteElement,
  onUpdateElement,
  onUpdateElements,
  onMoveElement,
  onUpdateSlideStyle,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const primaryColor = colorScheme?.primary || '#2563eb';
  const accentColor = colorScheme?.accent || '#f59e0b';
  const cardBg = colorScheme?.cardBg || 'rgba(15, 28, 58, 0.85)';
  const borderColor = colorScheme?.borderColor || 'rgba(255, 255, 255, 0.12)';
  const textAccent = colorScheme?.textAccent || accentColor;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle adding an element from the dropdown
  const handleSelectElementFromDropdown = (type: ModularElementType) => {
    setIsDropdownOpen(false);
    if (!onAddElement) return;
    const newElement = createDefaultModularElement(type, user, colorScheme);
    onAddElement(newElement);
  };

  const elements = slide.elements || [];
  const [layoutMode, setLayoutMode] = useState<'freeform' | 'flow'>('freeform');

  // Render individual element content
  const renderElementContent = (el: ModularElement, isSelected: boolean) => {
    switch (el.type) {
      case 'text_heading_large':
        return (
          <ArabicEditableTextElement
            element={el}
            isSelected={isSelected}
            isEditReady={isEditReady}
            tag="h2"
            className="font-black leading-tight outline-none cursor-text select-text transition-colors"
            style={{
              color: el.formattingStyle?.color || el.data?.style?.color || '#ffffff',
              fontFamily: el.formattingStyle?.fontFamily || el.data?.style?.fontFamily || "'Cairo', sans-serif",
              fontSize: el.formattingStyle?.fontSize || el.data?.style?.fontSize || '36px',
              fontWeight: el.formattingStyle?.bold !== undefined ? (el.formattingStyle.bold ? 'bold' : 'normal') : (el.data?.style?.bold !== false ? 'bold' : 'normal'),
              fontStyle: el.formattingStyle?.italic ? 'italic' : (el.data?.style?.italic ? 'italic' : undefined),
              textDecoration: el.formattingStyle?.underline ? 'underline' : (el.data?.style?.underline ? 'underline' : undefined),
              textAlign: el.formattingStyle?.align || el.data?.style?.align || 'right',
              whiteSpace: 'pre-wrap',
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              boxSizing: 'border-box',
            }}
            onUpdateElement={onUpdateElement}
            onDeleteElement={onDeleteElement}
          />
        );

      case 'text_heading_medium':
        return (
          <ArabicEditableTextElement
            element={el}
            isSelected={isSelected}
            isEditReady={isEditReady}
            tag="h3"
            className="font-bold outline-none cursor-text select-text transition-colors"
            style={{
              color: el.formattingStyle?.color || el.data?.style?.color || textAccent,
              fontFamily: el.formattingStyle?.fontFamily || el.data?.style?.fontFamily || "'Cairo', sans-serif",
              fontSize: el.formattingStyle?.fontSize || el.data?.style?.fontSize || '24px',
              fontWeight: el.formattingStyle?.bold !== undefined ? (el.formattingStyle.bold ? 'bold' : 'normal') : (el.data?.style?.bold !== false ? 'bold' : 'normal'),
              fontStyle: el.formattingStyle?.italic ? 'italic' : (el.data?.style?.italic ? 'italic' : undefined),
              textDecoration: el.formattingStyle?.underline ? 'underline' : (el.data?.style?.underline ? 'underline' : undefined),
              textAlign: el.formattingStyle?.align || el.data?.style?.align || 'right',
              whiteSpace: 'pre-wrap',
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              boxSizing: 'border-box',
            }}
            onUpdateElement={onUpdateElement}
            onDeleteElement={onDeleteElement}
          />
        );

      case 'text_body':
      case 'text_body_2000':
        return (
          <ArabicEditableTextElement
            element={el}
            isSelected={isSelected}
            isEditReady={isEditReady}
            tag="p"
            className="leading-relaxed text-gray-200 outline-none cursor-text select-text transition-colors"
            style={{
              color: el.formattingStyle?.color || el.data?.style?.color || '#e5e7eb',
              fontFamily: el.formattingStyle?.fontFamily || el.data?.style?.fontFamily || "'Cairo', sans-serif",
              fontSize: el.formattingStyle?.fontSize || el.data?.style?.fontSize || '16px',
              fontWeight: el.formattingStyle?.bold !== undefined ? (el.formattingStyle.bold ? 'bold' : 'normal') : (el.data?.style?.bold ? 'bold' : 'normal'),
              fontStyle: el.formattingStyle?.italic ? 'italic' : (el.data?.style?.italic ? 'italic' : undefined),
              textDecoration: el.formattingStyle?.underline ? 'underline' : (el.data?.style?.underline ? 'underline' : undefined),
              textAlign: el.formattingStyle?.align || el.data?.style?.align || 'right',
              whiteSpace: 'pre-wrap',
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              boxSizing: 'border-box',
            }}
            onUpdateElement={onUpdateElement}
            onDeleteElement={onDeleteElement}
          />
        );

      case 'image': {
        const imgData = (el.data || {}) as ImageElementData;
        const hasCustomImage = Boolean(imgData.imageUrl) && !imgData.isColorPlaceholder;
        const opacity = imgData.opacity !== undefined ? imgData.opacity : 1;
        const filterCSS = getImageFilterCSS(imgData.effect);
        const shadowCSS = getImageShadowCSS(imgData.shadow, primaryColor);
        const lightingOverlayStyle = getImageLightingStyle(imgData.lighting);
        const objectFit = imgData.objectFit || 'cover';

        const handleImageClick = (e: React.MouseEvent) => {
          if (!isEditReady && imgData.link?.value) {
            e.stopPropagation();
            const { type, value, openInNewTab } = imgData.link;
            if (type === 'internal') {
              const targetPageId = value.replace('page:', '');
              window.dispatchEvent(
                new CustomEvent('workshop-navigate-page', { detail: { pageId: targetPageId } })
              );
            } else if (type === 'url') {
              window.open(value, openInNewTab ? '_blank' : '_self');
            } else if (type === 'whatsapp') {
              const cleanNumber = value.replace(/[^0-9]/g, '');
              window.open(`https://wa.me/${cleanNumber}`, '_blank');
            } else if (type === 'phone') {
              window.location.href = `tel:${value}`;
            } else if (type === 'email') {
              window.location.href = `mailto:${value}`;
            }
          }
        };

        const imgAnim = (el.animation && el.animation.type !== 'none') ? el.animation : undefined;
        const imgAnimClasses = getAnimationClasses(imgAnim);
        const imgAnimStyles = getAnimationCSSProperties(imgAnim);

        const hasBorder = (imgData.borderWidth || 0) > 0 && imgData.borderStyle !== 'none';
        const imgBorderRadius = imgData.borderRadius !== undefined ? `${imgData.borderRadius}px` : undefined;

        return (
          <div
            onClick={handleImageClick}
            className={`w-full h-full min-h-[140px] rounded-2xl relative overflow-hidden flex items-center justify-center transition-all group ${imgAnimClasses}`}
            style={{
              opacity: opacity,
              filter: filterCSS !== 'none' ? filterCSS : undefined,
              boxShadow: shadowCSS !== 'none' ? shadowCSS : undefined,
              cursor: !isEditReady && imgData.link?.value ? 'pointer' : 'default',
              border: hasBorder
                ? `${imgData.borderWidth || 1}px ${imgData.borderStyle || 'solid'} ${imgData.borderColor || '#3b82f6'}`
                : undefined,
              borderRadius: imgBorderRadius,
              ...imgAnimStyles,
            }}
          >
            {hasCustomImage ? (
              <img
                src={imgData.imageUrl}
                alt={imgData.alt || 'صورة'}
                className="w-full h-full select-none pointer-events-none transition-transform duration-300 rounded-2xl"
                style={{ objectFit: objectFit, borderRadius: imgBorderRadius }}
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full min-h-[160px] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 border shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}dd 0%, ${accentColor}cc 50%, #0d1b38 100%)`,
                  borderColor: borderColor,
                }}
              >
                <div
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-60 blur-xl"
                  style={{ backgroundColor: accentColor }}
                />
                <div
                  className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-60 blur-xl"
                  style={{ backgroundColor: primaryColor }}
                />
                <div className="relative z-10 text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-white shadow-lg">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white/90 drop-shadow">
                    صورة افتراضية (ألوان الهوية)
                  </span>
                  <span className="text-[10px] text-white/70 block">
                    انقر في شريط الأدوات لتغيير الصورة أو المعرض
                  </span>
                </div>
              </div>
            )}

            {/* Lighting Overlay */}
            {lightingOverlayStyle && <div style={lightingOverlayStyle} />}

            {/* Link Indicator Badge */}
            {imgData.link?.value && (
              <div
                className="absolute top-2 left-2 z-10 p-1 rounded-md bg-black/60 text-cyan-400 backdrop-blur-md border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity"
                title={`مرتبط برابط: ${imgData.link.value}`}
              >
                <LinkIcon className="w-3 h-3" />
              </div>
            )}
          </div>
        );
      }

      case 'button': {
        const btnData = el.data || {};
        const btnStyle = btnData.style || {};
        const bgColor = btnStyle.backgroundColor || primaryColor;
        const textColor = btnStyle.color || '#ffffff';
        const borderStyle = btnStyle.borderStyle || 'solid';
        const borderWidth = typeof btnStyle.borderWidth === 'number' ? `${btnStyle.borderWidth}px` : (btnStyle.borderWidth || '1px');
        const borderColor = btnStyle.borderColor || `${accentColor}80`;
        const borderRadius = typeof btnStyle.borderRadius === 'number' ? `${btnStyle.borderRadius}px` : (btnStyle.borderRadius || '12px');
        const fontSize = btnStyle.fontSize || '14px';
        const opacity = btnStyle.opacity !== undefined ? btnStyle.opacity : (btnData.opacity !== undefined ? btnData.opacity : 1);
        
        const shadowCSS = getImageShadowCSS(btnData.shadow, primaryColor);
        const lightingOverlayStyle = getImageLightingStyle(btnData.lighting);

        const rawElWidth = el.width ?? el.position?.width;
        const numericElWidth = typeof rawElWidth === 'number'
          ? rawElWidth
          : typeof rawElWidth === 'string' && !isNaN(parseFloat(rawElWidth))
          ? parseFloat(rawElWidth)
          : null;

        const rawElHeight = el.height ?? el.position?.height;
        const numericElHeight = typeof rawElHeight === 'number'
          ? rawElHeight
          : typeof rawElHeight === 'string' && !isNaN(parseFloat(rawElHeight))
          ? parseFloat(rawElHeight)
          : null;

        const handleButtonClick = (e: React.MouseEvent) => {
          if (!isEditReady && btnData.link?.value) {
            e.stopPropagation();
            const { type, value, openInNewTab } = btnData.link;
            if (type === 'internal') {
              const targetPageId = value.replace('page:', '');
              window.dispatchEvent(
                new CustomEvent('workshop-navigate-page', { detail: { pageId: targetPageId } })
              );
            } else if (type === 'url') {
              window.open(value, openInNewTab ? '_blank' : '_self');
            } else if (type === 'whatsapp') {
              const cleanNumber = value.replace(/[^0-9]/g, '');
              window.open(`https://wa.me/${cleanNumber}`, '_blank');
            } else if (type === 'phone') {
              window.location.href = `tel:${value}`;
            } else if (type === 'email') {
              window.location.href = `mailto:${value}`;
            }
          }
        };

        const btnAnim = (el.animation && el.animation.type !== 'none') ? el.animation : undefined;
        const btnAnimClasses = getAnimationClasses(btnAnim);
        const btnAnimStyles = getAnimationCSSProperties(btnAnim);

        return (
          <div
            id={`button-element-wrapper-${el.id}`}
            onClick={handleButtonClick}
            className={`w-full h-full relative group flex items-center justify-center ${btnAnimClasses}`}
            style={{
              width: numericElWidth ? `${numericElWidth}px` : '100%',
              height: numericElHeight ? `${numericElHeight}px` : '100%',
              minWidth: numericElWidth ? `${numericElWidth}px` : '60px',
              minHeight: numericElHeight ? `${numericElHeight}px` : '40px',
              opacity: opacity,
              boxShadow: shadowCSS !== 'none' ? shadowCSS : undefined,
              cursor: !isEditReady && btnData.link?.value ? 'pointer' : 'default',
              borderRadius: borderRadius,
              ...btnAnimStyles,
            }}
          >
            <button
              id={`button-element-${el.id}`}
              type="button"
              className="w-full h-full font-bold transition-all flex items-center justify-center gap-2 select-none pointer-events-none px-4 py-2"
              style={{
                width: '100%',
                height: '100%',
                minWidth: '100%',
                minHeight: '100%',
                backgroundColor: bgColor,
                color: textColor,
                borderStyle: borderStyle === 'none' ? 'none' : borderStyle,
                borderWidth: borderStyle === 'none' ? '0px' : borderWidth,
                borderColor: borderColor,
                borderRadius: borderRadius,
                fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
              }}
            >
              {btnData.icon && (() => {
                const IconComponent = (LucideIcons as any)[btnData.icon];
                return IconComponent ? <IconComponent className="w-5 h-5 shrink-0" /> : null;
              })()}
              {btnData.label !== '' && <span>{btnData.label || 'زر'}</span>}
            </button>

            {/* Lighting Overlay */}
            {lightingOverlayStyle && (
              <div
                style={{
                  ...lightingOverlayStyle,
                  borderRadius: borderRadius,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Link Indicator Badge */}
            {btnData.link?.value && (
              <div
                className="absolute -top-1 -left-1 z-10 p-1 rounded-md bg-black/60 text-cyan-400 backdrop-blur-md border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity"
                title={`مرتبط برابط: ${btnData.link.value}`}
              >
                <LinkIcon className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
        );
      }

      case 'card':
        return (
          <div
            className="w-full h-full rounded-2xl p-5 border shadow-xl space-y-4"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
            }}
          >
            <div
              className="w-full h-28 rounded-xl mb-4 relative overflow-hidden border"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                borderColor: borderColor,
              }}
            />
            <h4 className="text-lg font-bold text-white mb-2">
              {el.data?.text || 'مستند نصي'}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              مستند نصي مخصص للبطاقة يوضح التفاصيل المهنية المتناسقة مع هوية الموقع.
            </p>
            <button
              type="button"
              className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow pointer-events-none"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              {el.data?.buttonLabel || 'زر'}
            </button>
          </div>
        );

      case 'gallery_5':
        return (
          <GalleryElementView
            el={el}
            primaryColor={primaryColor}
            accentColor={accentColor}
            isSelected={isSelected}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
            onUpdateElement={onUpdateElement}
          />
        );

      case 'video':
        return (
          <div
            className="w-full max-w-2xl h-52 sm:h-64 rounded-3xl border flex flex-col items-center justify-center p-6 text-center shadow-xl relative overflow-hidden"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl mb-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Video className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-white">مشغل فيديو</span>
            <span className="text-xs text-gray-400 mt-1">
              فيديو تفاعلي متناسق مع هوية وألوان الصفحة
            </span>
          </div>
        );

      case 'contact_form':
        return (
          <div
            className="w-full max-w-xl p-5 rounded-3xl border space-y-3 shadow-xl"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
            }}
          >
            <span className="text-sm font-bold text-white block">
              استمارة تواصل سريعة
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
                الاسم الكامل
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
                رقم الهاتف
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 h-16">
              نص الرسالة...
            </div>
            <button
              type="button"
              className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow"
              style={{ backgroundColor: primaryColor }}
            >
              {el.data?.buttonLabel || 'زر'}
            </button>
          </div>
        );

      case 'google_map':
        return (
          <div
            className="w-full max-w-2xl h-44 sm:h-52 rounded-3xl border flex items-center justify-center text-center p-6 shadow-xl"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
            }}
          >
            <div className="space-y-1">
              <MapPin
                className="w-8 h-8 mx-auto"
                style={{ color: textAccent }}
              />
              <span className="text-sm font-bold text-white block">
                خريطة الموقع الجغرافي
              </span>
              <span className="text-xs text-gray-400">
                {user.city || user.governorate || 'الموقع الافتراضي'}
              </span>
            </div>
          </div>
        );

      case 'geometric_shape': {
        const shapeType = el.data?.shapeType;
        if (shapeType === 'star') {
          return (
            <div
              className="w-16 h-16 rounded-2xl shadow-lg border flex items-center justify-center"
              style={{
                backgroundColor: cardBg,
                borderColor: accentColor,
              }}
            >
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
            </div>
          );
        }
        if (shapeType === 'arrow') {
          return (
            <div
              className="w-16 h-16 rounded-2xl shadow-lg border flex items-center justify-center text-white"
              style={{
                backgroundColor: primaryColor,
                borderColor: borderColor,
              }}
            >
              <ArrowRight className="w-8 h-8" />
            </div>
          );
        }
        if (shapeType === 'circle') {
          return (
            <div
              className="w-16 h-16 rounded-full shadow-lg border"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                borderColor: borderColor,
              }}
            />
          );
        }
        if (shapeType === 'capsule') {
          return (
            <div
              className="w-32 h-12 rounded-full shadow-lg border flex items-center justify-center text-white text-xs font-bold"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                borderColor: borderColor,
              }}
            >
              <Sparkles className="w-4 h-4 ml-1.5" />
              <span>شارة هندسية</span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-4 py-2">
            <div
              className="w-14 h-14 rounded-2xl shadow-lg border flex items-center justify-center text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                borderColor: borderColor,
              }}
            >
              <Shapes className="w-6 h-6" />
            </div>
            <div
              className="w-14 h-14 rounded-full shadow-lg border flex items-center justify-center text-white"
              style={{
                backgroundColor: primaryColor,
                borderColor: accentColor,
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        );
      }

      case 'booking_calendar':
        return (
          <div
            className="w-full max-w-md p-5 rounded-3xl border space-y-3 shadow-xl"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  {el.data?.title || 'حجز موعد واستشارة'}
                </span>
                <span className="text-[11px] text-gray-400">
                  {el.data?.description || 'اختر الوقت المناسب لتأكيد موعدك'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {(el.data?.slots || ['10:00 ص', '12:00 م', '03:30 م', '05:00 م']).map((slot: string, sIdx: number) => (
                <div
                  key={sIdx}
                  className="p-2 rounded-xl text-xs font-semibold text-center border transition-colors cursor-pointer bg-white/5 border-white/10 text-gray-300 hover:border-blue-400 hover:text-white"
                >
                  {slot}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-transform active:scale-98"
              style={{ backgroundColor: primaryColor }}
            >
              {el.data?.buttonLabel || 'تأكيد حجز الموعد'}
            </button>
          </div>
        );

      case 'pricing_table':
        return (
          <div
            className="w-full max-w-sm p-6 rounded-3xl border space-y-4 shadow-xl text-center"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
            }}
          >
            <div>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full border text-white inline-block mb-2"
                style={{ borderColor: accentColor, backgroundColor: `${accentColor}20` }}
              >
                {el.data?.planName || 'الباقة المميزة'}
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-black text-white">{el.data?.price || '99'}$</span>
                <span className="text-xs text-gray-400">/ {el.data?.period || 'شهرياً'}</span>
              </div>
            </div>
            <div className="space-y-2 text-right pt-2 border-t border-white/10">
              {(el.data?.features || ['دعم فني متواصل 24/7', 'تخصيص كامل للتصميم', 'إحصائيات متقدمة']).map((feat: string, fIdx: number) => (
                <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-transform active:scale-98"
              style={{ backgroundColor: primaryColor }}
            >
              {el.data?.buttonLabel || 'اشترك الآن'}
            </button>
          </div>
        );

      case 'navigation_menu':
        return (
          <div
            className="w-full max-w-2xl px-5 py-3 rounded-2xl border flex items-center justify-between shadow-lg"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
            }}
          >
            <div className="flex items-center gap-4">
              {(el.data?.links || ['الرئيسية', 'من نحن', 'خدماتنا', 'أعمالنا', 'تواصل معنا']).map((link: string, lIdx: number) => (
                <span
                  key={lIdx}
                  className="text-xs font-bold text-gray-300 hover:text-white cursor-pointer transition-colors"
                >
                  {link}
                </span>
              ))}
            </div>
            <div
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              حسابي
            </div>
          </div>
        );

      case 'divider_line':
        return (
          <div
            className="w-full my-4 h-px"
            style={{
              background: `linear-gradient(to left, transparent, ${borderColor}, transparent)`,
            }}
          />
        );

      case 'social_icons':
        return (
          <div className="flex items-center gap-3 py-2">
            {['واتساب', 'اتصال', 'فيسبوك', 'انستغرام'].map((platform, pIdx) => (
              <div
                key={pIdx}
                className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold text-white shadow"
                style={{
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                }}
              >
                {platform}
              </div>
            ))}
          </div>
        );

      case 'html_code':
        return (
          <div
            className="w-full max-w-xl p-3 rounded-2xl border font-mono text-xs text-gray-300"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
            }}
          >
            <span className="text-[10px] text-gray-500 block mb-1">
              حاوية HTML مخصصة
            </span>
            <div
              dangerouslySetInnerHTML={{
                __html:
                  el.data?.htmlCode ||
                  '<div style="text-align: center;">مستند نصي مخصص</div>',
              }}
            />
          </div>
        );

      default:
        return (
          <div className="p-3 rounded-xl border bg-white/5 text-xs text-gray-300">
            {el.data?.text || 'مستند نصي'}
          </div>
        );
    }
  };

  const slideStyle = slide.style || {};
  const slideBgColor = slideStyle.transparent ? 'transparent' : slideStyle.backgroundColor || 'transparent';
  
  let slideBgImage = undefined;
  if (!slideStyle.backgroundImage && slideStyle.gradientColorStart) {
    const start = slideStyle.gradientColorStart;
    const middle = slideStyle.gradientColorMiddle || start;
    const end = slideStyle.gradientColorEnd || start;
    slideBgImage = `linear-gradient(135deg, ${start} 0%, ${middle} 50%, ${end} 100%)`;
  } else if (!slideStyle.backgroundImage && !slideStyle.transparent && !slideStyle.backgroundColor && slideStyle.colorScheme) {
    slideBgImage = slideStyle.colorScheme.bgRadial || `radial-gradient(ellipse at top, ${slideStyle.colorScheme.previewColors?.[2] || '#0b1c38'} 0%, #050b18 100%)`;
  }

  const slideColorScheme = slideStyle.colorScheme || colorScheme;
  const isSlideCustomScheme = Boolean(slideStyle.colorScheme);

  const slideAnim = (slideStyle.animation && slideStyle.animation.type !== 'none') ? slideStyle.animation : undefined;
  const slideAnimClasses = getAnimationClasses(slideAnim);
  const slideAnimStyles = getAnimationCSSProperties(slideAnim);

  const getSlideShadow = (shadow?: string) => {
    if (!shadow || shadow === 'none') return undefined;
    switch (shadow) {
      case 'soft': return '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
      case 'medium': return '0 20px 40px -10px rgba(0, 0, 0, 0.35)';
      case 'deep': return '0 30px 60px -15px rgba(0, 0, 0, 0.5)';
      case 'glow': return '0 0 50px rgba(59, 130, 246, 0.35)';
      case 'inner': return 'inset 0 4px 20px rgba(0, 0, 0, 0.4)';
      default: return '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
    }
  };

  return (
    <section
      id={`slide-empty-${slide.id}`}
      dir="rtl"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        const isElement = Boolean(
          target.closest('[id^="freeform-element-wrapper-"]') ||
          target.closest('[data-element-content]') ||
          target.closest('[data-text-edit-topbar]') ||
          target.closest('.text-edit-popover')
        );
        if (!isElement) {
          onSelectSlide?.();
        }
      }}
      className={`relative w-full overflow-hidden min-h-[560px] sm:min-h-[620px] md:min-h-[700px] py-8 sm:py-12 px-3 sm:px-6 flex flex-col justify-start transition-all ${slideAnimClasses}`}
      style={{
        backgroundColor: slideBgColor,
        backgroundImage: slideBgImage,
        minHeight: slideStyle.height ? `${slideStyle.height}px` : undefined,
        borderWidth: slideStyle.borderWidth !== undefined ? `${slideStyle.borderWidth}px` : undefined,
        borderColor: slideStyle.borderColor || undefined,
        borderStyle: slideStyle.borderStyle || (slideStyle.borderWidth ? 'solid' : undefined),
        borderRadius: slideStyle.customBorderRadius || (slideStyle.borderRadius !== undefined ? `${slideStyle.borderRadius}px` : undefined),
        boxShadow: getSlideShadow(slideStyle.shadow),
        clipPath: slideStyle.backgroundAttachment === 'fixed' ? 'inset(0px)' : undefined,
        ...slideAnimStyles,
        ...(isSlideCustomScheme && slideColorScheme
          ? {
              ['--theme-primary' as string]: slideColorScheme.primary,
              ['--theme-accent' as string]: slideColorScheme.accent,
              ['--theme-bg-radial' as string]: slideColorScheme.bgRadial || `radial-gradient(ellipse at top, ${slideColorScheme.previewColors?.[2] || '#0b1c38'} 0%, #050b18 100%)`,
              ['--theme-card-bg' as string]: slideColorScheme.cardBg || 'rgba(15, 28, 58, 0.85)',
              ['--theme-border' as string]: slideColorScheme.borderColor || `${slideColorScheme.accent}33`,
              ['--theme-border-highlight' as string]: slideColorScheme.borderHighlight || `${slideColorScheme.accent}80`,
              ['--theme-text-accent' as string]: slideColorScheme.textAccent || slideColorScheme.accent,
              ['--theme-glow' as string]: `${slideColorScheme.primary}40`,
              ['--theme-badge-bg' as string]: `${slideColorScheme.primary}22`,
            }
          : {}),
      }}
    >
      {/* ================= خلفية الصورة المخصصة بتأثير الشفافية والتثبيت ================= */}
      {slideStyle.backgroundImage && (
        <div
          className="pointer-events-none transition-opacity duration-300"
          style={{
            position: slideStyle.backgroundAttachment === 'fixed' ? 'fixed' : 'absolute',
            inset: 0,
            backgroundImage: `url("${slideStyle.backgroundImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: slideStyle.backgroundImageOpacity !== undefined ? slideStyle.backgroundImageOpacity : 1,
            filter: slideStyle.backgroundEffect === 'blur' ? 'blur(8px)' : undefined,
            zIndex: 0,
          }}
        />
      )}

      {/* ================= تأثيرات الخلفية الإضافية (الإضاءة والمؤثرات الفنية) ================= */}
      {slideStyle.backgroundLightingAngle && slideStyle.backgroundLightingAngle !== 'none' && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay z-[1]"
          style={{
            backgroundImage: 
              slideStyle.backgroundLightingAngle === 'top-left'
                ? 'radial-gradient(circle at top left, rgba(255,255,255,0.45) 0%, transparent 60%)'
                : slideStyle.backgroundLightingAngle === 'top-right'
                ? 'radial-gradient(circle at top right, rgba(255,255,255,0.45) 0%, transparent 60%)'
                : slideStyle.backgroundLightingAngle === 'center'
                ? 'radial-gradient(circle at center, rgba(255,255,255,0.45) 0%, transparent 60%)'
                : slideStyle.backgroundLightingAngle === 'bottom'
                ? 'radial-gradient(circle at bottom, rgba(255,255,255,0.45) 0%, transparent 60%)'
                : undefined
          }}
        />
      )}

      {/* ================= تأثيرات إضاءة الشريحة الموحدة (Unified Lighting) ================= */}
      {slideStyle.lightingEffect && slideStyle.lightingEffect !== 'none' && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage:
              slideStyle.lightingEffect === 'glow-amber'
                ? 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.2) 0%, transparent 70%)'
                : slideStyle.lightingEffect === 'glow-cyan'
                ? 'radial-gradient(ellipse at top, rgba(6, 182, 212, 0.2) 0%, transparent 70%)'
                : slideStyle.lightingEffect === 'glow-purple'
                ? 'radial-gradient(ellipse at top, rgba(168, 85, 247, 0.2) 0%, transparent 70%)'
                : slideStyle.lightingEffect === 'glow-soft'
                ? 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%)'
                : undefined,
          }}
        />
      )}

      {slideStyle.backgroundEffect === 'grain' && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06] z-[1]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      )}

      {slideStyle.backgroundEffect === 'vintage' && (
        <div 
          className="absolute inset-0 pointer-events-none z-[1]" 
          style={{
            backgroundImage: 'radial-gradient(circle, transparent 50%, rgba(30,15,5,0.4) 100%)',
            backdropFilter: 'sepia(0.35) saturate(0.85) contrast(1.15)',
            WebkitBackdropFilter: 'sepia(0.35) saturate(0.85) contrast(1.15)',
          }}
        />
      )}

      {slideStyle.backgroundEffect === 'glow' && (
        <div 
          className="absolute inset-0 pointer-events-none z-[1]" 
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          }}
        />
      )}

      {slideStyle.backgroundEffect === 'neon' && (
        <div 
          className="absolute inset-0 pointer-events-none z-[1]" 
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.15) 100%)',
            backdropFilter: 'saturate(1.8) contrast(1.1)',
            WebkitBackdropFilter: 'saturate(1.8) contrast(1.1)',
          }}
        />
      )}

      {/* ================= محتوى الشريحة الفارغة أو العناصر المضافة ================= */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-start">
        {elements.length === 0 ? (
          /* في حالة عدم وجود عناصر: مساحة فارغة أنيقة بحجم الشريحة تشير إلى زر الإضافة */
          <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px] rounded-3xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] p-8 text-center transition-all group">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/10">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              شريحة فارغة بنظام الشبكة الحرة
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed mb-5">
              هذه الشريحة تدعم نظام الكانفاس الحر Freeform Grid لإضافة نصوص أو أزرار أو صور وسحبها بحرية في أي مكان بالشريحة.
            </p>

            {/* زر إضافة عنصر مع اللوحة الشاملة المنبثقة */}
            <div className="relative">
              <button
                type="button"
                id={`empty-slide-add-element-btn-${slide.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(true);
                }}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/40 flex items-center gap-2.5 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة عنصر إلى الشريحة</span>
              </button>

              {/* اللوحة الشاملة المنبثقة 40% لإضافة العناصر */}
              <AddElementFlyoutPanel
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                onAddElement={(element) => {
                  if (onAddElement) {
                    onAddElement(element);
                  }
                  setIsDropdownOpen(false);
                }}
                user={user}
                colorScheme={slideColorScheme}
                slideTitle={slide.title}
              />
            </div>
          </div>
        ) : layoutMode === 'freeform' ? (
          /* نظام الشبكة الحرة Freeform Grid Container الداعم للـ Absolute Positioning و السحب والإفلات */
          <FreeformGridContainer
            slideId={slide.id}
            elements={elements}
            user={user}
            colorScheme={colorScheme}
            isEditReady={isEditReady}
            selectedElementId={selectedElementId}
            slideHeight={slideStyle.height}
            onUpdateSlideHeight={(h) => onUpdateSlideStyle?.({ height: h })}
            onSelectElement={(elId) => onSelectElement && onSelectElement(elId || '')}
            onSelectSlide={onSelectSlide}
            onUpdateElement={onUpdateElement}
            onUpdateElements={onUpdateElements}
            onDeleteElement={onDeleteElement}
            onAddElement={onAddElement}
            renderElementContent={(el, isSelected) => renderElementContent(el, isSelected)}
          />
        ) : (
          /* وضع التدفق العمودي التلقائي */
          <div className="space-y-6 w-full py-4 max-w-5xl mx-auto">
            {elements.map((el, idx) => {
              const isSelected = selectedElementId === el.id;

              return (
                <div
                  key={el.id}
                  id={`empty-slide-element-${el.id}`}
                  className="relative group/item rounded-2xl transition-all"
                >
                  {/* شريط التحكم المصغر في العنصر */}
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute -top-3.5 left-2 z-30 flex items-center gap-1 bg-[#09152b] border border-white/20 rounded-lg p-1 shadow-lg text-[10px]">
                    {onMoveElement && idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveElement(idx, 'up');
                        }}
                        className="p-1 rounded text-gray-300 hover:text-white hover:bg-white/10"
                        title="تحريك لأعلى"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                    )}
                    {onMoveElement && idx < elements.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveElement(idx, 'down');
                        }}
                        className="p-1 rounded text-gray-300 hover:text-white hover:bg-white/10"
                        title="تحريك لأسفل"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    )}
                    {onDeleteElement && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteElement(el.id);
                        }}
                        className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                        title="حذف هذا العنصر"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {renderElementContent(el, isSelected)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
