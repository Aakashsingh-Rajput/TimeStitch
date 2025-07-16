
import { useState, useCallback } from 'react';

export const useBulkOperations = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedItems(new Set(ids));
    setIsSelectionMode(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedItems.has(id);
  }, [selectedItems]);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) {
      clearSelection();
    }
  }, [isSelectionMode, clearSelection]);

  const bulkDelete = useCallback((deleteFunction: (id: string) => void) => {
    selectedItems.forEach(id => deleteFunction(id));
    clearSelection();
  }, [selectedItems, clearSelection]);

  const bulkToggleFavorite = useCallback((toggleFunction: (id: string) => void) => {
    selectedItems.forEach(id => toggleFunction(id));
    clearSelection();
  }, [selectedItems, clearSelection]);

  const bulkMoveToProject = useCallback((projectId: string, moveFunction: (id: string, projectId: string) => void) => {
    selectedItems.forEach(id => moveFunction(id, projectId));
    clearSelection();
  }, [selectedItems, clearSelection]);

  return {
    selectedItems: Array.from(selectedItems),
    selectedCount: selectedItems.size,
    isSelectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    toggleSelectionMode,
    bulkDelete,
    bulkToggleFavorite,
    bulkMoveToProject,
  };
};
