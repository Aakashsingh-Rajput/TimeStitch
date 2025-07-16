
import { useState, useCallback } from 'react';

interface DragAndDropOptions {
  onFileDrop: (files: FileList) => void;
  onMemoryDrop?: (memoryId: string, targetId: string) => void;
  acceptedTypes?: string[];
}

export const useDragAndDrop = ({ onFileDrop, onMemoryDrop, acceptedTypes = ['image/*'] }: DragAndDropOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    const memoryId = e.dataTransfer.getData('text/memory-id');

    if (files.length > 0) {
      // Validate file types
      const validFiles = Array.from(files).filter(file => 
        acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -1));
          }
          return file.type === type;
        })
      );
      
      if (validFiles.length > 0) {
        const fileList = new DataTransfer();
        validFiles.forEach(file => fileList.items.add(file));
        onFileDrop(fileList.files);
      }
    } else if (memoryId && onMemoryDrop) {
      const targetId = e.currentTarget.getAttribute('data-drop-target');
      if (targetId) {
        onMemoryDrop(memoryId, targetId);
      }
    }
  }, [onFileDrop, onMemoryDrop, acceptedTypes]);

  const handleMemoryDragStart = useCallback((e: React.DragEvent, memoryId: string) => {
    e.dataTransfer.setData('text/memory-id', memoryId);
    setDraggedItem(memoryId);
  }, []);

  const handleMemoryDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  return {
    isDragging,
    draggedItem,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
    memoryDragProps: {
      onDragStart: handleMemoryDragStart,
      onDragEnd: handleMemoryDragEnd,
    },
  };
};
