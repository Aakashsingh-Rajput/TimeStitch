import { useState, useMemo, useCallback, useEffect } from 'react';
import { generateAutoTags } from '@/utils/autoTagging';
import { DataService } from '@/lib/dataService';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  name: string;
  description: string;
  memoryCount: number;
  imageCount?: number;
  createdDate: string;
  color: string;
  collaborators?: string[];
  isPublic?: boolean;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  images: string[];
  isFavorite: boolean;
  tags: string[];
  projectId?: string;
  location?: string;
  createdBy?: string;
  sharedWith?: string[];
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  memoryId: string;
  isFavorite: boolean;
}

const validateProject = (project: Partial<Project>): string[] => {
  const errors: string[] = [];
  if (!project.name?.trim()) errors.push('Project name is required');
  if (!project.description?.trim()) errors.push('Project description is required');
  if (!project.color) errors.push('Project color is required');
  if (project.name && project.name.length > 100) errors.push('Project name must be less than 100 characters');
  return errors;
};

const validateMemory = (memory: Partial<Memory>): string[] => {
  const errors: string[] = [];
  if (!memory.title?.trim()) errors.push('Memory title is required');
  if (!memory.description?.trim()) errors.push('Memory description is required');
  if (memory.title && memory.title.length > 200) errors.push('Memory title must be less than 200 characters');
  return errors;
};

const safeOperation = async <T>(operation: () => T | Promise<T>, context: string): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in ${context}:`, error);
    return { success: false, error: errorMessage };
  }
};

export const useTimeStitch = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const [projects, setProjects] = useState<Project[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        
        // Check if DataService is available
        if (typeof DataService?.initialize !== 'function') {
          console.warn('DataService not available, using mock data');
          setProjects([]);
          setMemories([]);
          setLoading(false);
          return;
        }

        await DataService.initialize();
        const [projectsData, memoriesData] = await Promise.all([
          DataService.getProjects(),
          DataService.getMemories()
        ]);
        setProjects(projectsData);
        setMemories(memoriesData);
      } catch (err) {
        console.error('Error initializing data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Set empty arrays as fallback
        setProjects([]);
        setMemories([]);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, [user]);

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }, [projects, searchQuery]);

  const filteredMemories = useMemo(() => {
    let filtered = memories;
    if (searchQuery) {
      filtered = filtered.filter(memory =>
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (memory.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }
    if (showFavorites) {
      filtered = filtered.filter(memory => memory.isFavorite);
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [memories, searchQuery, showFavorites]);

  const galleryImages = useMemo((): GalleryImage[] => {
    let images = memories.flatMap(memory =>
      memory.images.map((url, index) => ({
        id: `${memory.id}-${index}`,
        url,
        title: memory.title,
        memoryId: memory.id,
        isFavorite: memory.isFavorite
      }))
    );
    if (showFavorites) {
      images = images.filter(image => image.isFavorite);
    }
    return images;
  }, [memories, showFavorites]);

  // CRUD actions with fallback for when DataService is not available
  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'memoryCount' | 'imageCount' | 'createdDate'>) => {
    const result = await safeOperation(async () => {
      const validationErrors = validateProject(projectData);
      if (validationErrors.length > 0) throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      
      if (typeof DataService?.createProject !== 'function') {
        throw new Error('DataService not available');
      }
      
      const newProject = await DataService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    }, 'addProject');
    if (!result.success) throw new Error(result.error);
    return result.data;
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const result = await safeOperation(async () => {
      if (typeof DataService?.updateProject !== 'function') {
        throw new Error('DataService not available');
      }
      
      const updatedProject = await DataService.updateProject(id, updates);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    }, 'updateProject');
    if (!result.success) throw new Error(result.error);
    return result.data;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const result = await safeOperation(async () => {
      if (typeof DataService?.deleteProject !== 'function') {
        throw new Error('DataService not available');
      }
      
      await DataService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setMemories(prev => prev.filter(m => m.projectId !== id));
    }, 'deleteProject');
    if (!result.success) throw new Error(result.error);
  }, []);

  const addMemory = useCallback(async (memoryData: Omit<Memory, 'id'>, images: File[] = []) => {
    const result = await safeOperation(async () => {
      const validationErrors = validateMemory(memoryData);
      if (validationErrors.length > 0) throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      
      if (typeof DataService?.createMemory !== 'function') {
        throw new Error('DataService not available');
      }
      
      const autoTags = generateAutoTags(memoryData.title, memoryData.description);
      const combinedTags = [...new Set([...(memoryData.tags || []), ...autoTags])];
      const newMemory = await DataService.createMemory({ ...memoryData, tags: combinedTags }, images);
      setMemories(prev => [newMemory, ...prev]);
      if (newMemory.projectId) {
        setProjects(prev => prev.map(p => p.id === newMemory.projectId ? { ...p, memoryCount: p.memoryCount + 1 } : p));
      }
      return newMemory;
    }, 'addMemory');
    if (!result.success) throw new Error(result.error);
    return result.data;
  }, []);

  const updateMemory = useCallback(async (id: string, updates: Partial<Memory>, newImages: File[] = []) => {
    const result = await safeOperation(async () => {
      if (typeof DataService?.updateMemory !== 'function') {
        throw new Error('DataService not available');
      }
      
      const updatedMemory = await DataService.updateMemory(id, updates, newImages);
      setMemories(prev => prev.map(m => m.id === id ? updatedMemory : m));
      return updatedMemory;
    }, 'updateMemory');
    if (!result.success) throw new Error(result.error);
    return result.data;
  }, []);

  const deleteMemory = useCallback(async (id: string) => {
    const result = await safeOperation(async () => {
      if (typeof DataService?.deleteMemory !== 'function') {
        throw new Error('DataService not available');
      }
      
      await DataService.deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
      const deletedMemory = memories.find(m => m.id === id);
      if (deletedMemory?.projectId) {
        setProjects(prev => prev.map(p => p.id === deletedMemory.projectId ? { ...p, memoryCount: Math.max(0, p.memoryCount - 1) } : p));
      }
    }, 'deleteMemory');
    if (!result.success) throw new Error(result.error);
  }, [memories]);

  const toggleMemoryFavorite = useCallback(async (id: string) => {
    const result = await safeOperation(async () => {
      if (typeof DataService?.toggleMemoryFavorite !== 'function') {
        throw new Error('DataService not available');
      }
      
      await DataService.toggleMemoryFavorite(id);
      setMemories(prev => prev.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
    }, 'toggleMemoryFavorite');
    if (!result.success) throw new Error(result.error);
  }, []);

  const toggleImageFavorite = useCallback((imageId: string) => {
    const [memoryId] = imageId.split('-');
    toggleMemoryFavorite(memoryId);
  }, [toggleMemoryFavorite]);

  // Bulk and search actions can be added similarly

  return {
    activeTab,
    searchQuery,
    showFavorites,
    currentTheme,
    viewMode,
    projects: filteredProjects,
    memories: filteredMemories,
    galleryImages,
    loading,
    error,
    setActiveTab,
    setSearchQuery,
    setShowFavorites: () => setShowFavorites(!showFavorites),
    setCurrentTheme,
    setViewMode,
    addProject,
    updateProject,
    deleteProject,
    addMemory,
    updateMemory,
    deleteMemory,
    toggleMemoryFavorite,
    toggleImageFavorite,
  };
}; 