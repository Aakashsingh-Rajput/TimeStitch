
import { useEffect } from 'react';

interface KeyboardShortcuts {
  onAddMemory: () => void;
  onAddProject: () => void;
  onSearch: () => void;
  onToggleFavorites: () => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onExport: () => void;
  onSync: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { ctrlKey, metaKey, shiftKey, key } = event;
      const isModifierPressed = ctrlKey || metaKey;

      if (isModifierPressed && key === 'n' && !shiftKey) {
        event.preventDefault();
        shortcuts.onAddMemory();
      } else if (isModifierPressed && key === 'n' && shiftKey) {
        event.preventDefault();
        shortcuts.onAddProject();
      } else if (isModifierPressed && key === 'k') {
        event.preventDefault();
        shortcuts.onSearch();
      } else if (isModifierPressed && key === 'f') {
        event.preventDefault();
        shortcuts.onToggleFavorites();
      } else if (isModifierPressed && key === 'a') {
        event.preventDefault();
        shortcuts.onSelectAll();
      } else if (key === 'Delete' || key === 'Backspace') {
        if (isModifierPressed) {
          event.preventDefault();
          shortcuts.onDeleteSelected();
        }
      } else if (isModifierPressed && key === 'e') {
        event.preventDefault();
        shortcuts.onExport();
      } else if (isModifierPressed && key === 's') {
        event.preventDefault();
        shortcuts.onSync();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
