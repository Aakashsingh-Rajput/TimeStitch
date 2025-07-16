
import { useState, useMemo, useCallback } from 'react';
import { generateAutoTags } from '@/utils/autoTagging';
import { cloudSync } from '@/utils/cloudSync';

// Validation utilities
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
  if (!memory.images || memory.images.length === 0) errors.push('At least one image is required');
  return errors;
};

// Safe operations utility
const safeOperation = async <T>(
  operation: () => T | Promise<T>,
  context: string
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in ${context}:`, error);
    return { success: false, error: errorMessage };
  }
};

export interface Project {
  id: string;
  name: string;
  description: string;
  memoryCount: number;
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

export const useTimeStitch = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  // Enhanced sample data with more realistic content
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of our company website with modern design principles and improved user experience',
      memoryCount: 8,
      createdDate: 'Jan 15, 2024',
      color: 'blue',
      collaborators: ['user1', 'user2'],
      isPublic: false
    },
    {
      id: '2',
      name: 'Mobile App Launch',
      description: 'Development and launch of our new mobile application for iOS and Android platforms',
      memoryCount: 12,
      createdDate: 'Feb 1, 2024',
      color: 'purple',
      collaborators: ['user1'],
      isPublic: true
    },
    {
      id: '3',
      name: 'Team Building Retreat',
      description: 'Annual team building activities and strategic planning sessions in the mountains',
      memoryCount: 25,
      createdDate: 'Mar 10, 2024',
      color: 'green',
      collaborators: [],
      isPublic: false
    },
    {
      id: '4',
      name: 'Product Launch',
      description: 'Major product launch event with press coverage and customer demonstrations',
      memoryCount: 15,
      createdDate: 'Apr 5, 2024',
      color: 'orange',
      collaborators: ['user2', 'user3'],
      isPublic: true
    }
  ]);

  const [memories, setMemories] = useState<Memory[]>([
    {
      id: '1',
      title: 'Design System Creation',
      description: 'We spent weeks creating a comprehensive design system that would serve as the foundation for our entire project. This was a crucial milestone that involved extensive research, prototyping, and team collaboration.',
      date: 'January 20, 2024',
      images: ['/lovable-uploads/photo-1581091226825-a6a2a5aee158'],
      isFavorite: true,
      tags: ['design', 'system', 'milestone'],
      projectId: '1',
      location: 'New York Office',
      createdBy: 'user1'
    },
    {
      id: '2',
      title: 'First MVP Demo',
      description: 'Our first working prototype demo to stakeholders. The excitement in the room was palpable as we showcased months of hard work coming together.',
      date: 'February 15, 2024',
      images: ['/lovable-uploads/photo-1488590528505-98d2b5aba04b'],
      isFavorite: true,
      tags: ['mvp', 'demo', 'prototype'],
      projectId: '2',
      location: 'Conference Room A',
      createdBy: 'user2'
    },
    {
      id: '3',
      title: 'Late Night Breakthrough',
      description: 'Sometimes the best ideas come at the most unexpected times. This late-night coding session led to a major breakthrough in our architecture.',
      date: 'March 2, 2024',
      images: ['/lovable-uploads/photo-1487058792275-0ad4aaf24ca7'],
      isFavorite: false,
      tags: ['coding', 'breakthrough', 'architecture'],
      projectId: '2',
      location: 'Home Office',
      createdBy: 'user1'
    },
    {
      id: '4',
      title: 'Team Hiking Adventure',
      description: 'Nothing builds team spirit like conquering a mountain together. This hiking trip strengthened our bonds and gave us fresh perspectives.',
      date: 'March 15, 2024',
      images: ['/lovable-uploads/photo-1500673922987-e212871fec22'],
      isFavorite: true,
      tags: ['team', 'hiking', 'adventure'],
      projectId: '3',
      location: 'Blue Ridge Mountains',
      createdBy: 'user3'
    }
  ]);

  // Enhanced computed values with better filtering
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
        memory.location?.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Enhanced actions with auto-tagging and cloud sync
  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'memoryCount'>) => {
    const result = await safeOperation(async () => {
      // Validate input
      const validationErrors = validateProject(projectData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const newProject: Project = {
        ...projectData,
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        memoryCount: 0,
        createdDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        collaborators: projectData.collaborators || [],
        isPublic: projectData.isPublic || false
      };

      setProjects(prev => {
        // Check for duplicate names
        const existingProject = prev.find(p => 
          p.name.toLowerCase() === newProject.name.toLowerCase()
        );
        if (existingProject) {
          throw new Error('A project with this name already exists');
        }
        return [newProject, ...prev];
      });
      
      // Add to cloud sync queue
      cloudSync.addPendingChange({
        type: 'create',
        entity: 'project',
        data: newProject
      });
      
      return newProject;
    }, 'addProject');

    if (!result.success) {
      console.error('Failed to add project:', result.error);
      // You could show a toast notification here
    }
  }, []);

  const updateProject = useCallback((id: string, projectData: Partial<Project>) => {
    try {
      setProjects(prev => prev.map(p => 
        p.id === id ? { ...p, ...projectData } : p
      ));
      
      cloudSync.addPendingChange({
        type: 'update',
        entity: 'project',
        id,
        data: projectData
      });
      
      console.log('Project updated successfully:', id);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  }, []);

  const deleteProject = useCallback((id: string) => {
    try {
      setProjects(prev => prev.filter(p => p.id !== id));
      setMemories(prev => prev.filter(m => m.projectId !== id));
      
      cloudSync.addPendingChange({
        type: 'delete',
        entity: 'project',
        id
      });
      
      console.log('Project deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }, []);

  const addMemory = useCallback(async (memoryData: Omit<Memory, 'id'>) => {
    const result = await safeOperation(async () => {
      // Validate input
      const validationErrors = validateMemory(memoryData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Generate auto-tags
      const autoTags = generateAutoTags(memoryData.title, memoryData.description);
      const combinedTags = [...new Set([...memoryData.tags, ...autoTags])];
      
      const newMemory: Memory = {
        ...memoryData,
        id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tags: combinedTags,
        date: memoryData.date || new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        createdBy: 'current-user' // Would be actual user ID
      };
      
      setMemories(prev => [newMemory, ...prev]);
      
      // Update project memory count
      if (newMemory.projectId) {
        setProjects(prev => prev.map(p => 
          p.id === newMemory.projectId 
            ? { ...p, memoryCount: p.memoryCount + 1 }
            : p
        ));
      }
      
      cloudSync.addPendingChange({
        type: 'create',
        entity: 'memory',
        data: newMemory
      });
      
      return newMemory;
    }, 'addMemory');

    if (!result.success) {
      console.error('Failed to add memory:', result.error);
      // You could show a toast notification here
    }
  }, []);

  const updateMemory = useCallback((id: string, memoryData: Partial<Memory>) => {
    try {
      // Re-generate auto-tags if title or description changed
      let updatedData = { ...memoryData };
      if (memoryData.title || memoryData.description) {
        const currentMemory = memories.find(m => m.id === id);
        if (currentMemory) {
          const autoTags = generateAutoTags(
            memoryData.title || currentMemory.title,
            memoryData.description || currentMemory.description
          );
          const existingTags = memoryData.tags || currentMemory.tags;
          updatedData.tags = [...new Set([...existingTags, ...autoTags])];
        }
      }
      
      setMemories(prev => prev.map(m => 
        m.id === id ? { ...m, ...updatedData } : m
      ));
      
      cloudSync.addPendingChange({
        type: 'update',
        entity: 'memory',
        id,
        data: updatedData
      });
      
      console.log('Memory updated successfully:', id);
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  }, [memories]);

  const deleteMemory = useCallback((id: string) => {
    try {
      const memory = memories.find(m => m.id === id);
      setMemories(prev => prev.filter(m => m.id !== id));
      
      // Update project memory count
      if (memory?.projectId) {
        setProjects(prev => prev.map(p => 
          p.id === memory.projectId 
            ? { ...p, memoryCount: Math.max(0, p.memoryCount - 1) }
            : p
        ));
      }
      
      cloudSync.addPendingChange({
        type: 'delete',
        entity: 'memory',
        id
      });
      
      console.log('Memory deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  }, [memories]);

  const toggleMemoryFavorite = useCallback((id: string) => {
    try {
      setMemories(prev => prev.map(m => 
        m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
      ));
      
      const memory = memories.find(m => m.id === id);
      if (memory) {
        cloudSync.addPendingChange({
          type: 'update',
          entity: 'memory',
          id,
          data: { isFavorite: !memory.isFavorite }
        });
      }
      
      console.log('Memory favorite toggled:', id);
    } catch (error) {
      console.error('Error toggling memory favorite:', error);
    }
  }, [memories]);

  const toggleImageFavorite = useCallback((imageId: string) => {
    try {
      const [memoryId] = imageId.split('-');
      toggleMemoryFavorite(memoryId);
    } catch (error) {
      console.error('Error toggling image favorite:', error);
    }
  }, [toggleMemoryFavorite]);

  // Bulk operations
  const bulkDeleteMemories = useCallback((memoryIds: string[]) => {
    memoryIds.forEach(id => deleteMemory(id));
  }, [deleteMemory]);

  const bulkToggleFavorites = useCallback((memoryIds: string[]) => {
    memoryIds.forEach(id => toggleMemoryFavorite(id));
  }, [toggleMemoryFavorite]);

  const bulkMoveToProject = useCallback((memoryIds: string[], projectId: string) => {
    memoryIds.forEach(id => updateMemory(id, { projectId }));
  }, [updateMemory]);

  // Memory organization
  const moveMemoryToProject = useCallback((memoryId: string, targetProjectId: string) => {
    updateMemory(memoryId, { projectId: targetProjectId });
  }, [updateMemory]);

  return {
    // State
    activeTab,
    searchQuery,
    showFavorites,
    currentTheme,
    viewMode,
    projects: filteredProjects,
    memories: filteredMemories,
    galleryImages,
    
    // Actions
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
    
    // Enhanced features
    bulkDeleteMemories,
    bulkToggleFavorites,
    bulkMoveToProject,
    moveMemoryToProject,
  };
};
