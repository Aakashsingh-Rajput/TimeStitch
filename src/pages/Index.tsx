import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ProjectCard } from '@/components/ProjectCard';
import { MemoryCard } from '@/components/MemoryCard';
import { Gallery } from '@/components/Gallery';
import { Footer } from '@/components/Footer';
import { AddMemoryModal } from '@/components/AddMemoryModal';
import { AddProjectModal } from '@/components/AddProjectModal';
import { EditMemoryModal } from '@/components/EditMemoryModal';
import { EditProjectModal } from '@/components/EditProjectModal';
import { MemoryDetailsModal } from '@/components/MemoryDetailsModal';
import { TimelineView } from '@/components/TimelineView';
import { ArrowLeft, Grid3X3, Clock, Upload, Calendar, Star, Image, Folder, TrendingUp, Users, Clock as ClockIcon } from 'lucide-react';
import { useTimeStitch, Memory, Project } from '@/hooks/useTimeStitch';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { useMemorySharing } from '@/hooks/useMemorySharing';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const {
    activeTab,
    searchQuery,
    showFavorites,
    currentTheme,
    viewMode,
    projects,
    memories,
    galleryImages,
    setActiveTab,
    setSearchQuery,
    setShowFavorites,
    setCurrentTheme,
    setViewMode,
    addProject,
    updateProject,
    deleteProject,
    addMemory,
    updateMemory,
    deleteMemory,
    toggleMemoryFavorite,
    toggleImageFavorite
  } = useTimeStitch();

  const bulkOps = useBulkOperations();
  const offlineSupport = useOfflineSupport();
  const memorySharing = useMemorySharing();

  const [showAddMemory, setShowAddMemory] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showEditMemory, setShowEditMemory] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showMemoryDetails, setShowMemoryDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingMemory, setViewingMemory] = useState<Memory | null>(null);

  const handleAddProject = () => {
    setShowAddProject(true);
  };

  const handleAddMemory = () => {
    setShowAddMemory(true);
  };

  const { isDragging, dragProps } = useDragAndDrop({
    onFileDrop: (files) => {
      console.log('Files dropped:', files);
      // Handle file upload logic here
    },
    acceptedTypes: ['image/*']
  });

  useEffect(() => {
    // Initialize offline support
    if (memories.length > 0 || projects.length > 0) {
      offlineSupport.cacheData(memories, projects);
    }
  }, [memories, projects, offlineSupport]);

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
    setShowEditMemory(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditProject(true);
  };

  const handleViewMemoryDetails = (memory: Memory) => {
    setViewingMemory(memory);
    setShowMemoryDetails(true);
  };

  const handleShareMemory = (memory: Memory) => {
    const shareLink = memorySharing.createShareLink(memory.id, {
      isPublic: true,
      allowDownload: true,
      allowComments: true
    });
    
    if (navigator.share) {
      navigator.share({
        title: memory.title,
        text: memory.description,
        url: shareLink.url
      });
    } else {
      navigator.clipboard.writeText(shareLink.url);
      console.log('Share link copied to clipboard:', shareLink.url);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project.id);
    setActiveTab('memories');
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setActiveTab('projects');
  };

  // Calculate accurate statistics
  const getProjectStats = (projectId: string) => {
    const projectMemories = memories.filter(m => m.projectId === projectId);
    const memoryCount = projectMemories.length;
    const imageCount = projectMemories.reduce((total, memory) => 
      total + (memory.images ? memory.images.length : 0), 0
    );
    return { memoryCount, imageCount };
  };

  // Get overall statistics
  const overallStats = {
    totalProjects: projects.length,
    totalMemories: memories.length,
    totalImages: memories.reduce((total, memory) => 
      total + (memory.images ? memory.images.length : 0), 0
    ),
    favoriteMemories: memories.filter(m => m.isFavorite).length,
    recentMemories: memories
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
  };

  // Get displayed memories based on current view
  const displayedMemories = selectedProject 
    ? memories.filter(m => m.projectId === selectedProject)
    : memories;

  const selectedProjectData = selectedProject 
    ? projects.find(p => p.id === selectedProject) 
    : null;

  // Filter memories based on search and favorites
  const filteredMemories = displayedMemories.filter(memory => {
    const matchesSearch = searchQuery === '' || 
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !showFavorites || memory.isFavorite;
    return matchesSearch && matchesFavorites;
  });

  // Memoized handlers for ProjectCard
  const memoizedHandleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setShowEditProject(true);
  }, []);

  const memoizedDeleteProject = useCallback(async (id: string) => {
    try {
      await deleteProject(id);
      toast({
        title: 'Project deleted',
        description: 'The project was deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete project.',
      });
    }
  }, [deleteProject]);

  const memoizedHandleProjectClick = useCallback((project: Project) => {
    setSelectedProject(project.id);
    setActiveTab('memories');
  }, [setActiveTab]);

  const memoizedDeleteMemory = useCallback(async (id: string) => {
    try {
      await deleteMemory(id);
      toast({
        title: 'Memory deleted',
        description: 'The memory was deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete memory.',
      });
    }
  }, [deleteMemory]);

  const memoizedAddProject = useCallback(async (project: { name: string; description: string; color: string }) => {
    try {
      const result = await addProject(project);
      toast({
        title: 'Project created',
        description: 'The project was created successfully.',
      });
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create project.',
      });
      throw error;
    }
  }, [addProject]);

  const memoizedUpdateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const result = await updateProject(id, updates);
      toast({
        title: 'Project updated',
        description: 'The project was updated successfully.',
      });
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update project.',
      });
      throw error;
    }
  }, [updateProject]);

  const memoizedAddMemory = useCallback(async (memory: any) => {
    try {
      // AddMemoryModal expects to call onAdd with a single memory object, but addMemory expects (memoryData, images)
      // We'll extract images if present, otherwise pass an empty array
      const { images = [], ...memoryData } = memory;
      const result = await addMemory(memoryData, images);
      toast({
        title: 'Memory created',
        description: 'The memory was created successfully.',
      });
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create memory.',
      });
      throw error;
    }
  }, [addMemory]);

  const memoizedUpdateMemory = useCallback(async (id: string, updates: Partial<Memory>) => {
    try {
      const result = await updateMemory(id, updates);
      toast({
        title: 'Memory updated',
        description: 'The memory was updated successfully.',
      });
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update memory.',
      });
      throw error;
    }
  }, [updateMemory]);

  return (
    <div className="min-h-screen bg-gray-50" {...dragProps}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFavorites={showFavorites}
        onToggleFavorites={setShowFavorites}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        onAddProject={handleAddProject}
        onAddMemory={handleAddMemory}
      />

      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {activeTab === 'memories' && (
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                  className="h-8"
                >
                  <Clock className="w-4 h-4" />
                </Button>
              </div>
            )}

            {selectedProject && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToProjects}
                  className="h-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Projects
                </Button>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedProjectData?.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {activeTab === 'memories' && (
              <Button
                variant={bulkOps.isSelectionMode ? 'default' : 'outline'}
                size="sm"
                onClick={bulkOps.toggleSelectionMode}
              >
                Select
              </Button>
            )}
          </div>
        </div>
      </div>

      {isDragging && (
        <div className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-xl border-2 border-dashed border-blue-500">
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900">Drop images here</p>
            <p className="text-gray-600">to add them to your memories</p>
          </div>
        </div>
      )}

      {!offlineSupport.isOnline && (
        <div className="bg-amber-500 text-white px-6 py-2 text-center text-sm">
          You're offline. Changes will sync when connection is restored.
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Home Page with Multiple Sections */}
        {activeTab === 'projects' && !selectedProject && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Your Creative Projects
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Organize your memories into meaningful collections and collaborate with others to create beautiful stories
              </p>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.totalProjects}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Folder className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Memories</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.totalMemories}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Images</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.totalImages}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Image className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Favorites</p>
                    <p className="text-2xl font-bold text-gray-900">{overallStats.favoriteMemories}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-red-600 fill-current" />
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
                <Button onClick={handleAddProject} className="bg-blue-500 hover:bg-blue-600">
                  <Folder className="w-4 h-4 mr-2" />
                  New Project
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => {
                  const stats = getProjectStats(project.id);
                  return (
                <ProjectCard
                  key={project.id}
                  project={{
                    ...project,
                    memoryCount: stats.memoryCount,
                    imageCount: stats.imageCount
                  }}
                  onEdit={memoizedHandleEditProject}
                  onDelete={memoizedDeleteProject}
                  onClick={memoizedHandleProjectClick}
                />
                  );
                })}
              </div>
            </div>

            {/* Recent Memories Section */}
            {overallStats.recentMemories.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Memories</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('memories')}
                  >
                    View All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {overallStats.recentMemories.map((memory) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      onEdit={handleEditMemory}
                      onDelete={memoizedDeleteMemory}
                      onToggleFavorite={toggleMemoryFavorite}
                      onViewDetails={handleViewMemoryDetails}
                      onShare={handleShareMemory}
                      isSelected={bulkOps.isSelected(memory.id)}
                      onSelect={() => bulkOps.toggleSelection(memory.id)}
                      showSelection={bulkOps.isSelectionMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Preview Section */}
            {galleryImages.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Gallery Preview</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('gallery')}
                  >
                    View Gallery
                  </Button>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {galleryImages.slice(0, 12).map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={image.url} 
                          alt={image.title || `Gallery image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Roadmap Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Project Roadmap</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan</h3>
                    <p className="text-gray-600 text-sm">Create new projects and organize your ideas</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Capture</h3>
                    <p className="text-gray-600 text-sm">Add memories and photos to your projects</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Share</h3>
                    <p className="text-gray-600 text-sm">Collaborate and share your stories with others</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Memories Tab */}
        {activeTab === 'memories' && (
          <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {selectedProject ? selectedProjectData?.name : 'All Memories'}
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {selectedProject 
                  ? 'Memories from this project'
                  : 'All your captured moments and experiences'
                }
                </p>
              </div>
            
            {viewMode === 'timeline' ? (
              <TimelineView
                memories={filteredMemories}
                onEdit={handleEditMemory}
                onDelete={memoizedDeleteMemory}
                onToggleFavorite={toggleMemoryFavorite}
                onShare={handleShareMemory}
                onViewDetails={handleViewMemoryDetails}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMemories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onEdit={handleEditMemory}
                    onDelete={memoizedDeleteMemory}
                    onToggleFavorite={toggleMemoryFavorite}
                    onViewDetails={handleViewMemoryDetails}
                    onShare={handleShareMemory}
                    isSelected={bulkOps.isSelected(memory.id)}
                    onSelect={() => bulkOps.toggleSelection(memory.id)}
                    showSelection={bulkOps.isSelectionMode}
                  />
                ))}
              </div>
            )}

            {filteredMemories.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No memories yet</h3>
                <p className="text-gray-500 mb-6">
                  {selectedProject ? 'This project doesn\'t have any memories yet.' : 'Start capturing your precious moments!'}
                </p>
                <button
                  onClick={handleAddMemory}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Add Your First Memory
                </button>
              </div>
            )}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Visual Gallery
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                All your beautiful moments in one stunning, immersive gallery experience
              </p>
            </div>
            
            <Gallery 
              images={galleryImages}
              onToggleFavorite={toggleImageFavorite}
              showFavorites={showFavorites}
            />
          </div>
        )}
      </main>

      <Footer currentTheme={currentTheme} />

      <AddMemoryModal
        isOpen={showAddMemory}
        onClose={() => setShowAddMemory(false)}
        onAdd={memoizedAddMemory}
        projects={projects}
      />

      <AddProjectModal
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
        onAdd={memoizedAddProject}
      />

      <EditMemoryModal
        isOpen={showEditMemory}
        onClose={() => setShowEditMemory(false)}
        onUpdate={memoizedUpdateMemory}
        memory={editingMemory}
        projects={projects}
      />

      <EditProjectModal
        isOpen={showEditProject}
        onClose={() => setShowEditProject(false)}
        onUpdate={memoizedUpdateProject}
        project={editingProject}
      />

      <MemoryDetailsModal
        isOpen={showMemoryDetails}
        onClose={() => setShowMemoryDetails(false)}
        memory={viewingMemory}
        onEdit={handleEditMemory}
        onDelete={memoizedDeleteMemory}
        onShare={handleShareMemory}
        onToggleFavorite={toggleMemoryFavorite}
      />
    </div>
  );
};

export default Index;
