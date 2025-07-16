
import React from 'react';
import { X, Calendar, Tag, Heart, Share2, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Memory } from '@/hooks/useTimeStitch';

interface MemoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory | null;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onShare: (memory: Memory) => void;
  onToggleFavorite: (id: string) => void;
}

export const MemoryDetailsModal: React.FC<MemoryDetailsModalProps> = ({
  isOpen,
  onClose,
  memory,
  onEdit,
  onDelete,
  onShare,
  onToggleFavorite
}) => {
  if (!memory) return null;

  const handleShare = () => {
    onShare(memory);
    console.log('Sharing memory:', memory.title);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      onDelete(memory.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
            <span>{memory.title}</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(memory.id)}
                className={`p-2 rounded-full ${
                  memory.isFavorite 
                    ? 'text-red-500 hover:bg-red-50' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${memory.isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(memory)}
                className="p-2 rounded-full text-blue-500 hover:bg-blue-50"
              >
                <Edit3 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-2 rounded-full text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Images */}
          {memory.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memory.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Memory ${index + 1}`}
                  className="w-full h-48 object-cover rounded-xl border border-gray-200"
                />
              ))}
            </div>
          )}

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{memory.date}</span>
            </div>
            {memory.isFavorite && (
              <div className="flex items-center gap-1 text-red-500">
                <Heart className="w-4 h-4 fill-current" />
                <span>Favorite</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{memory.description}</p>
          </div>

          {/* Tags */}
          {memory.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={() => onEdit(memory)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Memory
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 border-gray-200 hover:bg-gray-50 rounded-xl"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
