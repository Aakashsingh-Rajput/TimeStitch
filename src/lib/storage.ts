import { supabase } from './supabaseClient';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface StorageImage {
  id: string;
  memoryId: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export class StorageService {
  private static readonly BUCKET_NAME = 'memories';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  ];

  // Initialize storage bucket
  static async initializeBucket(): Promise<void> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: false,
          allowedMimeTypes: this.ALLOWED_TYPES,
          fileSizeLimit: this.MAX_FILE_SIZE
        });
        
        if (error) throw error;
        console.log('Storage bucket created successfully');
      }
    } catch (error) {
      console.error('Error initializing storage bucket:', error);
      throw error;
    }
  }

  // Upload image to storage
  static async uploadImage(
    file: File, 
    memoryId: string, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Get user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `${user.user.id}/${memoryId}/${timestamp}_${randomId}.${extension}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filename);

      return {
        url: urlData.publicUrl,
        filename: file.name,
        size: file.size,
        mimeType: file.type
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Upload multiple images
  static async uploadImages(
    files: File[], 
    memoryId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadImage(files[i], memoryId, (fileProgress) => {
          if (onProgress) {
            const overallProgress = ((i + fileProgress / 100) / totalFiles) * 100;
            onProgress(overallProgress);
          }
        });
        results.push(result);
      } catch (error) {
        console.error(`Error uploading file ${files[i].name}:`, error);
        throw error;
      }
    }

    return results;
  }

  // Save image metadata to database
  static async saveImageMetadata(
    memoryId: string, 
    uploadResults: UploadResult[]
  ): Promise<StorageImage[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const imageRecords = uploadResults.map(result => ({
        memory_id: memoryId,
        url: result.url,
        filename: result.filename,
        size: result.size,
        mime_type: result.mimeType,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('images')
        .insert(imageRecords)
        .select();

      if (error) throw error;

      return data.map(img => ({
        id: img.id,
        memoryId: img.memory_id,
        url: img.url,
        filename: img.filename,
        size: img.size,
        mimeType: img.mime_type,
        createdAt: img.created_at
      }));
    } catch (error) {
      console.error('Error saving image metadata:', error);
      throw error;
    }
  }

  // Get images for a memory
  static async getImagesForMemory(memoryId: string): Promise<StorageImage[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('memory_id', memoryId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(img => ({
        id: img.id,
        memoryId: img.memory_id,
        url: img.url,
        filename: img.filename,
        size: img.size,
        mimeType: img.mime_type,
        createdAt: img.created_at
      }));
    } catch (error) {
      console.error('Error getting images for memory:', error);
      throw error;
    }
  }

  // Delete image from storage and database
  static async deleteImage(imageId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get image record
      const { data: image, error: fetchError } = await supabase
        .from('images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;

      // Verify user owns the memory
      const { data: memory, error: memoryError } = await supabase
        .from('memories')
        .select('user_id')
        .eq('id', image.memory_id)
        .single();

      if (memoryError) throw memoryError;
      if (memory.user_id !== user.user.id) throw new Error('Unauthorized');

      // Delete from storage
      const filename = image.url.split('/').pop();
      if (filename) {
        const { error: storageError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([filename]);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);

      if (deleteError) throw deleteError;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Delete all images for a memory
  static async deleteImagesForMemory(memoryId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Verify user owns the memory
      const { data: memory, error: memoryError } = await supabase
        .from('memories')
        .select('user_id')
        .eq('id', memoryId)
        .single();

      if (memoryError) throw memoryError;
      if (memory.user_id !== user.user.id) throw new Error('Unauthorized');

      // Get all images for the memory
      const { data: images, error: fetchError } = await supabase
        .from('images')
        .select('url')
        .eq('memory_id', memoryId);

      if (fetchError) throw fetchError;

      // Delete from storage
      const filenames = images.map(img => img.url.split('/').pop()).filter(Boolean);
      if (filenames.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(filenames);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('images')
        .delete()
        .eq('memory_id', memoryId);

      if (deleteError) throw deleteError;
    } catch (error) {
      console.error('Error deleting images for memory:', error);
      throw error;
    }
  }

  // Validate file before upload
  private static validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`);
    }
  }

  // Get storage usage statistics
  static async getStorageStats(): Promise<{
    totalSize: number;
    fileCount: number;
    bucketSize: number;
  }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get user's images
      const { data: images, error } = await supabase
        .from('images')
        .select('size')
        .eq('memory_id', (await supabase
          .from('memories')
          .select('id')
          .eq('user_id', user.user.id)).data?.map(m => m.id) || []);

      if (error) throw error;

      const totalSize = images.reduce((sum, img) => sum + img.size, 0);
      const fileCount = images.length;

      // Get bucket size (this might not be available in all plans)
      let bucketSize = 0;
      try {
        const { data: bucketData } = await supabase.storage.getBucket(this.BUCKET_NAME);
        bucketSize = bucketData?.file_size_limit || 0;
      } catch (bucketError) {
        console.warn('Could not get bucket size:', bucketError);
      }

      return {
        totalSize,
        fileCount,
        bucketSize
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  // Optimize image (resize, compress)
  static async optimizeImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
} 