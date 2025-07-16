
import React from 'react';
import { Calendar, Clock, Heart, Edit3, Trash2, Share2 } from 'lucide-react';
import { Memory } from '@/hooks/useTimeStitch';
import { Button } from '@/components/ui/button';

interface TimelineViewProps {
  memories: Memory[];
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onShare: (memory: Memory) => void;
  onViewDetails: (memory: Memory) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  memories,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShare,
  onViewDetails
}) => {
  // Group memories by year and month
  const groupedMemories = memories.reduce((acc, memory) => {
    const date = new Date(memory.date);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const key = `${year}-${month}`;
    
    if (!acc[key]) {
      acc[key] = { year, month, memories: [] };
    }
    acc[key].memories.push(memory);
    return acc;
  }, {} as Record<string, { year: number; month: string; memories: Memory[] }>);

  const sortedGroups = Object.values(groupedMemories).sort((a, b) => {
    return new Date(b.year, new Date(`${b.month} 1`).getMonth()).getTime() - 
           new Date(a.year, new Date(`${a.month} 1`).getMonth()).getTime();
  });

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
        
        {sortedGroups.map((group) => (
          <div key={`${group.year}-${group.month}`} className="mb-12">
            {/* Date header */}
            <div className="flex items-center mb-6">
              <div className="relative z-10 bg-white border-4 border-blue-500 rounded-full p-3 mr-6">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{group.month} {group.year}</h2>
                <p className="text-gray-600">{group.memories.length} memories</p>
              </div>
            </div>

            {/* Memories for this period */}
            <div className="ml-20 space-y-6">
              {group.memories.map((memory) => (
                <div
                  key={memory.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{memory.date}</span>
                        {memory.isFavorite && (
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {memory.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {memory.description}
                      </p>
                      
                      {/* Tags */}
                      {memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {memory.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorite(memory.id)}
                        className={`${memory.isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                      >
                        <Heart className={`w-4 h-4 ${memory.isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(memory)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(memory)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShare(memory)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(memory.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Images */}
                  {memory.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {memory.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={image}
                            alt={memory.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {memory.images.length > 4 && index === 3 && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold">
                                +{memory.images.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
