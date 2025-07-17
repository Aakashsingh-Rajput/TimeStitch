
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Project } from '@/hooks/useTimeStitch';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, projectData: Partial<Project>) => void;
  project: Project | null;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  project
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setTags(''); // Projects don't have tags in the current structure
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (project && name.trim()) {
      setIsSubmitting(true);
      setError(null);
      try {
        await onUpdate(project.id, {
          name: name.trim(),
          description: description.trim()
        });
        onClose();
      } catch (error: any) {
        let errorMsg = 'Unknown error';
        if (error && typeof error === 'object') {
          if ('message' in error) errorMsg = error.message;
          else errorMsg = JSON.stringify(error);
        }
        setError(`Failed to update project: ${errorMsg}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={isSubmitting ? undefined : onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Describe your project..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tag and press Enter"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
