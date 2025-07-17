import { DatabaseService } from './database';
import { StorageService } from './storage';
import { Project, Memory } from '@/hooks/useTimeStitch';
import { UploadResult } from './storage';

export class DataService {
  // Initialize all services
  static async initialize(): Promise<void> {
    try {
      await StorageService.initializeBucket();
      console.log('Data services initialized successfully');
    } catch (error) {
      console.error('Error initializing data services:', error);
      throw error;
    }
  }

  // Project operations
  static async createProject(projectData: Omit<Project, 'id' | 'memoryCount' | 'imageCount' | 'createdDate'>): Promise<Project> {
    try {
      return await DatabaseService.createProject(projectData);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  static async getProjects(): Promise<Project[]> {
    try {
      return await DatabaseService.getProjects();
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    try {
      return await DatabaseService.updateProject(id, updates);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  static async deleteProject(id: string): Promise<void> {
    try {
      // First delete all memories in the project
      const memories = await DatabaseService.getMemories(id);
      for (const memory of memories) {
        await this.deleteMemory(memory.id);
      }
      
      // Then delete the project
      await DatabaseService.deleteProject(id);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Memory operations with image handling
  static async createMemory(
    memoryData: Omit<Memory, 'id'>, 
    images: File[] = []
  ): Promise<Memory> {
    try {
      // Create memory in database
      const memory = await DatabaseService.createMemory(memoryData);

      // Upload images if provided
      if (images.length > 0) {
        const uploadResults = await StorageService.uploadImages(images, memory.id);
        await StorageService.saveImageMetadata(memory.id, uploadResults);
        
        // Update memory with image URLs
        const imageUrls = uploadResults.map(result => result.url);
        return await DatabaseService.updateMemory(memory.id, { images: imageUrls });
      }

      return memory;
    } catch (error) {
      console.error('Error creating memory:', error);
      throw error;
    }
  }

  static async getMemories(projectId?: string): Promise<Memory[]> {
    try {
      return await DatabaseService.getMemories(projectId);
    } catch (error) {
      console.error('Error getting memories:', error);
      throw error;
    }
  }

  static async updateMemory(
    id: string, 
    updates: Partial<Memory>, 
    newImages: File[] = []
  ): Promise<Memory> {
    try {
      let updatedMemory = await DatabaseService.updateMemory(id, updates);

      // Handle new images if provided
      if (newImages.length > 0) {
        const uploadResults = await StorageService.uploadImages(newImages, id);
        await StorageService.saveImageMetadata(id, uploadResults);
        
        // Add new image URLs to existing ones
        const newImageUrls = uploadResults.map(result => result.url);
        const allImages = [...(updates.images || updatedMemory.images), ...newImageUrls];
        
        updatedMemory = await DatabaseService.updateMemory(id, { images: allImages });
      }

      return updatedMemory;
    } catch (error) {
      console.error('Error updating memory:', error);
      throw error;
    }
  }

  static async deleteMemory(id: string): Promise<void> {
    try {
      // Delete all images for the memory
      await StorageService.deleteImagesForMemory(id);
      
      // Delete the memory
      await DatabaseService.deleteMemory(id);
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  }

  static async toggleMemoryFavorite(id: string): Promise<void> {
    try {
      await DatabaseService.toggleMemoryFavorite(id);
    } catch (error) {
      console.error('Error toggling memory favorite:', error);
      throw error;
    }
  }

  // Image operations
  static async addImagesToMemory(memoryId: string, images: File[]): Promise<string[]> {
    try {
      const uploadResults = await StorageService.uploadImages(images, memoryId);
      await StorageService.saveImageMetadata(memoryId, uploadResults);
      
      // Get current memory and update with new images
      const currentMemory = await DatabaseService.getMemories();
      const memory = currentMemory.find(m => m.id === memoryId);
      if (!memory) throw new Error('Memory not found');

      const newImageUrls = uploadResults.map(result => result.url);
      const allImages = [...memory.images, ...newImageUrls];
      
      await DatabaseService.updateMemory(memoryId, { images: allImages });
      
      return newImageUrls;
    } catch (error) {
      console.error('Error adding images to memory:', error);
      throw error;
    }
  }

  static async removeImageFromMemory(memoryId: string, imageUrl: string): Promise<void> {
    try {
      // Find the image record
      const images = await StorageService.getImagesForMemory(memoryId);
      const image = images.find(img => img.url === imageUrl);
      
      if (image) {
        await StorageService.deleteImage(image.id);
        
        // Update memory's image list
        const currentMemory = await DatabaseService.getMemories();
        const memory = currentMemory.find(m => m.id === memoryId);
        if (memory) {
          const updatedImages = memory.images.filter(url => url !== imageUrl);
          await DatabaseService.updateMemory(memoryId, { images: updatedImages });
        }
      }
    } catch (error) {
      console.error('Error removing image from memory:', error);
      throw error;
    }
  }

  // Bulk operations
  static async bulkDeleteMemories(memoryIds: string[]): Promise<void> {
    try {
      for (const id of memoryIds) {
        await this.deleteMemory(id);
      }
    } catch (error) {
      console.error('Error bulk deleting memories:', error);
      throw error;
    }
  }

  static async bulkMoveMemories(memoryIds: string[], targetProjectId: string): Promise<void> {
    try {
      for (const id of memoryIds) {
        await DatabaseService.updateMemory(id, { projectId: targetProjectId });
      }
    } catch (error) {
      console.error('Error bulk moving memories:', error);
      throw error;
    }
  }

  static async bulkToggleFavorites(memoryIds: string[]): Promise<void> {
    try {
      for (const id of memoryIds) {
        await DatabaseService.toggleMemoryFavorite(id);
      }
    } catch (error) {
      console.error('Error bulk toggling favorites:', error);
      throw error;
    }
  }

  // Statistics and analytics
  static async getStorageStats(): Promise<{
    totalSize: number;
    fileCount: number;
    bucketSize: number;
  }> {
    try {
      return await StorageService.getStorageStats();
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  static async getProjectStats(projectId: string): Promise<{
    memoryCount: number;
    imageCount: number;
    totalSize: number;
    favoriteCount: number;
  }> {
    try {
      const memories = await DatabaseService.getMemories(projectId);
      const memoryCount = memories.length;
      const imageCount = memories.reduce((total, memory) => total + memory.images.length, 0);
      const favoriteCount = memories.filter(memory => memory.isFavorite).length;
      
      // Calculate total size (this would need to be enhanced with actual file sizes)
      const totalSize = 0; // TODO: Implement actual size calculation
      
      return {
        memoryCount,
        imageCount,
        totalSize,
        favoriteCount
      };
    } catch (error) {
      console.error('Error getting project stats:', error);
      throw error;
    }
  }

  // Search functionality
  static async searchMemories(query: string, projectId?: string): Promise<Memory[]> {
    try {
      const memories = await DatabaseService.getMemories(projectId);
      
      return memories.filter(memory => 
        memory.title.toLowerCase().includes(query.toLowerCase()) ||
        memory.description.toLowerCase().includes(query.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        memory.location?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching memories:', error);
      throw error;
    }
  }

  static async searchProjects(query: string): Promise<Project[]> {
    try {
      const projects = await DatabaseService.getProjects();
      
      return projects.filter(project => 
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }

  // Data export/import
  static async exportUserData(): Promise<{
    projects: Project[];
    memories: Memory[];
    storageStats: any;
  }> {
    try {
      const projects = await DatabaseService.getProjects();
      const memories = await DatabaseService.getMemories();
      const storageStats = await StorageService.getStorageStats();
      
      return {
        projects,
        memories,
        storageStats
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Cleanup operations
  static async cleanupOrphanedImages(): Promise<number> {
    try {
      // This would implement logic to find and delete images that don't have associated memories
      // For now, return 0 as this is a placeholder
      return 0;
    } catch (error) {
      console.error('Error cleaning up orphaned images:', error);
      throw error;
    }
  }
} 