
import React, { useState, useRef } from 'react';
import { Camera, Calendar, Tag, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataService } from '@/lib/dataService';
import { useAuth } from '@/hooks/useAuth';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memory: any) => void;
  projects: any[];
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  projects
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        alert(`Invalid file type: ${file.name}. Please select JPEG, PNG, GIF, or WebP files.`);
      }
      if (!isValidSize) {
        alert(`File too large: ${file.name}. Maximum size is 10MB.`);
      }
      
      return isValidType && isValidSize;
    });

    if (selectedFiles.length + validFiles.length > 10) {
      alert('Maximum 10 images allowed.');
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to add memories.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const memoryData = {
        title,
        description,
        date: new Date(date).toISOString().split('T')[0],
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        projectId: selectedProject || undefined,
        location: '',
        isFavorite: false,
        images: [] // Fix: add empty images array for type compatibility
      };

      // Create memory with images using DataService
      const newMemory = await DataService.createMemory(memoryData, selectedFiles);
      
      onAdd(newMemory);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setTags('');
      setSelectedProject('');
      setSelectedFiles([]);
      setUploadProgress(0);
      onClose();
    } catch (error) {
      console.error('Error creating memory:', error);
      let errorMsg = 'Unknown error';
      if (error && typeof error === 'object') {
        if ('message' in error) errorMsg = error.message;
        else errorMsg = JSON.stringify(error);
      }
      alert(`Failed to create memory: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-500" />
            Add New Memory
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter memory title..."
              required
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell the story of this memory..."
              required
              disabled={isUploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isUploading}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Images (optional)
            </label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                disabled={isUploading || selectedFiles.length >= 10}
              >
                <Upload className="w-5 h-5 mr-2" />
                {selectedFiles.length === 0 ? 'Select Images' : `Add More Images (${selectedFiles.length}/10)`}
              </Button>
              
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        disabled={isUploading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                        {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. vacation, family, milestone"
              disabled={isUploading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white border-gray-200 hover:bg-gray-50"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isUploading}
            >
              {isUploading ? 'Creating Memory...' : 'Add Memory'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
