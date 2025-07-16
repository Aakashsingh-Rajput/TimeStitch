
import React from 'react';
import { Search, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { Link } from 'react-router-dom';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFavorites: boolean;
  onToggleFavorites: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onAddProject: () => void;
  onAddMemory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  showFavorites,
  onToggleFavorites,
  currentTheme,
  onThemeChange,
  onAddProject,
  onAddMemory
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">TimeStitch</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-2">
              {[
                { id: 'projects', label: 'Projects', icon: '📁' },
                { id: 'memories', label: 'Memories', icon: '💫' },
                { id: 'gallery', label: 'Gallery', icon: '🖼️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Login/Signup buttons - prominently displayed */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Search - compact */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-40 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/80 text-sm"
              />
            </div>

            {/* Favorites toggle - only show in gallery */}
            {activeTab === 'gallery' && (
              <Button
                variant={showFavorites ? "default" : "outline"}
                size="sm"
                onClick={onToggleFavorites}
                className={`h-9 px-3 rounded-xl text-sm ${
                  showFavorites 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-white hover:bg-gray-50 border-gray-200"
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
                Favorites
              </Button>
            )}

            {/* Add buttons */}
            <Button 
              onClick={onAddMemory} 
              className="h-9 px-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Memory
            </Button>

            <Button 
              onClick={onAddProject} 
              className="h-9 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-sm text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Project
            </Button>

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};
