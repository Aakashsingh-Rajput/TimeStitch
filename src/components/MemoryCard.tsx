import React, { useState } from 'react';
import { Heart, Calendar, Tag, ChevronLeft, ChevronRight, Edit3, Trash2, Eye, Share2, MoreVertical, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  images: string[];
  isFavorite: boolean;
  tags: string[];
  projectId?: string;
}

interface MemoryCardProps {
  memory: Memory;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (memory: Memory) => void;
  onShare: (memory: Memory) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  showSelection?: boolean;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onEdit,
  onDelete,
  onToggleFavorite,
  onViewDetails,
  onShare,
  isSelected = false,
  onSelect,
  showSelection = false
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % memory.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + memory.images.length) % memory.images.length);
  };

  const handleShare = () => {
    onShare(memory);
    console.log('Sharing memory:', memory.title);
  };

  const handleDelete = () => {
    // Remove window.confirm, use AlertDialog instead
    // onDelete will be called from AlertDialogAction
  };

  return (
    <div 
      className={`group bg-white/80 backdrop-blur-sm rounded-3xl border border-white/30 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 ${
        isHovered ? 'transform -translate-y-1 scale-[1.02]' : ''
      } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection checkbox */}
      {showSelection && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-white/80 border-gray-300 hover:border-blue-400'
            }`}
          >
            {isSelected && <Check className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Image section */}
      {memory.images.length > 0 && (
        <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <img
            src={memory.images[currentImageIndex]}
            alt={memory.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Image navigation */}
          {memory.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {memory.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Action buttons overlay */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(memory.id);
              }}
              className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                memory.isFavorite 
                  ? 'bg-red-500/90 text-white' 
                  : 'bg-white/90 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${memory.isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0 bg-white/90 hover:bg-white rounded-full backdrop-blur-sm"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50" align="end">
                <DropdownMenuItem
                  onClick={() => onViewDetails(memory)}
                  className="hover:bg-blue-50/50 cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(memory)}
                  className="hover:bg-blue-50/50 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Memory
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onShare(memory)}
                  className="hover:bg-blue-50/50 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="hover:bg-red-50/50 text-red-600 cursor-pointer">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this memory? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={(e) => { e.stopPropagation(); onDelete(memory.id); }}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
            {memory.title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500 ml-4 bg-gray-50 rounded-full px-3 py-1">
            <Calendar className="w-4 h-4" />
            <span className="whitespace-nowrap">{memory.date}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
          {memory.description}
        </p>

        {/* Tags */}
        {memory.tags.length > 0 && (
          <div className="flex items-center space-x-2 mb-6">
            <Tag className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {memory.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 text-xs rounded-full border border-blue-100 hover:from-blue-100 hover:to-purple-100 transition-colors duration-200"
                >
                  #{tag}
                </span>
              ))}
              {memory.tags.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                  +{memory.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{memory.images.length} photo{memory.images.length !== 1 ? 's' : ''}</span>
            </span>
            {/* Removed views count */}
          </div>
          
          <div className="flex items-center space-x-2">
            {memory.isFavorite && (
              <div className="flex items-center space-x-1 text-red-500">
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-xs font-medium">Loved</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
