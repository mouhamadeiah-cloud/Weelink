import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { TextFormattingStyle, WebPage } from '../types';

export type LayerActionType = 'bringToFront' | 'bringForward' | 'sendBackward' | 'sendToBack';

export interface ActiveTextEditSession {
  elementId: string;
  slideId: string;
  initialText: string;
  currentText: string;
  initialStyle: TextFormattingStyle;
  currentStyle: TextFormattingStyle;
  history: Array<{ text: string; style: TextFormattingStyle }>;
  historyIndex: number;
  label?: string;
  onSaveCallback: (newText: string, newStyle: TextFormattingStyle) => void;
  onCancelCallback?: () => void;
  onDuplicateCallback?: () => void;
  onDeleteCallback?: () => void;
  onLayerAction?: (action: LayerActionType) => void;
}

interface TextEditContextType {
  activeSession: ActiveTextEditSession | null;
  startEditing: (params: {
    elementId: string;
    slideId: string;
    initialText: string;
    initialStyle?: TextFormattingStyle;
    label?: string;
    onSave: (newText: string, newStyle: TextFormattingStyle) => void;
    onCancel?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onLayerAction?: (action: LayerActionType) => void;
  }) => void;
  updateCurrentText: (text: string) => void;
  updateCurrentStyle: (styleUpdater: (prev: TextFormattingStyle) => TextFormattingStyle) => void;
  commitEditing: () => void;
  cancelEditing: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  duplicateCurrent: () => void;
  deleteCurrent: () => void;
  performLayerAction: (action: LayerActionType) => void;
}

const TextEditContext = createContext<TextEditContextType | null>(null);

export const TextEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<ActiveTextEditSession | null>(null);
  const activeSessionRef = useRef<ActiveTextEditSession | null>(null);
  activeSessionRef.current = activeSession;

  const startEditing = useCallback(
    ({
      elementId,
      slideId,
      initialText,
      initialStyle = {},
      label,
      onSave,
      onCancel,
      onDuplicate,
      onDelete,
      onLayerAction,
    }: {
      elementId: string;
      slideId: string;
      initialText: string;
      initialStyle?: TextFormattingStyle;
      label?: string;
      onSave: (newText: string, newStyle: TextFormattingStyle) => void;
      onCancel?: () => void;
      onDuplicate?: () => void;
      onDelete?: () => void;
      onLayerAction?: (action: LayerActionType) => void;
    }) => {
      const initialSnapshot = {
        text: initialText,
        style: JSON.parse(JSON.stringify(initialStyle)),
      };

      const session: ActiveTextEditSession = {
        elementId,
        slideId,
        initialText,
        currentText: initialText,
        initialStyle: JSON.parse(JSON.stringify(initialStyle)),
        currentStyle: JSON.parse(JSON.stringify(initialStyle)),
        history: [initialSnapshot],
        historyIndex: 0,
        label,
        onSaveCallback: onSave,
        onCancelCallback: onCancel,
        onDuplicateCallback: onDuplicate,
        onDeleteCallback: onDelete,
        onLayerAction,
      };

      activeSessionRef.current = session;
      setActiveSession(session);
    },
    []
  );

  const updateCurrentText = useCallback((text: string) => {
    let pendingSave: {
      callback: (t: string, s: TextFormattingStyle) => void;
      text: string;
      style: TextFormattingStyle;
    } | null = null;

    setActiveSession((prev) => {
      if (!prev) return null;
      if (prev.currentText === text) return prev;

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({
        text,
        style: JSON.parse(JSON.stringify(prev.currentStyle)),
      });

      if (prev.onSaveCallback) {
        pendingSave = {
          callback: prev.onSaveCallback,
          text,
          style: prev.currentStyle,
        };
      }

      const updated = {
        ...prev,
        currentText: text,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
      activeSessionRef.current = updated;
      return updated;
    });

    if (pendingSave) {
      const { callback, text: saveText, style: saveStyle } = pendingSave;
      queueMicrotask(() => {
        try {
          callback(saveText, saveStyle);
        } catch (e) {
          console.error('Error in onSaveCallback during text update:', e);
        }
      });
    }
  }, []);

  const updateCurrentStyle = useCallback(
    (styleUpdater: (prev: TextFormattingStyle) => TextFormattingStyle) => {
      let pendingSave: {
        callback: (text: string, style: TextFormattingStyle) => void;
        text: string;
        style: TextFormattingStyle;
      } | null = null;

      setActiveSession((prev) => {
        if (!prev) return null;
        const nextStyle = styleUpdater(prev.currentStyle);

        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push({
          text: prev.currentText,
          style: JSON.parse(JSON.stringify(nextStyle)),
        });

        if (prev.onSaveCallback) {
          pendingSave = {
            callback: prev.onSaveCallback,
            text: prev.currentText,
            style: nextStyle,
          };
        }

        const updated = {
          ...prev,
          currentStyle: nextStyle,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
        activeSessionRef.current = updated;
        return updated;
      });

      // Safely invoke onSaveCallback outside React state updater phase to prevent set-state-in-render errors
      if (pendingSave) {
        const { callback, text, style } = pendingSave;
        queueMicrotask(() => {
          try {
            callback(text, style);
          } catch (e) {
            console.error('Error in onSaveCallback during style update:', e);
          }
        });
      }
    },
    []
  );

  const undo = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev || prev.historyIndex <= 0) return prev;
      const nextIndex = prev.historyIndex - 1;
      const snapshot = prev.history[nextIndex];
      const updated = {
        ...prev,
        currentText: snapshot.text,
        currentStyle: JSON.parse(JSON.stringify(snapshot.style)),
        historyIndex: nextIndex,
      };
      activeSessionRef.current = updated;
      return updated;
    });
  }, []);

  const redo = useCallback(() => {
    setActiveSession((prev) => {
      if (!prev || prev.historyIndex >= prev.history.length - 1) return prev;
      const nextIndex = prev.historyIndex + 1;
      const snapshot = prev.history[nextIndex];
      const updated = {
        ...prev,
        currentText: snapshot.text,
        currentStyle: JSON.parse(JSON.stringify(snapshot.style)),
        historyIndex: nextIndex,
      };
      activeSessionRef.current = updated;
      return updated;
    });
  }, []);

  const commitEditing = useCallback(() => {
    const session = activeSessionRef.current;
    if (!session) return;
    setActiveSession(null);
    activeSessionRef.current = null;

    const trimmed = (session.currentText || '').trim();
    // If text has no letters (empty or whitespace), delete the element completely!
    if (trimmed.length === 0) {
      if (session.onDeleteCallback) {
        const delCb = session.onDeleteCallback;
        queueMicrotask(() => {
          try {
            delCb();
          } catch (e) {
            console.error('Error in onDeleteCallback during commitEditing:', e);
          }
        });
      }
      return;
    }

    // Otherwise, save the element in its latest state with its box!
    if (session.onSaveCallback) {
      const { onSaveCallback, currentText, currentStyle } = session;
      queueMicrotask(() => {
        try {
          onSaveCallback(currentText, currentStyle);
        } catch (e) {
          console.error('Error in onSaveCallback during commitEditing:', e);
        }
      });
    }
  }, []);

  const cancelEditing = useCallback(() => {
    const session = activeSessionRef.current;
    if (!session) return;
    setActiveSession(null);
    activeSessionRef.current = null;
    if (session.onCancelCallback) {
      const cb = session.onCancelCallback;
      queueMicrotask(() => {
        try {
          cb();
        } catch (e) {
          console.error('Error in onCancelCallback:', e);
        }
      });
    }
  }, []);

  const duplicateCurrent = useCallback(() => {
    const session = activeSessionRef.current;
    if (!session) return;
    setActiveSession(null);
    activeSessionRef.current = null;
    if (session.onDuplicateCallback) {
      const cb = session.onDuplicateCallback;
      queueMicrotask(() => {
        try {
          cb();
        } catch (e) {
          console.error('Error in onDuplicateCallback:', e);
        }
      });
    }
  }, []);

  const deleteCurrent = useCallback(() => {
    const session = activeSessionRef.current;
    if (!session) return;
    setActiveSession(null);
    activeSessionRef.current = null;
    if (session.onDeleteCallback) {
      const cb = session.onDeleteCallback;
      queueMicrotask(() => {
        try {
          cb();
        } catch (e) {
          console.error('Error in onDeleteCallback:', e);
        }
      });
    }
  }, []);

  const performLayerAction = useCallback((action: LayerActionType) => {
    const cb = activeSessionRef.current?.onLayerAction;
    if (cb) {
      cb(action);
    }
  }, []);

  const canUndo = Boolean(activeSession && activeSession.historyIndex > 0);
  const canRedo = Boolean(
    activeSession && activeSession.historyIndex < activeSession.history.length - 1
  );

  return (
    <TextEditContext.Provider
      value={{
        activeSession,
        startEditing,
        updateCurrentText,
        updateCurrentStyle,
        commitEditing,
        cancelEditing,
        undo,
        redo,
        canUndo,
        canRedo,
        duplicateCurrent,
        deleteCurrent,
        performLayerAction,
      }}
    >
      {children}
    </TextEditContext.Provider>
  );
};

const DEFAULT_TEXT_EDIT_CONTEXT: TextEditContextType = {
  activeSession: null,
  startEditing: () => {},
  updateCurrentText: () => {},
  updateCurrentStyle: () => {},
  commitEditing: () => {},
  cancelEditing: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
  duplicateCurrent: () => {},
  deleteCurrent: () => {},
  performLayerAction: () => {},
};

export const useTextEdit = () => {
  const context = useContext(TextEditContext);
  return context || DEFAULT_TEXT_EDIT_CONTEXT;
};
