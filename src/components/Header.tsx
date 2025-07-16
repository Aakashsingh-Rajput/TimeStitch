
import React, { useState } from 'react';
import { Search, Heart, Plus, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, loading, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">TimeStitch</span>
            </div>
            
            {/* Desktop Navigation */}
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
          <div className="flex items-center space-x-2">
            {/* Search - responsive */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-40 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/80 text-sm"
              />
            </div>

            {/* Favorites toggle - only show in gallery on desktop */}
            {activeTab === 'gallery' && (
              <div className="hidden md:block">
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
              </div>
            )}

            {/* Add buttons - always visible */}
            <Button 
              onClick={onAddMemory} 
              className="h-9 px-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm text-sm hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              Memory
            </Button>
            <Button 
              onClick={onAddProject} 
              className="h-9 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-sm text-sm hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              Project
            </Button>

            {/* Profile/Auth - Desktop */}
            <div className="hidden sm:flex items-center space-x-2">
              {!loading && !user && (
                <>
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
                </>
              )}
              {!loading && user && (
                <>
                  <ProfileDropdown />
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                    onClick={signOut}
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="sm:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-4 space-y-4">
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2">
              {[
                { id: 'projects', label: 'Projects', icon: '📁' },
                { id: 'memories', label: 'Memories', icon: '💫' },
                { id: 'gallery', label: 'Gallery', icon: '🖼️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
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

            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/80 text-sm"
              />
            </div>

            {/* Mobile Favorites */}
            {activeTab === 'gallery' && (
              <Button
                variant={showFavorites ? "default" : "outline"}
                size="sm"
                onClick={onToggleFavorites}
                className={`w-full h-12 px-3 rounded-xl text-sm ${
                  showFavorites 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-white hover:bg-gray-50 border-gray-200"
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
                Favorites
              </Button>
            )}

            {/* Mobile Add Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => {
                  onAddMemory();
                  setIsMobileMenuOpen(false);
                }}
                className="h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Memory
              </Button>
              <Button 
                onClick={() => {
                  onAddProject();
                  setIsMobileMenuOpen(false);
                }}
                className="h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-sm text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Project
              </Button>
            </div>

            {/* Mobile Auth */}
            <div className="space-y-2">
              {!loading && !user && (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full h-12 text-gray-600 hover:text-gray-900">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
              {!loading && user && (
                <>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full h-12 text-gray-600 hover:text-gray-900">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
