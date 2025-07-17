
import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Memory, Project } from '@/hooks/useTimeStitch';

interface EditMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, memoryData: Partial<Memory>) => void;
  memory: Memory | null;
  projects: Project[];
}

export const EditMemoryModal: React.FC<EditMemoryModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  memory,
  projects
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default images for demo purposes
  const defaultImages = [
    '/lovable-uploads/photo-1581091226825-a6a2a5aee158',
    '/lovable-uploads/photo-1488590528505-98d2b5aba04b',
    '/lovable-uploads/photo-1487058792275-0ad4aaf24ca7',
    '/lovable-uploads/photo-1500673922987-e212871fec22'
  ];

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setDescription(memory.description);
      setDate(memory.date);
      setProjectId(memory.projectId || '');
      setTags(memory.tags.join(', '));
      setImages(memory.images);
    }
  }, [memory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (memory && title.trim()) {
      setIsSubmitting(true);
      setError(null);
      try {
        await onUpdate(memory.id, {
          title: title.trim(),
          description: description.trim(),
          date,
          projectId: projectId || undefined,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          images
        });
        onClose();
      } catch (error: any) {
        let errorMsg = 'Unknown error';
        if (error && typeof error === 'object') {
          if ('message' in error) errorMsg = error.message;
          else errorMsg = JSON.stringify(error);
        }
        setError(`Failed to update memory: ${errorMsg}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const addImage = () => {
    if (images.length < 10) {
      const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
      setImages(prev => [...prev, randomImage]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!memory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={isSubmitting ? undefined : onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Eye className="w-6 h-6 text-blue-500" />
            Edit Memory
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Memory title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a project (optional)</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Describe your memory..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={addImage}
                className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center gap-2"
                disabled={images.length >= 10}
              >
                <Upload className="w-5 h-5" />
                Choose Files ({images.length}/10)
              </Button>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Upload ${index + 1}`} 
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {images.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview: {images.length} image(s) selected
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. vacation, family, milestone"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Memory'}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
