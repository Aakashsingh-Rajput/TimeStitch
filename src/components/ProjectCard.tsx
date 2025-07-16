
import React, { useState } from 'react';
import { FolderOpen, Calendar, MoreHorizontal, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Project {
  id: string;
  name: string;
  description: string;
  memoryCount: number;
  createdDate: string;
  color: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return { bg: 'bg-blue-50', accent: 'bg-blue-500', border: 'border-blue-200' };
      case 'purple': return { bg: 'bg-purple-50', accent: 'bg-purple-500', border: 'border-purple-200' };
      case 'green': return { bg: 'bg-green-50', accent: 'bg-green-500', border: 'border-green-200' };
      case 'orange': return { bg: 'bg-orange-50', accent: 'bg-orange-500', border: 'border-orange-200' };
      default: return { bg: 'bg-blue-50', accent: 'bg-blue-500', border: 'border-blue-200' };
    }
  };

  const colors = getColorClasses(project.color);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      return;
    }
    onClick(project);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  return (
    <div 
      className={`group bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        isHovered ? 'shadow-lg -translate-y-1' : 'shadow-sm'
      }`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`h-1 ${colors.accent}`} />
      
      <div className="p-6 relative">
        <div className="absolute top-4 right-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 rounded-full"
                data-dropdown-trigger
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer hover:bg-gray-50">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-start space-x-4 mb-4 pr-8">
          <div className={`w-12 h-12 rounded-xl ${colors.accent} flex items-center justify-center`}>
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {project.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`${colors.bg} rounded-xl p-3 text-center`}>
            <div className="text-xl font-bold text-gray-900">{project.memoryCount}</div>
            <div className="text-xs text-gray-600">Memories</div>
          </div>
          <div className={`${colors.bg} rounded-xl p-3 text-center`}>
            <div className="text-xl font-bold text-gray-900">{Math.floor(Math.random() * 50) + 1}</div>
            <div className="text-xs text-gray-600">Images</div>
          </div>
        </div>

        <div className="flex items-center justify-center text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Created {project.createdDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
