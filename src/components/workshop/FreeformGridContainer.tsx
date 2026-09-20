import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Grid,
  Magnet,
  Move,
  Trash2,
  Layers,
  Sparkles,
  Check,
  Plus,
  RotateCw,
  Copy,
  Lock,
  Unlock,
  MoveVertical,
  ChevronDown,
  ArrowDown,
} from 'lucide-react';
import {
  ModularElement,
  ModularElementType,
  PageColorScheme,
  UserRegistrationData,
  SnapGuide,
  TextFormattingStyle,
} from '../../types';
import { useTextEdit, LayerActionType } from '../../context/TextEditContext';

interface FreeformGridContainerProps {
  slideId: string;
  elements: ModularElement[];
  user: UserRegistrationData;
  colorScheme?: PageColorScheme;
  isEditReady?: boolean;
  selectedElementId?: string | null;
  slideHeight?: number;
  onUpdateSlideHeight?: (height: number) => void;
  onSelectElement?: (elementId: string | null) => void;
  onSelectSlide?: () => void;
  onUpdateElement?: (element: ModularElement) => void;
  onUpdateElements?: (elements: ModularElement[]) => void;
  onDeleteElement?: (elementId: string) => void;
  onAddElement?: (element: ModularElement) => void;
  renderElementContent: (element: ModularElement, isSelected: boolean) => React.ReactNode;
}

interface DragState {
  elementId: string;
  startX: number;
  startY: number;
  initialElemX: number;
  initialElemY: number;
  currentX: number;
  currentY: number;
}

interface ResizeState {
  elementId: string;
  corner: 'nw' | 'ne' | 'sw' | 'se' | 'e' | 'w' | 's' | 'n';
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  initialFontSize?: number;
  currentX: number;
  currentY: number;
  currentWidth: number;
  currentHeight: number;
  currentFontSize?: number;
}

interface RotateState {
  elementId: string;
  centerX: number;
  centerY: number;
  startAngle: number;
  initialRotation: number;
  currentRotation: number;
}

const GRID_SIZE = 24; // 24px grid cell
const SNAP_THRESHOLD = 8; // pixels snap threshold

export const FreeformGridContainer: React.FC<FreeformGridContainerProps> = ({
  slideId,
  elements,
  colorScheme,
  isEditReady = true,
  selectedElementId,
  slideHeight,
  onUpdateSlideHeight,
  onSelectElement,
  onSelectSlide,
  onUpdateElement,
  onUpdateElements,
  onDeleteElement,
  onAddElement,
  renderElementContent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const resizeRef = useRef<ResizeState | null>(null);
  const [rotateState, setRotateState] = useState<RotateState | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  // إدارة تمدد الشريحة طولياً بالسحب والتمدد التلقائي
  const BASE_MIN_HEIGHT = 680;
  const [liveSlideHeight, setLiveSlideHeight] = useState<number | null>(null);
  const [isResizingSlideHeight, setIsResizingSlideHeight] = useState<boolean>(false);
  const slideResizeInfoRef = useRef<{
    startY: number;
    startHeight: number;
    minAllowedHeight: number;
  } | null>(null);

  const { startEditing, commitEditing, activeSession, updateCurrentStyle } = useTextEdit();

  // قياس ومراقبة عرض حاوية الكانفاس لضمان تناسب العناصر مع كامل العرض القياسي
  const [measuredContainerWidth, setMeasuredContainerWidth] = useState<number>(1440);
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        // قياس العرض الداخلي غير المتأثر بالـ scale لضمان إحداثيات حقيقية متطابقة مع الواقع
        const w = containerRef.current.offsetWidth || containerRef.current.clientWidth;
        if (w > 150) setMeasuredContainerWidth(Math.round(w));
      }
    };
    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateWidth);
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    }
  }, []);

  const elementsRef = useRef(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const pointerDownInfoRef = useRef<{
    element: ModularElement;
    index: number;
    startX: number;
    startY: number;
    initialElemX: number;
    initialElemY: number;
    isDragging: boolean;
    isClickOnSubElement?: boolean;
  } | null>(null);

  const primaryColor = colorScheme?.primary || '#3b82f6';
  const accentColor = colorScheme?.accent || '#f59e0b';
  const borderColor = colorScheme?.borderColor || 'rgba(255, 255, 255, 0.12)';

  // Ensure every element has a valid position
  const getElementPosition = useCallback(
    (el: ModularElement, index: number) => {
      const px = typeof el.x === 'number' ? el.x : (el.position && typeof el.position.x === 'number' ? el.position.x : undefined);
      const py = typeof el.y === 'number' ? el.y : (el.position && typeof el.position.y === 'number' ? el.position.y : undefined);
      const isText = el.type.startsWith('text_');
      const isButton = el.type === 'button';

      const defaultTextWidth = el.type === 'text_heading_large' ? 480 : el.type === 'text_body_2000' ? 600 : 360;
      const defaultNonTextWidth = isButton ? 180 : el.type === 'card' ? 360 : el.type === 'image' ? 320 : 420;
      const defaultNonTextHeight = isButton ? 48 : el.type === 'card' ? 380 : el.type === 'image' ? 240 : 160;
      const fallbackWidth = isText ? defaultTextWidth : defaultNonTextWidth;
      const fallbackHeight = isText ? 'auto' : defaultNonTextHeight;

      if (typeof px === 'number' && typeof py === 'number') {
        return {
          x: px,
          y: py,
          width: el.width ?? el.position?.width ?? fallbackWidth,
          height: el.height ?? el.position?.height ?? fallbackHeight,
          rotation: el.rotation ?? el.position?.rotation ?? 0,
          zIndex: el.zIndex ?? el.position?.zIndex ?? 10 + index,
        };
      }

      // Smart staggered default placement if no position exists yet
      const col = index % 3;
      const row = Math.floor(index / 3);
      return {
        x: 40 + col * 320,
        y: 40 + row * 160,
        width: el.width ?? el.position?.width ?? fallbackWidth,
        height: el.height ?? el.position?.height ?? fallbackHeight,
        rotation: 0,
        zIndex: 10 + index,
      };
    },
    []
  );

  // القياس الدقيق للموضع السفلي لجميع العناصر في DOM لدعم التمدد التلقائي
  const [elementsBottomY, setElementsBottomY] = useState<number>(0);

  const measureElementsBottom = useCallback(() => {
    let maxBottom = 0;
    const containerRect = containerRef.current?.getBoundingClientRect();

    elements.forEach((el, index) => {
      const elemDom = document.getElementById(`freeform-element-wrapper-${el.id}`);
      if (elemDom && containerRect) {
        const elemRect = elemDom.getBoundingClientRect();
        const physicalBottom = elemRect.bottom - containerRect.top;
        if (physicalBottom > maxBottom) {
          maxBottom = physicalBottom;
        }
      } else {
        const pos = getElementPosition(el, index);
        const h = typeof pos.height === 'number' ? pos.height : 80;
        const fallbackBottom = pos.y + h;
        if (fallbackBottom > maxBottom) {
          maxBottom = fallbackBottom;
        }
      }
    });

    if (maxBottom > 0) {
      setElementsBottomY(Math.round(maxBottom));
    }
  }, [elements, getElementPosition]);

  useEffect(() => {
    measureElementsBottom();

    // مراقبة تغير أحجام العناصر عند كتابة نصوص طويلة أو تغيير حجم الخط في الوقت الفعلي
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const ro = new ResizeObserver(() => {
        measureElementsBottom();
      });
      elements.forEach((el) => {
        const dom = document.getElementById(`freeform-element-wrapper-${el.id}`);
        if (dom) ro.observe(dom);
      });
      return () => ro.disconnect();
    }
  }, [elements, measureElementsBottom]);

  // حساب التمدد أثناء السحب النشط للعنصر ليتسع الكانفاس فوراً تحت المؤشر
  const liveDragElemDom = dragState ? document.getElementById(`freeform-element-wrapper-${dragState.elementId}`) : null;
  const liveDragHeight = liveDragElemDom ? liveDragElemDom.offsetHeight : 100;
  const liveDragBottom = dragState ? dragState.currentY + liveDragHeight : 0;
  const liveResizeBottom = resizeState ? resizeState.currentY + resizeState.currentHeight : 0;

  const currentMaxBottom = Math.max(elementsBottomY, liveDragBottom, liveResizeBottom);
  const autoRequiredHeight = currentMaxBottom > 0 ? Math.round(currentMaxBottom + 120) : BASE_MIN_HEIGHT;

  const effectiveHeight = Math.max(
    BASE_MIN_HEIGHT,
    slideHeight || BASE_MIN_HEIGHT,
    autoRequiredHeight,
    liveSlideHeight || 0
  );

  // تحديث تلقائي لارتفاع الشريحة عند تطاول المحتوى لتثبيته وحفظه في بيانات الشريحة
  useEffect(() => {
    if (autoRequiredHeight > (slideHeight || BASE_MIN_HEIGHT) && onUpdateSlideHeight) {
      onUpdateSlideHeight(autoRequiredHeight);
    }
  }, [autoRequiredHeight, slideHeight, onUpdateSlideHeight]);

  // بدء سحب المقبض السفلي لتمديد الشريحة طولياً
  const handleSlideResizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // إنهاء أي جلسة تحرير نص أو سحب عناصر فوراً
    commitEditing();
    pointerDownInfoRef.current = null;
    setDragState(null);
    setResizeState(null);
    resizeRef.current = null;

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    const minAllowed = Math.max(BASE_MIN_HEIGHT, autoRequiredHeight);
    slideResizeInfoRef.current = {
      startY: e.clientY,
      startHeight: effectiveHeight,
      minAllowedHeight: minAllowed,
    };
    setIsResizingSlideHeight(true);
    setLiveSlideHeight(effectiveHeight);
  };

  // Calculate container dimensions taking effectiveHeight into account
  const getContainerDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 1440, height: effectiveHeight };
    const width = containerRef.current.offsetWidth || containerRef.current.clientWidth || 1440;
    const height = Math.max(containerRef.current.offsetHeight || effectiveHeight, effectiveHeight);
    return {
      width,
      height,
    };
  }, [effectiveHeight]);

  // Compute snapping guides and snapped coordinates
  const computeSnapping = useCallback(
    (draggedId: string, rawX: number, rawY: number) => {
      const { width: containerWidth, height: containerHeight } = getContainerDimensions();
      const guides: SnapGuide[] = [];
      let snappedX = rawX;
      let snappedY = rawY;

      if (!snapToGrid) {
        return { snappedX, snappedY, guides };
      }

      // 1. Snap to canvas center
      const centerX = Math.round(containerWidth / 2);
      const centerY = Math.round(containerHeight / 2);

      const draggingElem = elements.find((e) => e.id === draggedId);
      const elemWidth = draggingElem?.width
        ? (typeof draggingElem.width === 'number' ? draggingElem.width : 300)
        : (draggingElem?.position?.width && typeof draggingElem.position.width === 'number' ? draggingElem.position.width : 300);
      const elemCenterCurrentX = rawX + elemWidth / 2;

      // Snap to canvas center X
      if (Math.abs(elemCenterCurrentX - centerX) < SNAP_THRESHOLD) {
        snappedX = centerX - elemWidth / 2;
        guides.push({
          id: 'guide-center-x',
          type: 'x',
          position: centerX,
          label: 'منتصف الشريحة',
        });
      }

      // Snap to canvas center Y
      if (Math.abs(rawY - centerY) < SNAP_THRESHOLD) {
        snappedY = centerY;
        guides.push({
          id: 'guide-center-y',
          type: 'y',
          position: centerY,
          label: 'منتصف الشريحة أفقي',
        });
      }

      // 2. Snap to other elements' boundaries & centers
      elements.forEach((other, idx) => {
        if (other.id === draggedId) return;
        const otherPos = getElementPosition(other, idx);
        const otherWidth = typeof otherPos.width === 'number' ? otherPos.width : 300;
        const otherCenterX = otherPos.x + otherWidth / 2;

        // Snap left-to-left
        if (Math.abs(rawX - otherPos.x) < SNAP_THRESHOLD) {
          snappedX = otherPos.x;
          guides.push({
            id: `guide-el-${other.id}-left`,
            type: 'x',
            position: otherPos.x,
            label: 'محاذاة مع عنصر',
          });
        }
        // Snap center-to-center
        else if (Math.abs(elemCenterCurrentX - otherCenterX) < SNAP_THRESHOLD) {
          snappedX = otherCenterX - elemWidth / 2;
          guides.push({
            id: `guide-el-${other.id}-center`,
            type: 'x',
            position: otherCenterX,
            label: 'محاذاة المركز',
          });
        }

        // Snap top-to-top
        if (Math.abs(rawY - otherPos.y) < SNAP_THRESHOLD) {
          snappedY = otherPos.y;
          guides.push({
            id: `guide-el-${other.id}-top`,
            type: 'y',
            position: otherPos.y,
            label: 'محاذاة أفقية',
          });
        }
      });

      // 3. Fallback: Snap to minor grid if no element snapped
      if (guides.length === 0) {
        const gridX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
        const gridY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
        if (Math.abs(rawX - gridX) < 4) snappedX = gridX;
        if (Math.abs(rawY - gridY) < 4) snappedY = gridY;
      }

      // Boundary clamp inside container ensuring the whole element width fits without clipping
      const elemW = draggingElem?.width
        ? (typeof draggingElem.width === 'number' ? draggingElem.width : 260)
        : (draggingElem?.position?.width && typeof draggingElem.position.width === 'number' ? draggingElem.position.width : 260);
      const maxAllowedX = Math.max(10, containerWidth - elemW - 16);
      snappedX = Math.max(10, Math.min(snappedX, maxAllowedX));
      snappedY = Math.max(10, Math.min(snappedY, containerHeight - 60));

      return { snappedX, snappedY, guides };
    },
    [snapToGrid, getContainerDimensions, elements, getElementPosition]
  );

  // Duplicate an element
  const handleDuplicateElement = (element: ModularElement) => {
    if (!onAddElement) return;
    const pos = getElementPosition(element, 0);
    const newId = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const duplicated: ModularElement = {
      ...element,
      id: newId,
      isLocked: false,
      x: pos.x + 24,
      y: pos.y + 24,
      position: {
        ...(element.position || {}),
        x: pos.x + 24,
        y: pos.y + 24,
      },
    };
    onAddElement(duplicated);
    if (onSelectElement) {
      onSelectElement(newId);
    }
  };

  // Layer order actions (فوق، للأعلى، للأسفل، في الأسفل)
  const handleLayerAction = useCallback(
    (targetElementId: string, action: LayerActionType) => {
      if (!onUpdateElement && !onUpdateElements) return;
      const allEls = [...(elementsRef.current || elements)];
      if (allEls.length <= 1) return;

      const getZ = (el: ModularElement, idx: number) => {
        if (typeof el.position?.zIndex === 'number') return el.position.zIndex;
        if (typeof el.zIndex === 'number') return el.zIndex;
        return (idx + 1) * 10;
      };

      // ترتيب الطبقات الحالي من الأسفل للأعلى (ترتيب ثابت مستقر وموثوق)
      const currentOrder = [...allEls].sort((a, b) => {
        const origIdxA = allEls.findIndex((x) => x.id === a.id);
        const origIdxB = allEls.findIndex((x) => x.id === b.id);
        const zA = getZ(a, origIdxA);
        const zB = getZ(b, origIdxB);
        if (zA !== zB) return zA - zB;
        return origIdxA - origIdxB;
      });

      const curIdx = currentOrder.findIndex((el) => el.id === targetElementId);
      if (curIdx === -1) return;

      let nextOrder: ModularElement[] = [...currentOrder];

      switch (action) {
        case 'bringForward': {
          // للأعلى: يرفع طبقة واحدة فقط (يبدل مكانه مع العنصر الذي يعلوه مباشرة)
          if (curIdx >= currentOrder.length - 1) return; // هو بالفعل في أعلى طبقة
          const temp = nextOrder[curIdx];
          nextOrder[curIdx] = nextOrder[curIdx + 1];
          nextOrder[curIdx + 1] = temp;
          break;
        }

        case 'sendBackward': {
          // للأسفل: ينزل طبقة واحدة فقط (يبدل مكانه مع العنصر الذي يسبقه تحته مباشرة)
          if (curIdx <= 0) return; // هو بالفعل في أسفل طبقة
          const temp = nextOrder[curIdx];
          nextOrder[curIdx] = nextOrder[curIdx - 1];
          nextOrder[curIdx - 1] = temp;
          break;
        }

        case 'bringToFront': {
          // فوق (فوق الكل): ينقل العنصر إلى قمة الطبقات جميعاً
          const target = nextOrder[curIdx];
          nextOrder = nextOrder.filter((el) => el.id !== targetElementId);
          nextOrder.push(target);
          break;
        }

        case 'sendToBack': {
          // في الأسفل (تحت الكل): ينقل العنصر إلى قاع الطبقات جميعاً
          const target = nextOrder[curIdx];
          nextOrder = nextOrder.filter((el) => el.id !== targetElementId);
          nextOrder.unshift(target);
          break;
        }
      }

      // إعادة ترقيم متسلسل ومنظم لجميع العناصر بقيم zIndex واضحة ومتباعدة (10, 20, 30...)
      const updatedElements: ModularElement[] = nextOrder.map((el, i) => {
        const newZ = (i + 1) * 10;
        const currentPos = el.position || { x: 40, y: 40, rotation: 0 };
        return {
          ...el,
          zIndex: newZ,
          position: {
            ...currentPos,
            x: typeof el.x === 'number' ? el.x : (currentPos.x ?? 40),
            y: typeof el.y === 'number' ? el.y : (currentPos.y ?? 40),
            zIndex: newZ,
          },
        };
      });

      // 1. تحديث الـ ref فوراً للتعامل مع النقرات المتتالية السريعة دون أي تأخير
      elementsRef.current = updatedElements;

      // 2. تطبيق zIndex مباشرة على عناصر الـ DOM لتحديث العرض الفوري دون وميض
      updatedElements.forEach((el) => {
        const elDom = document.getElementById(`freeform-element-wrapper-${el.id}`);
        if (elDom) {
          elDom.style.zIndex = `${el.zIndex}`;
        }
      });

      // 3. حفظ وحقن العناصر المحدثة بالكامل
      if (onUpdateElements) {
        onUpdateElements(updatedElements);
      } else if (onUpdateElement) {
        updatedElements.forEach((el) => {
          onUpdateElement(el);
        });
      }
    },
    [elements, onUpdateElement, onUpdateElements]
  );

  // تفعيل تعديل النص بأمان مع الحفاظ التام والنهائي على حجم الخط الحالي بدون تصغير
  const handleStartTextEdit = useCallback(
    (elem: ModularElement) => {
      if (!isEditReady) return;
      if (elem.isLocked) return;

      const isText = elem.type.startsWith('text_');
      const elemDom = document.getElementById(`freeform-element-wrapper-${elem.id}`);
      const textChild =
        elemDom?.querySelector<HTMLElement>('[contenteditable], p, h1, h2, h3, h4, span') ||
        document.getElementById(`editable-text-${elem.id}`);

      const computedFont = textChild ? window.getComputedStyle(textChild).fontSize : undefined;
      const currentFontSize =
        elem.formattingStyle?.fontSize ||
        elem.data?.style?.fontSize ||
        computedFont ||
        (elem.type === 'text_heading_large' ? '36px' : elem.type === 'text_heading_medium' ? '24px' : '16px');

      const safeStyle: TextFormattingStyle = {
        ...(elem.formattingStyle || {}),
        ...(elem.data?.style || {}),
        boxStyle: {
          ...(elem.formattingStyle?.boxStyle || {}),
          ...(elem.data?.style?.boxStyle || {}),
        },
        fontSize: currentFontSize,
      };

      startEditing({
        elementId: elem.id,
        slideId,
        initialText: elem.data?.text || (elem.title || (isText ? 'مستند نصي' : 'عنصر')),
        initialStyle: safeStyle,
        label:
          elem.type === 'text_heading_large'
            ? 'عنوان رئيسي'
            : elem.type === 'text_heading_medium'
            ? 'عنوان فرعي'
            : elem.type.startsWith('text_')
            ? 'فقرة نصية'
            : (elem.title || 'عنصر'),
        onSave: (newText, newStyle) => {
          if (onUpdateElement) {
            const latest = elementsRef.current?.find((el) => el.id === elem.id) || elem;
            const cleanNewStyle: Record<string, any> = {};
            if (newStyle) {
              Object.entries(newStyle).forEach(([k, v]) => {
                if (v !== undefined) cleanNewStyle[k] = v;
              });
            }
            const mergedStyle: any = {
              ...(latest.formattingStyle || {}),
              ...(latest.data?.style || {}),
              ...cleanNewStyle,
              boxStyle: {
                ...(latest.formattingStyle?.boxStyle || {}),
                ...(latest.data?.style?.boxStyle || {}),
                ...(cleanNewStyle.boxStyle || {}),
              },
            };

            const isRemovingAnim = !newStyle?.animation || newStyle.animation.type === 'none';
            const updatedElem: ModularElement = {
              ...latest,
              data: {
                ...latest.data,
                text: newText,
                style: mergedStyle,
              },
              formattingStyle: mergedStyle,
            };

            if (isRemovingAnim) {
              delete mergedStyle.animation;
              if (updatedElem.data?.style) {
                delete (updatedElem.data.style as any).animation;
              }
              if (updatedElem.formattingStyle) {
                delete (updatedElem.formattingStyle as any).animation;
              }
              delete (updatedElem as any).animation;
            } else {
              mergedStyle.animation = newStyle.animation;
              if (updatedElem.data?.style) {
                (updatedElem.data.style as any).animation = newStyle.animation;
              }
              if (updatedElem.formattingStyle) {
                (updatedElem.formattingStyle as any).animation = newStyle.animation;
              }
              updatedElem.animation = newStyle.animation;
            }

            onUpdateElement(updatedElem);
          }
        },
        onDelete: () => {
          if (onDeleteElement) onDeleteElement(elem.id);
        },
        onDuplicate: () => {
          handleDuplicateElement(elem);
        },
        onLayerAction: (action) => {
          handleLayerAction(elem.id, action);
        },
      });

      if (isText) {
        setTimeout(() => {
          const textEl =
            document.getElementById(`editable-text-${elem.id}`) ||
            elemDom?.querySelector<HTMLElement>('[contenteditable]');
          if (textEl && document.activeElement !== textEl) {
            textEl.focus();
          }
        }, 30);
      }
    },
    [isEditReady, slideId, startEditing, onUpdateElement, onDeleteElement, handleDuplicateElement, handleLayerAction]
  );

  // ================= DRAG & SELECTION (التحريك والسحب) =================
  const handlePointerDown = (
    e: React.PointerEvent,
    element: ModularElement,
    index: number
  ) => {
    if (!isEditReady) return;

    // If element is locked: select it, but never allow dragging
    if (element.isLocked) {
      if (onSelectElement) onSelectElement(element.id);
      return;
    }

    const targetEl = e.target as HTMLElement;
    // Don't intercept resize, rotate, or action buttons (except move-handle)
    if (
      targetEl.dataset.resizeCorner ||
      targetEl.dataset.rotateHandle ||
      (targetEl.closest('[data-action]') && !targetEl.closest('[data-action="move-handle"]'))
    ) {
      return;
    }

    const isText = element.type.startsWith('text_');
    const isClickOnTextContent = Boolean(
      targetEl.closest('[data-element-content="true"]') ||
      targetEl.closest('[contenteditable], [id^="editable-text-"], p, h1, h2, h3, h4, span')
    );
    const isClickOnMoveHandle = Boolean(targetEl.closest('[data-action="move-handle"]'));
    const isClickOnBoundingBorder = Boolean(
      targetEl.dataset.boundingBorder || targetEl.closest('[data-bounding-border="true"]')
    );

    // النقر على النص في الداخل: يجمد التحريك ويجمد السحب لتغيير الحجم فوراً ويخصص فقط لتعديل النص
    if (isText && isClickOnTextContent && !isClickOnMoveHandle && !isClickOnBoundingBorder) {
      pointerDownInfoRef.current = null;
      setDragState(null);
      setResizeState(null);
      resizeRef.current = null;

      if (onSelectElement) onSelectElement(element.id);
      handleStartTextEdit(element);
      return;
    }

    const isClickOnSubElement = Boolean(
      targetEl.closest('[data-gallery-sub-image="true"]') ||
      targetEl.closest('[data-sub-selectable="true"]')
    );

    const pos = getElementPosition(element, index);

    pointerDownInfoRef.current = {
      element,
      index,
      startX: e.clientX,
      startY: e.clientY,
      initialElemX: pos.x,
      initialElemY: pos.y,
      isDragging: false,
      isClickOnSubElement,
    };
  };

  // Keep refs for activeSession and updateCurrentStyle to avoid stale closures in global pointer handlers
  const activeSessionRef = useRef(activeSession);
  activeSessionRef.current = activeSession;
  const updateCurrentStyleRef = useRef(updateCurrentStyle);
  updateCurrentStyleRef.current = updateCurrentStyle;

  // ================= RESIZE HANDLING (تكبير وتصغير العنصر من المقابض الأربعة + الجانبين) =================
  const handleResizePointerDown = (
    e: React.PointerEvent,
    element: ModularElement,
    corner: 'nw' | 'ne' | 'sw' | 'se' | 'e' | 'w' | 's' | 'n',
    index: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    if (element.isLocked) return;

    // تجميد التحريك وتجميد تعديل النص تماماً عند النقر على مقبض التكبير/التصغير
    pointerDownInfoRef.current = null;
    setDragState(null);

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    const isText = element.type.startsWith('text_');
    const pos = getElementPosition(element, index);
    const elemDom = document.getElementById(`freeform-element-wrapper-${element.id}`);
    const actualWidth = typeof pos.width === 'number' ? pos.width : (elemDom?.offsetWidth || 280);
    const actualHeight = typeof pos.height === 'number' ? pos.height : (elemDom?.offsetHeight || 80);

    const defaultFont =
      element.type === 'text_heading_large' ? 36 :
      element.type === 'text_heading_medium' ? 24 : 16;
    
    // Check explicit formatting or data styles first, or specific editable-text element (never span tags from badges)
    const explicitFontStr =
      element.formattingStyle?.fontSize ||
      element.data?.style?.fontSize ||
      (activeSessionRef.current?.elementId === element.id ? activeSessionRef.current.currentStyle?.fontSize : undefined);
    const parsedFont = explicitFontStr ? parseFloat(explicitFontStr) : NaN;

    let computedFont = NaN;
    const textChild = document.getElementById(`editable-text-${element.id}`) ||
      elemDom?.querySelector<HTMLElement>('[contenteditable], h1, h2, h3, h4, p');
    if (textChild) {
      const comp = parseFloat(window.getComputedStyle(textChild).fontSize);
      if (!Number.isNaN(comp) && comp > 0) {
        computedFont = comp;
      }
    }

    const initialFontSize = !Number.isNaN(parsedFont) && parsedFont > 0
      ? parsedFont
      : (!Number.isNaN(computedFont) && computedFont > 0 ? computedFont : defaultFont);

    const newResizeState: ResizeState = {
      elementId: element.id,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
      initialWidth: actualWidth,
      initialHeight: actualHeight,
      initialFontSize: isText ? initialFontSize : undefined,
      currentX: pos.x,
      currentY: pos.y,
      currentWidth: actualWidth,
      currentHeight: actualHeight,
      currentFontSize: isText ? initialFontSize : undefined,
    };

    resizeRef.current = newResizeState;
    setResizeState(newResizeState);
  };

  // ================= ROTATION HANDLING (تدوير العنصر بالسحب من المقبض العلوي) =================
  const handleRotatePointerDown = (
    e: React.PointerEvent,
    element: ModularElement,
    index: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    if (element.isLocked) return;

    const elemDom = document.getElementById(`freeform-element-wrapper-${element.id}`);
    if (!elemDom) return;

    const rect = elemDom.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const currentRot = element.rotation ?? element.position?.rotation ?? 0;

    setRotateState({
      elementId: element.id,
      centerX,
      centerY,
      startAngle,
      initialRotation: currentRot,
      currentRotation: currentRot,
    });
  };

  // Global pointer move and up listeners for seamless, uninterrupted dragging
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      // Dynamic canvas scale factor (ensures 1:1 mouse movement when canvas is zoomed or auto-fitted)
      let currentScale = 1;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetW = containerRef.current.offsetWidth;
        if (offsetW > 0 && rect.width > 0) {
          const s = rect.width / offsetW;
          if (s > 0.05 && s < 20) currentScale = s;
        }
      }

      // -1. Handle Slide Height Resizing (سحب الحد السفلي لتمديد الشريحة طولياً)
      if (slideResizeInfoRef.current) {
        e.preventDefault();
        const deltaY = (e.clientY - slideResizeInfoRef.current.startY) / currentScale;
        const newH = Math.max(
          slideResizeInfoRef.current.minAllowedHeight,
          Math.round(slideResizeInfoRef.current.startHeight + deltaY)
        );
        setLiveSlideHeight(newH);

        // Direct DOM update for instant smooth 60fps responsiveness
        if (containerRef.current) {
          containerRef.current.style.height = `${newH}px`;
          containerRef.current.style.minHeight = `${newH}px`;
        }
        const sectionDom = document.getElementById(`slide-empty-${slideId}`);
        if (sectionDom) {
          sectionDom.style.minHeight = `${newH}px`;
        }
        const wrapperDom = document.getElementById(`slide-wrapper-${slideId}`);
        if (wrapperDom) {
          wrapperDom.style.minHeight = `${newH}px`;
        }
        return;
      }

      // 0. Check Pointer Down to activate Drag if moved > 3px (never when resizing or rotating)
      if (pointerDownInfoRef.current && !dragState && !resizeRef.current && !resizeState && !rotateState) {
        const deltaX = (e.clientX - pointerDownInfoRef.current.startX) / currentScale;
        const deltaY = (e.clientY - pointerDownInfoRef.current.startY) / currentScale;
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
          pointerDownInfoRef.current.isDragging = true;
          // Clear any browser text selection to allow clean dragging
          try {
            window.getSelection()?.removeAllRanges();
          } catch {}

          const pos = getElementPosition(
            pointerDownInfoRef.current.element,
            pointerDownInfoRef.current.index
          );
          if (onSelectElement) {
            onSelectElement(pointerDownInfoRef.current.element.id);
          }
          setDragState({
            elementId: pointerDownInfoRef.current.element.id,
            startX: pointerDownInfoRef.current.startX,
            startY: pointerDownInfoRef.current.startY,
            initialElemX: pos.x,
            initialElemY: pos.y,
            currentX: pos.x + deltaX,
            currentY: pos.y + deltaY,
          });
          return;
        }
      }

      // 1. Handle Active Drag
      if (dragState) {
        e.preventDefault();
        const deltaX = (e.clientX - dragState.startX) / currentScale;
        const deltaY = (e.clientY - dragState.startY) / currentScale;

        const rawX = dragState.initialElemX + deltaX;
        const rawY = dragState.initialElemY + deltaY;

        const { snappedX, snappedY, guides } = computeSnapping(dragState.elementId, rawX, rawY);
        setActiveGuides(guides);
        setDragState((prev) => (prev ? { ...prev, currentX: snappedX, currentY: snappedY } : null));
        return;
      }

      // 2. Handle Active Resize
      const activeResize = resizeRef.current || resizeState;
      if (activeResize) {
        e.preventDefault();
        const deltaX = (e.clientX - activeResize.startX) / currentScale;
        const deltaY = (e.clientY - activeResize.startY) / currentScale;

        const isText = Boolean(activeResize.initialFontSize);
        const isCorner = ['se', 'sw', 'ne', 'nw'].includes(activeResize.corner);

        let newWidth = activeResize.initialWidth;
        let newHeight = activeResize.initialHeight;
        let newX = activeResize.initialX;
        let newY = activeResize.initialY;
        let newFontSize = activeResize.initialFontSize;

        if (isText && (activeResize.corner === 'e' || activeResize.corner === 'w')) {
          // ================= SIDE HANDLES (e, w): HORIZONTAL TEXT WIDTH ADJUSTMENT =================
          // المقابض الجانبية تغير عرض صندوق النص وتسمح بإعادة التفاف الكلمات دون المساس بحجم الخط (Canva style)
          if (activeResize.corner === 'e') {
            newWidth = Math.max(60, activeResize.initialWidth + deltaX);
          } else {
            newWidth = Math.max(60, activeResize.initialWidth - deltaX);
            newX = activeResize.initialX + (activeResize.initialWidth - newWidth);
          }
          newFontSize = activeResize.initialFontSize;
        } else if (isText && isCorner && activeResize.initialFontSize) {
          // ================= CORNER HANDLES: PROPORTIONAL SCALING (FONT SIZE & BOX) =================
          // السحب من الزوايا الأربعة يغير حجم الخط وعرض الصندوق بنفس النسبة المتطابقة تماماً دون انكسار
          let deltaProj = 0;
          if (activeResize.corner === 'se') {
            deltaProj = (deltaX + deltaY) / 2;
          } else if (activeResize.corner === 'nw') {
            deltaProj = (-deltaX - deltaY) / 2;
          } else if (activeResize.corner === 'ne') {
            deltaProj = (deltaX - deltaY) / 2;
          } else if (activeResize.corner === 'sw') {
            deltaProj = (-deltaX + deltaY) / 2;
          }

          const baseDim = Math.max(60, activeResize.initialWidth);
          const scale = Math.max(0.15, Math.min(10.0, (baseDim + deltaProj) / baseDim));
          newWidth = Math.max(48, Math.round(activeResize.initialWidth * scale));
          newHeight = Math.max(25, Math.round(activeResize.initialHeight * scale));
          newFontSize = Math.max(10, Math.min(320, Math.round(activeResize.initialFontSize * scale)));

          if (activeResize.corner === 'sw' || activeResize.corner === 'nw') {
            newX = activeResize.initialX + (activeResize.initialWidth - newWidth);
          }
          if (activeResize.corner === 'ne' || activeResize.corner === 'nw') {
            newY = activeResize.initialY + (activeResize.initialHeight - newHeight);
          }

          // Direct DOM updates for instant responsiveness
          const textChild = document.getElementById(`editable-text-${activeResize.elementId}`) ||
            document.getElementById(`freeform-element-wrapper-${activeResize.elementId}`)?.querySelector<HTMLElement>('[contenteditable], h1, h2, h3, h4, p');
          if (textChild && newFontSize) {
            textChild.style.fontSize = `${newFontSize}px`;
          }

          if (activeSessionRef.current && activeSessionRef.current.elementId === activeResize.elementId && newFontSize) {
            activeSessionRef.current.currentStyle.fontSize = `${newFontSize}px`;
          }
        } else {
          // Standard non-text element resize
          switch (activeResize.corner) {
            case 'se':
              newWidth = Math.max(60, activeResize.initialWidth + deltaX);
              newHeight = Math.max(25, activeResize.initialHeight + deltaY);
              break;
            case 'sw':
              newWidth = Math.max(60, activeResize.initialWidth - deltaX);
              newHeight = Math.max(25, activeResize.initialHeight + deltaY);
              newX = activeResize.initialX + (activeResize.initialWidth - newWidth);
              break;
            case 'ne':
              newWidth = Math.max(60, activeResize.initialWidth + deltaX);
              newHeight = Math.max(25, activeResize.initialHeight - deltaY);
              newY = activeResize.initialY + (activeResize.initialHeight - newHeight);
              break;
            case 'nw':
              newWidth = Math.max(60, activeResize.initialWidth - deltaX);
              newHeight = Math.max(25, activeResize.initialHeight - deltaY);
              newX = activeResize.initialX + (activeResize.initialWidth - newWidth);
              newY = activeResize.initialY + (activeResize.initialHeight - newHeight);
              break;
            case 'e':
              newWidth = Math.max(60, activeResize.initialWidth + deltaX);
              break;
            case 'w':
              newWidth = Math.max(60, activeResize.initialWidth - deltaX);
              newX = activeResize.initialX + (activeResize.initialWidth - newWidth);
              break;
            case 's':
              newHeight = Math.max(40, activeResize.initialHeight + deltaY);
              break;
            case 'n':
              newHeight = Math.max(40, activeResize.initialHeight - deltaY);
              newY = activeResize.initialY + (activeResize.initialHeight - newHeight);
              break;
          }
        }

        // Direct DOM update for wrapper element
        const elemDom = document.getElementById(`freeform-element-wrapper-${activeResize.elementId}`);
        if (elemDom) {
          elemDom.style.left = `${newX}px`;
          elemDom.style.top = `${newY}px`;
          elemDom.style.width = `${newWidth}px`;
          if (!isText) {
            elemDom.style.height = `${newHeight}px`;

            // Update inner content and button elements directly in real-time
            const contentDom = elemDom.querySelector<HTMLElement>('[data-element-content="true"]');
            if (contentDom) {
              contentDom.style.width = `${newWidth}px`;
              contentDom.style.height = `${newHeight}px`;
            }
            const btnDom = document.getElementById(`button-element-${activeResize.elementId}`);
            if (btnDom) {
              btnDom.style.width = `${newWidth}px`;
              btnDom.style.height = `${newHeight}px`;
            }
            const btnWrapperDom = document.getElementById(`button-element-wrapper-${activeResize.elementId}`);
            if (btnWrapperDom) {
              btnWrapperDom.style.width = `${newWidth}px`;
              btnWrapperDom.style.height = `${newHeight}px`;
            }
          }
        }

        const nextResizeState: ResizeState = {
          ...activeResize,
          currentX: newX,
          currentY: newY,
          currentWidth: newWidth,
          currentHeight: newHeight,
          currentFontSize: newFontSize,
        };
        resizeRef.current = nextResizeState;
        setResizeState(nextResizeState);
        return;
      }

      // 3. Handle Active Rotate
      if (rotateState) {
        e.preventDefault();
        const currentAngle =
          Math.atan2(e.clientY - rotateState.centerY, e.clientX - rotateState.centerX) *
          (180 / Math.PI);
        let angleDiff = currentAngle - rotateState.startAngle;
        let calculatedRotation = Math.round((rotateState.initialRotation + angleDiff) % 360);
        if (calculatedRotation < 0) calculatedRotation += 360;

        // Snap rotation to 0, 90, 180, 270 if within 5 degrees
        if (Math.abs(calculatedRotation - 0) < 5 || Math.abs(calculatedRotation - 360) < 5) calculatedRotation = 0;
        else if (Math.abs(calculatedRotation - 90) < 5) calculatedRotation = 90;
        else if (Math.abs(calculatedRotation - 180) < 5) calculatedRotation = 180;
        else if (Math.abs(calculatedRotation - 270) < 5) calculatedRotation = 270;

        setRotateState((prev) => (prev ? { ...prev, currentRotation: calculatedRotation } : null));
      }
    };

    const handleGlobalPointerUp = () => {
      // Commit Slide Height Resizing
      if (slideResizeInfoRef.current) {
        const finalH = liveSlideHeight || slideResizeInfoRef.current.startHeight;
        slideResizeInfoRef.current = null;
        setIsResizingSlideHeight(false);
        setLiveSlideHeight(null);
        if (onUpdateSlideHeight) {
          onUpdateSlideHeight(finalH);
        }
      }

      // 0. Check single click (mouse release without dragging)
      if (pointerDownInfoRef.current && !pointerDownInfoRef.current.isDragging) {
        const elem = pointerDownInfoRef.current.element;
        if (!pointerDownInfoRef.current.isClickOnSubElement) {
          if (onSelectElement) {
            onSelectElement(elem.id);
          }
        }

        // If element is locked, do not enter edit mode on single click
        if (elem.isLocked) {
          pointerDownInfoRef.current = null;
          return;
        }

        if (elem.type.startsWith('text_')) {
          handleStartTextEdit(elem);
        }
      }
      pointerDownInfoRef.current = null;

      // Commit Drag
      if (dragState) {
        const targetElement = elements.find((el) => el.id === dragState.elementId);
        if (targetElement && onUpdateElement) {
          const currentPos = targetElement.position || {
            x: dragState.currentX,
            y: dragState.currentY,
            rotation: 0,
            zIndex: 10,
          };
          const updatedElement: ModularElement = {
            ...targetElement,
            x: Math.round(dragState.currentX),
            y: Math.round(dragState.currentY),
            position: {
              ...currentPos,
              x: Math.round(dragState.currentX),
              y: Math.round(dragState.currentY),
            },
          };
          onUpdateElement(updatedElement);

          // إذا تم سحب العنصر لأسفل، يتم تمديد الشريحة تلقائياً وحفظ الارتفاع
          const targetDom = document.getElementById(`freeform-element-wrapper-${targetElement.id}`);
          const targetH = targetDom ? targetDom.offsetHeight : 100;
          const targetBottom = Math.round(dragState.currentY + targetH + 120);
          if (targetBottom > (slideHeight || BASE_MIN_HEIGHT) && onUpdateSlideHeight) {
            onUpdateSlideHeight(targetBottom);
          }
        }
        setDragState(null);
        setActiveGuides([]);
      }

      // Commit Resize
      const finalResize = resizeRef.current || resizeState;
      if (finalResize) {
        const targetElement = (elementsRef.current || elements).find((el) => el.id === finalResize.elementId);
        if (targetElement && onUpdateElement) {
          const isText = targetElement.type.startsWith('text_');
          const currentPos = targetElement.position || {};
          // حفظ حجم الخط الجديد عند السحب من أي مقبض
          const fontSizeToSave = isText && finalResize.currentFontSize ? `${finalResize.currentFontSize}px` : undefined;

          const updatedElement: ModularElement = {
            ...targetElement,
            x: Math.round(finalResize.currentX),
            y: Math.round(finalResize.currentY),
            // حفظ العرض بدقة بعد انتهاء السحب، والارتفاع auto للنصوص لتلائم الأسطر
            width: Math.round(finalResize.currentWidth),
            height: isText ? 'auto' : Math.round(finalResize.currentHeight),
            position: {
              ...currentPos,
              x: Math.round(finalResize.currentX),
              y: Math.round(finalResize.currentY),
              width: Math.round(finalResize.currentWidth),
              height: isText ? 'auto' : Math.round(finalResize.currentHeight),
            },
            data: {
              ...targetElement.data,
              style: {
                ...(targetElement.data?.style || {}),
                ...(fontSizeToSave ? { fontSize: fontSizeToSave } : {}),
              },
            },
            formattingStyle: {
              ...(targetElement.formattingStyle || {}),
              ...(fontSizeToSave ? { fontSize: fontSizeToSave } : {}),
            },
          };
          onUpdateElement(updatedElement);

          if (fontSizeToSave && updateCurrentStyleRef.current) {
            updateCurrentStyleRef.current((prev) => ({
              ...prev,
              fontSize: fontSizeToSave,
            }));
          }

          if (activeSessionRef.current && activeSessionRef.current.elementId === finalResize.elementId && fontSizeToSave) {
            activeSessionRef.current.currentStyle.fontSize = fontSizeToSave;
            activeSessionRef.current.initialStyle.fontSize = fontSizeToSave;
          }

          // إذا تم تكبير أو تمديد العنصر لأسفل، يتم تمديد الشريحة تلقائياً
          const resizeBottom = Math.round(finalResize.currentY + finalResize.currentHeight + 120);
          if (resizeBottom > (slideHeight || BASE_MIN_HEIGHT) && onUpdateSlideHeight) {
            onUpdateSlideHeight(resizeBottom);
          }
        }
        resizeRef.current = null;
        setResizeState(null);
      }

      // Commit Rotate
      if (rotateState) {
        const targetElement = elements.find((el) => el.id === rotateState.elementId);
        if (targetElement && onUpdateElement) {
          const currentPos = targetElement.position || {};
          const updatedElement: ModularElement = {
            ...targetElement,
            rotation: rotateState.currentRotation,
            position: {
              ...currentPos,
              rotation: rotateState.currentRotation,
            },
          };
          onUpdateElement(updatedElement);
        }
        setRotateState(null);
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [dragState, resizeState, rotateState, elements, onUpdateElement, computeSnapping, onSelectElement, startEditing, slideId, onDeleteElement]);

  // Click outside to deselect and save, or delete if empty
  const handleDeselectAndCommit = useCallback(() => {
    if (selectedElementId) {
      const currentEl = elementsRef.current?.find((el) => el.id === selectedElementId);
      if (currentEl && currentEl.type.startsWith('text_')) {
        const domEl = document.getElementById(`editable-text-${selectedElementId}`);
        const textInDom = domEl ? domEl.innerText : undefined;
        const textInSession = activeSessionRef.current?.elementId === selectedElementId ? activeSessionRef.current.currentText : undefined;
        const textInElement = currentEl.data?.text;
        
        const candidateText = textInDom !== undefined ? textInDom : (textInSession !== undefined ? textInSession : textInElement || '');
        const trimmed = (candidateText || '').trim();

        // النقر خارجاً بدون حروف في الصندوق يحذف العنصر نهائياً
        if (trimmed.length === 0) {
          if (onDeleteElement) {
            onDeleteElement(selectedElementId);
          }
          if (onSelectElement) {
            onSelectElement(null);
          }
          commitEditing();
          onSelectSlide?.();
          return;
        }
      }
    }

    // النقر خارجاً يحفظ العنصر في آخر حالة مع الصندوق إن كان هناك نص بالداخل
    if (onSelectElement) {
      onSelectElement(null);
    }
    commitEditing();
    onSelectSlide?.();
  }, [selectedElementId, onDeleteElement, onSelectElement, commitEditing, onSelectSlide]);

  // Global listener for clicking outside the selected text element
  useEffect(() => {
    if (!selectedElementId) return;

    const handleDocumentPointerDown = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if clicking inside the current element wrapper
      const wrapperEl = document.getElementById(`freeform-element-wrapper-${selectedElementId}`);
      if (wrapperEl && (wrapperEl === target || wrapperEl.contains(target))) {
        return;
      }
      // Check if clicking another element wrapper on the canvas
      if (target.closest('[id^="freeform-element-wrapper-"]')) {
        return;
      }
      // Check if clicking text formatting toolbars or buttons or popovers or modals
      if (
        target.closest('#slide-inline-edit-toolbar') ||
        target.closest('[data-text-edit-topbar]') ||
        target.closest('#text-edit-topbar') ||
        target.closest('#text-format-toolbar') ||
        target.closest('[data-text-toolbar]') ||
        target.closest('[data-toolbar-popover]') ||
        target.closest('#bottom-text-edit-toolbar-container') ||
        target.closest('#layers-options-popup') ||
        target.closest('#text-toolbar-active-popup') ||
        target.closest('#unified-bottom-text-toolbar') ||
        target.closest('[data-action]') ||
        target.closest('#user-site-top-navbar') ||
        target.closest('#workshop-top-navbar') ||
        target.closest('.text-edit-popover') ||
        target.closest('#slide-edit-topbar') ||
        target.closest('#image-edit-toolbar') ||
        target.closest('#gallery-edit-toolbar') ||
        target.closest('#button-edit-toolbar') ||
        target.closest('[data-image-popover]') ||
        target.closest('[data-gallery-popover]') ||
        target.closest('.unsplash-modal') ||
        target.closest('[data-unsplash-modal]') ||
        target.closest('#unsplash-gallery-modal') ||
        target.closest('[data-modal-portal]') ||
        target.closest('.modular-catalog-modal') ||
        target.closest('[data-catalog-modal]') ||
        target.closest('#modular-catalog-modal')
      ) {
        return;
      }

      // If current element is a text element and has 0 letters, delete it immediately
      const currentEl = elementsRef.current?.find((el) => el.id === selectedElementId);
      if (currentEl && currentEl.type.startsWith('text_')) {
        const domEl = document.getElementById(`editable-text-${selectedElementId}`);
        const textInDom = domEl ? domEl.innerText : undefined;
        const textInSession = activeSessionRef.current?.elementId === selectedElementId ? activeSessionRef.current.currentText : undefined;
        const textInElement = currentEl.data?.text;
        
        const candidateText = textInDom !== undefined ? textInDom : (textInSession !== undefined ? textInSession : textInElement || '');
        const trimmed = (candidateText || '').trim();

        if (trimmed.length === 0) {
          onDeleteElement?.(selectedElementId);
          onSelectElement?.(null);
          commitEditing();
          onSelectSlide?.();
          return;
        }
      }

      // If clicking on background or outside element wrappers, deselect and switch toolbar to slide
      onSelectElement?.(null);
      commitEditing();
      onSelectSlide?.();
    };

    document.addEventListener('pointerdown', handleDocumentPointerDown);
    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
    };
  }, [selectedElementId, onDeleteElement, onSelectElement, commitEditing, onSelectSlide]);

  // Click canvas background to deselect and switch toolbar mode to slide
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target === containerRef.current ||
      target.id === `freeform-grid-canvas-${slideId}` ||
      target.id === `freeform-grid-workspace-${slideId}` ||
      target.id === 'freeform-canvas-stage' ||
      target.classList.contains('canvas-background') ||
      !target.closest('[id^="freeform-element-wrapper-"]')
    ) {
      handleDeselectAndCommit();
    }
  };

  return (
    <div
      id={`freeform-grid-workspace-${slideId}`}
      onClick={handleContainerClick}
      className="relative w-full flex flex-col items-center select-none"
    >
      {/* ================= حاوية الكانفاس الحرة (The Freeform Canvas Area) ================= */}
      <div
        ref={containerRef}
        id={`freeform-grid-canvas-${slideId}`}
        onClick={handleContainerClick}
        className={`relative w-full transition-all overflow-hidden ${
          isEditReady
            ? 'rounded-3xl border border-white/20 shadow-[0_15px_50px_rgba(0,0,0,0.5)]'
            : 'border-transparent rounded-none shadow-none'
        }`}
        style={{
          height: `${effectiveHeight}px`,
          minHeight: `${effectiveHeight}px`,
          backgroundColor: 'transparent',
          backgroundImage:
            showGridLines && isEditReady
              ? `radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`
              : undefined,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      >
        {/* ================= خطوط المحاذاة والبيانات الذكية (Smart Alignment Snapping Guides) ================= */}
        {activeGuides.map((guide) => {
          if (guide.type === 'x') {
            return (
              <div
                key={guide.id}
                className="absolute top-0 bottom-0 pointer-events-none z-50 flex flex-col items-center"
                style={{ left: `${guide.position}px` }}
              >
                <div className="w-[1.5px] h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                {guide.label && (
                  <span className="absolute top-2 -translate-x-1/2 bg-cyan-900/90 text-cyan-200 border border-cyan-400/50 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap">
                    {guide.label}
                  </span>
                )}
              </div>
            );
          } else {
            return (
              <div
                key={guide.id}
                className="absolute left-0 right-0 pointer-events-none z-50 flex items-center justify-center"
                style={{ top: `${guide.position}px` }}
              >
                <div className="w-full h-[1.5px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                {guide.label && (
                  <span className="absolute left-3 -translate-y-1/2 bg-cyan-900/90 text-cyan-200 border border-cyan-400/50 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap">
                    {guide.label}
                  </span>
                )}
              </div>
            );
          }
        })}

        {/* ================= ريندر العناصر مع Absolute Positioning ================= */}
        {elements.map((element, index) => {
          const isText = element.type.startsWith('text_');
          const isSelected = selectedElementId === element.id;
          const isDraggingThis = dragState?.elementId === element.id;
          const isResizingThis = resizeState?.elementId === element.id;
          const isRotatingThis = rotateState?.elementId === element.id;
          const isHovered = hoveredElementId === element.id;

          const pos = getElementPosition(element, index);

          // Calculate live position, size and rotation based on active operations
          const currentPosX = isDraggingThis
            ? dragState.currentX
            : isResizingThis
            ? resizeState.currentX
            : pos.x;

          const currentPosY = isDraggingThis
            ? dragState.currentY
            : isResizingThis
            ? resizeState.currentY
            : pos.y;

          const isButton = element.type === 'button';
          const currentWidth = isResizingThis ? resizeState.currentWidth : pos.width;
          const currentHeight = isResizingThis ? resizeState.currentHeight : pos.height;
          const currentRotation = isRotatingThis ? rotateState.currentRotation : pos.rotation || 0;

          // ضمان عدم خروج العنصر عن الحد الأيمن للحاوية على الشاشات الأصغر حجماً (مثل لابتوب 10 Zoll)
          const elemW = typeof currentWidth === 'number' ? currentWidth : 260;
          const maxAllowedX = Math.max(10, measuredContainerWidth - elemW - 16);
          const safePosX = Math.max(10, Math.min(currentPosX, maxAllowedX));

          // Calculate live font size during active resize for text elements
          const activeLiveFont = (isResizingThis && (resizeState?.currentFontSize || resizeRef.current?.currentFontSize)) || undefined;
          const liveFontSize = activeLiveFont ? `${activeLiveFont}px` : undefined;

          const sessionStyle = activeSessionRef.current?.elementId === element.id ? activeSessionRef.current.currentStyle : undefined;
          const isSessionAnimNone = sessionStyle && (!sessionStyle.animation || sessionStyle.animation.type === 'none');
          const isSessionAnimActive = sessionStyle?.animation && sessionStyle.animation.type !== 'none';

          const liveFormatting: any = {
            ...(element.formattingStyle || {}),
            ...(liveFontSize ? { fontSize: liveFontSize } : {}),
            ...(sessionStyle || {}),
          };
          if (isSessionAnimNone) {
            delete liveFormatting.animation;
          }

          const liveDataStyle: any = {
            ...(element.data?.style || {}),
            ...(liveFontSize ? { fontSize: liveFontSize } : {}),
            ...(sessionStyle || {}),
          };
          if (isSessionAnimNone) {
            delete liveDataStyle.animation;
          }

          const liveElement: ModularElement = {
            ...element,
            width: typeof currentWidth === 'number' ? Math.round(currentWidth) : currentWidth,
            height: isText ? 'auto' : (typeof currentHeight === 'number' ? Math.round(currentHeight) : (isButton ? 48 : currentHeight)),
            position: {
              ...(element.position || {}),
              x: Math.round(currentPosX),
              y: Math.round(currentPosY),
              width: typeof currentWidth === 'number' ? Math.round(currentWidth) : currentWidth,
              height: isText ? 'auto' : (typeof currentHeight === 'number' ? Math.round(currentHeight) : (isButton ? 48 : currentHeight)),
            },
            data: {
              ...element.data,
              style: liveDataStyle,
            },
            formattingStyle: liveFormatting,
          };

          if (isSessionAnimNone) {
            delete (liveElement as any).animation;
          } else if (isSessionAnimActive) {
            liveElement.animation = sessionStyle.animation;
          }

          return (
            <div
              key={element.id}
              id={`freeform-element-wrapper-${element.id}`}
              onPointerDown={(e) => handlePointerDown(e, element, index)}
              onMouseEnter={() => setHoveredElementId(element.id)}
              onMouseLeave={() => setHoveredElementId((prev) => (prev === element.id ? null : prev))}
              className={`absolute select-none ${
                isEditReady ? 'group/freeform' : ''
              } ${isDraggingThis ? 'opacity-90 scale-[1.01] shadow-2xl z-50 ring-2 ring-cyan-400' : ''}`}
              style={{
                left: `${safePosX}px`,
                top: `${currentPosY}px`,
                width: typeof currentWidth === 'number' ? `${currentWidth}px` : (currentWidth || (isButton ? '180px' : 'auto')),
                height: isText ? 'auto' : (typeof currentHeight === 'number' ? `${currentHeight}px` : (currentHeight || (isButton ? '48px' : 'auto'))),
                minWidth: isText ? '60px' : (isButton ? '60px' : undefined),
                minHeight: isText ? '32px' : (isButton ? '36px' : undefined),
                maxWidth: `${Math.max(120, measuredContainerWidth - 24)}px`,
                transform: `rotate(${currentRotation}deg)`,
                zIndex: isDraggingThis || isResizingThis || isRotatingThis ? 9999 : pos.zIndex || 10 + index,
                touchAction: 'none',
              }}
            >
              {/* Canva-style Bounding Frame (إطار التحديد المحيط بالعنصر مثل Canva) */}
              {isEditReady && (
                <div
                  onPointerDown={(e) => {
                    // Clicking the bounding frame initiates drag-to-move only when not locked
                    if (e.target === e.currentTarget && isSelected && !element.isLocked) {
                      handlePointerDown(e, element, index);
                    }
                  }}
                  className={`absolute -inset-1.5 rounded-xl transition-all ${
                    isSelected
                      ? element.isLocked
                        ? 'border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-default pointer-events-auto'
                        : 'border-2 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] cursor-move pointer-events-auto'
                      : isHovered
                      ? element.isLocked
                        ? 'border border-amber-400/70 border-dashed pointer-events-none'
                        : 'border border-blue-400/60 border-dashed pointer-events-none'
                      : 'border border-transparent pointer-events-none'
                  }`}
                >
                  {/* شارة إحداثيات العنصر أو حجم الخط الحي أثناء التكبير أو القفل - أسفل العنصر لمنع تغطية الأيقونات العلوية */}
                  {isResizingThis && (resizeState?.currentFontSize || resizeRef.current?.currentFontSize) ? (
                    <div
                      id={`resize-live-badge-${element.id}`}
                      className="absolute -bottom-8 right-0 z-40 flex items-center gap-1.5 bg-[#08152e] border border-amber-400 rounded-lg px-2 py-0.5 shadow-lg text-[10px] text-amber-200 font-mono whitespace-nowrap pointer-events-none"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                      <span>حجم الخط: {resizeState?.currentFontSize || resizeRef.current?.currentFontSize}px</span>
                      <span className="text-white/30">|</span>
                      <span>العرض: {Math.round((currentWidth as number) || (resizeRef.current?.currentWidth as number) || 100)}px</span>
                    </div>
                  ) : (isSelected || isHovered) && (
                    <div className={`absolute -bottom-8 right-0 z-40 flex items-center gap-1.5 bg-[#08152e] border rounded-lg px-2 py-0.5 shadow-lg text-[10px] font-mono whitespace-nowrap pointer-events-none ${
                      element.isLocked ? 'border-amber-400/80 text-amber-300' : 'border-blue-400/60 text-blue-200'
                    }`}>
                      {element.isLocked ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span className="font-bold">عنصر مقفل</span>
                        </>
                      ) : (
                        <>
                          <Move className="w-3 h-3 text-emerald-400 animate-pulse" />
                          <span>X: {Math.round(currentPosX)}</span>
                          <span className="text-white/30">|</span>
                          <span>Y: {Math.round(currentPosY)}</span>
                          {currentRotation !== 0 && (
                            <>
                              <span className="text-white/30">|</span>
                              <span className="text-amber-300">↺ {Math.round(currentRotation)}°</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* زر التحريك المخصص (Canva Move Handle) - لتحريك العنصر بسلاسة تامة (يختفي عند القفل) */}
                  {isSelected && !element.isLocked && (
                    <button
                      type="button"
                      data-action="move-handle"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        handlePointerDown(e, element, index);
                      }}
                      className="absolute -bottom-8 left-0 z-40 flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white border border-white/40 rounded-lg px-2 py-0.5 shadow-lg text-[10px] font-medium cursor-move pointer-events-auto active:scale-95 transition-transform"
                      title="اسحب من هنا لتحريك العنصر في أي مكان"
                    >
                      <Move className="w-3 h-3 text-white" />
                      <span>تحريك</span>
                    </button>
                  )}

                  {/* أدوات سريعة علوية معلقة عند التحديد (قفل، تكرار، حذف) */}
                  {isSelected && (
                    <div className="absolute -top-7 left-0 pointer-events-auto flex items-center gap-1 bg-[#08152e] border border-white/20 rounded-lg p-0.5 shadow-lg z-50">
                      {/* زر قفل / فك قفل العنصر */}
                      <button
                        type="button"
                        data-action="toggle-lock"
                        onClick={(e) => {
                          e.stopPropagation();
                          const isCurrentlyLocked = !!element.isLocked;
                          onUpdateElement?.({
                            ...element,
                            isLocked: !isCurrentlyLocked,
                          });
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          element.isLocked
                            ? 'text-amber-400 hover:text-amber-300 bg-amber-500/25'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                        title={element.isLocked ? 'العنصر مقفل (انقر لإلغاء القفل)' : 'قفل العنصر (منع التحريك والتعديل)'}
                      >
                        {element.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>

                      {onAddElement && !element.type.startsWith('gallery') && (
                        <button
                          type="button"
                          data-action="duplicate"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateElement(element);
                          }}
                          className="p-1 rounded text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
                          title="تكرار هذا العنصر (Copy)"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                      {onDeleteElement && (
                        <button
                          type="button"
                          data-action="delete"
                          disabled={element.isLocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (element.isLocked) return;
                            commitEditing();
                            onDeleteElement(element.id);
                          }}
                          className={`p-1 rounded cursor-pointer ${
                            element.isLocked
                              ? 'text-gray-500 opacity-40 cursor-not-allowed'
                              : 'text-rose-400 hover:text-rose-200 hover:bg-rose-500/20'
                          }`}
                          title={element.isLocked ? 'العنصر مقفل - قم بإلغاء القفل أولاً للحذف' : 'حذف هذا العنصر'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* مقابض التكبير والتصغير الأربعة + الجانبين + مقبض التدوير (تختفي جميعاً عند قفل العنصر) */}
                  {isSelected && !element.isLocked && (
                    <>
                      {/* مقبض الزاوية العلوية اليمنى NE */}
                      <div
                        data-resize-corner="ne"
                        onPointerDown={(e) => handleResizePointerDown(e, element, 'ne', index)}
                        className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-nesw-resize pointer-events-auto hover:scale-125 transition-transform z-50 after:content-[''] after:absolute after:-inset-2"
                        title={isText ? "اسحب من الزاوية لتكبير وتصغير حجم الخط والنص بحرية" : "تكبير أو تصغير بالسحب"}
                      />
                      {/* مقبض الزاوية العلوية اليسرى NW */}
                      <div
                        data-resize-corner="nw"
                        onPointerDown={(e) => handleResizePointerDown(e, element, 'nw', index)}
                        className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform z-50 after:content-[''] after:absolute after:-inset-2"
                        title={isText ? "اسحب من الزاوية لتكبير وتصغير حجم الخط والنص بحرية" : "تكبير أو تصغير بالسحب"}
                      />
                      {/* مقبض الزاوية السفلية اليمنى SE */}
                      <div
                        data-resize-corner="se"
                        onPointerDown={(e) => handleResizePointerDown(e, element, 'se', index)}
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform z-50 after:content-[''] after:absolute after:-inset-2"
                        title={isText ? "اسحب من الزاوية لتكبير وتصغير حجم الخط والنص بحرية" : "تكبير أو تصغير بالسحب"}
                      />
                      {/* مقبض الزاوية السفلية اليسرى SW */}
                      <div
                        data-resize-corner="sw"
                        onPointerDown={(e) => handleResizePointerDown(e, element, 'sw', index)}
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-nesw-resize pointer-events-auto hover:scale-125 transition-transform z-50 after:content-[''] after:absolute after:-inset-2"
                        title={isText ? "اسحب من الزاوية لتكبير وتصغير حجم الخط والنص بحرية" : "تكبير أو تصغير بالسحب"}
                      />

                      {/* مقبض الجانب الأيمن E (Canva Side Pill Handle) - لتوسيع وتضييق العرض أفقياً */}
                      <div
                        data-resize-corner="e"
                        onPointerDown={(e) => handleResizePointerDown(e, element, 'e', index)}
                        className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-2.5 h-7 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-ew-resize pointer-events-auto hover:scale-125 transition-transform z-50"
                        title="سحب لتوسيع العرض وجعل النص على سطر واحد مثلاً"
                      />
                      {/* مقبض الجانب الأيسر W (Canva Side Pill Handle) - لتوسيع وتضييق العرض أفقياً */}
                      <div
                        data-resize-corner="w"
                        onPointerDown={(e) => handleResizePointerDown(e, element, 'w', index)}
                        className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-2.5 h-7 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-ew-resize pointer-events-auto hover:scale-125 transition-transform z-50"
                        title="سحب لتوسيع العرض وجعل النص على سطر واحد مثلاً"
                      />

                      {/* مقبض الجانب السفلي S (Canva Bottom Pill Handle) - لتوسيع وتمديد الارتفاع طولياً لأسفل */}
                      {!isText && (
                        <div
                          data-resize-corner="s"
                          onPointerDown={(e) => handleResizePointerDown(e, element, 's', index)}
                          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-ns-resize pointer-events-auto hover:scale-125 transition-transform z-50"
                          title="سحب لتوسيع الارتفاع طولياً لأسفل وتكبير المحتوى"
                        />
                      )}
                      {/* مقبض الجانب العلوي N (Canva Top Pill Handle) - لتوسيع وتمديد الارتفاع طولياً لأعلى */}
                      {!isText && (
                        <div
                          data-resize-corner="n"
                          onPointerDown={(e) => handleResizePointerDown(e, element, 'n', index)}
                          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-white border-2 border-blue-600 rounded-full shadow-md cursor-ns-resize pointer-events-auto hover:scale-125 transition-transform z-50"
                          title="سحب لتوسيع الارتفاع طولياً لأعلى وتكبير المحتوى"
                        />
                      )}

                      {/* مقبض التدوير الجانبي (Side Rotation Handle) - على يسار العنصر لمنع حجب الأيقونات العلوية في العناصر الصغيرة */}
                      <div className="absolute top-1/2 -left-9 -translate-y-1/2 flex items-center pointer-events-auto z-50">
                        <button
                          type="button"
                          data-rotate-handle="true"
                          onPointerDown={(e) => handleRotatePointerDown(e, element, index)}
                          className="w-6 h-6 rounded-full bg-blue-600 border border-white/80 text-white flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform shadow-lg"
                          title="تدوير العنصر بالسحب"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                        <div className="w-2.5 h-0.5 bg-blue-500/80" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ريندر محتوى العنصر بحجمه الطبيعي */}
              <div
                data-element-content="true"
                className={`relative w-full h-full pointer-events-auto ${isText ? 'cursor-text select-text' : ''}`}
                onPointerDown={(e) => {
                  if (isText && isEditReady && !element.isLocked) {
                    // تجميد التحريك وتجميد السحب للتكبير والتصغير فوراً عند النقر على النص
                    e.stopPropagation();
                    pointerDownInfoRef.current = null;
                    setDragState(null);
                    setResizeState(null);
                    resizeRef.current = null;

                    if (onSelectElement) onSelectElement(element.id);
                    handleStartTextEdit(element);
                  }
                }}
              >
                {renderElementContent(liveElement, isSelected)}
              </div>
            </div>
          );
        })}
        {/* ================= مقبض تمديد الشريحة طولياً لأسفل (Bottom Slide Height Extender Handle) ================= */}
        {isEditReady && (
          <div
            id={`slide-height-resize-handle-${slideId}`}
            onPointerDown={handleSlideResizePointerDown}
            className={`absolute bottom-0 left-0 right-0 h-9 z-40 flex items-center justify-center cursor-ns-resize group select-none transition-colors ${
              isResizingSlideHeight ? 'bg-cyan-500/20' : 'hover:bg-cyan-500/10'
            }`}
            style={{ touchAction: 'none' }}
            title="اسحب لأسفل لتمديد طول الشريحة"
          >
            {/* خط إرشاد التمدد السفلي */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all ${
                isResizingSlideHeight
                  ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]'
                  : 'bg-white/10 group-hover:bg-cyan-400/80 group-hover:shadow-[0_0_8px_#22d3ee]'
              }`}
            />

            {/* كبسولة المقبض التفاعلية */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shadow-lg backdrop-blur-md transition-all transform ${
                isResizingSlideHeight
                  ? 'scale-110 bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-cyan-500/30'
                  : 'bg-slate-900/80 border-white/20 text-slate-300 group-hover:border-cyan-400/60 group-hover:text-cyan-200 group-hover:scale-105'
              }`}
            >
              <MoveVertical className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wide">
                {isResizingSlideHeight ? `${effectiveHeight}px` : 'تمديد الشريحة'}
              </span>
              <ChevronDown className="w-3 h-3 text-cyan-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
