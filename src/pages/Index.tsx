import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Grid3X3, Clock, Download, Upload, RefreshCw, Keyboard } from 'lucide-react';
import { useTimeStitch, Memory, Project } from '@/hooks/useTimeStitch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { useMemorySharing } from '@/hooks/useMemorySharing';
import { exportToPDF, exportToSlideshow, exportToPhotoBook } from '@/utils/exportUtils';
import { cloudSync } from '@/utils/cloudSync';
import { Button } from '@/components/ui/button';

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
    toggleImageFavorite,
    bulkDeleteMemories,
    bulkToggleFavorites,
    bulkMoveToProject,
    moveMemoryToProject,
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
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [syncStatus, setSyncStatus] = useState(cloudSync.getStatus());

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

  useKeyboardShortcuts({
    onAddMemory: handleAddMemory,
    onAddProject: handleAddProject,
    onSearch: () => document.getElementById('search-input')?.focus(),
    onToggleFavorites: setShowFavorites,
    onSelectAll: () => bulkOps.selectAll(displayedMemories.map(m => m.id)),
    onDeleteSelected: () => bulkOps.bulkDelete(deleteMemory),
    onExport: () => handleExport('pdf'),
    onSync: () => cloudSync.performSync()
  });

  useEffect(() => {
    const unsubscribe = cloudSync.onStatusChange(setSyncStatus);
    cloudSync.startAutoSync();
    
    return () => {
      unsubscribe();
      cloudSync.stopAutoSync();
    };
  }, []);

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

  const handleExport = async (format: 'pdf' | 'slideshow' | 'photobook') => {
    setIsExporting(true);
    try {
      const projectName = selectedProjectData?.name || 'All Memories';
      
      switch (format) {
        case 'pdf':
          await exportToPDF(displayedMemories, projectName);
          break;
        case 'slideshow':
          exportToSlideshow(displayedMemories, projectName);
          break;
        case 'photobook':
          if (selectedProjectData) {
            exportToPhotoBook(displayedMemories, selectedProjectData);
          }
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
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
    console.log('Project clicked:', project);
    setSelectedProject(project.id);
    setActiveTab('memories');
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setActiveTab('projects');
  };

  const displayedMemories = selectedProject 
    ? memories.filter(memory => memory.projectId === selectedProject)
    : memories;

  const selectedProjectData = projects.find(p => p.id === selectedProject);

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

            {bulkOps.isSelectionMode && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {bulkOps.selectedCount} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkOps.bulkToggleFavorite(toggleMemoryFavorite)}
                >
                  Toggle Favorite
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkOps.bulkDelete(deleteMemory)}
                  className="text-red-600"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkOps.clearSelection}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <RefreshCw className={`w-4 h-4 ${syncStatus.isActive ? 'animate-spin' : ''}`} />
              <span>
                {syncStatus.pendingChanges > 0 
                  ? `${syncStatus.pendingChanges} pending` 
                  : 'Synced'
                }
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeyboardShortcuts(true)}
            >
              <Keyboard className="w-4 h-4" />
            </Button>

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
        {activeTab === 'projects' && !selectedProject && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Your Creative Projects
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Organize your memories into meaningful collections and collaborate with others to create beautiful stories
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={deleteProject}
                  onClick={handleProjectClick}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'memories' && (
          <div className="space-y-8">
            {selectedProject && selectedProjectData && (
              <div className="flex items-center space-x-4 mb-8">
                <button
                  onClick={handleBackToProjects}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Projects</span>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedProjectData.name} Memories
                  </h1>
                  <p className="text-gray-600">{selectedProjectData.description}</p>
                </div>
              </div>
            )}

            {!selectedProject && (
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Cherished Memories
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Capture and preserve your precious moments forever with rich stories and beautiful imagery
                </p>
              </div>
            )}
            
            {viewMode === 'timeline' ? (
              <TimelineView
                memories={displayedMemories}
                onEdit={handleEditMemory}
                onDelete={deleteMemory}
                onToggleFavorite={toggleMemoryFavorite}
                onShare={handleShareMemory}
                onViewDetails={handleViewMemoryDetails}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedMemories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onEdit={handleEditMemory}
                    onDelete={deleteMemory}
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

            {displayedMemories.length === 0 && (
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
        onAdd={addMemory}
        projects={projects}
      />

      <AddProjectModal
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
        onAdd={addProject}
      />

      <EditMemoryModal
        isOpen={showEditMemory}
        onClose={() => setShowEditMemory(false)}
        onUpdate={updateMemory}
        memory={editingMemory}
        projects={projects}
      />

      <EditProjectModal
        isOpen={showEditProject}
        onClose={() => setShowEditProject(false)}
        onUpdate={updateProject}
        project={editingProject}
      />

      <MemoryDetailsModal
        isOpen={showMemoryDetails}
        onClose={() => setShowMemoryDetails(false)}
        memory={viewingMemory}
        onEdit={handleEditMemory}
        onDelete={deleteMemory}
        onShare={handleShareMemory}
        onToggleFavorite={toggleMemoryFavorite}
      />
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Add Memory</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">Ctrl+N</code>
                </div>
                <div className="flex justify-between">
                  <span>Add Project</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">Ctrl+Shift+N</code>
                </div>
                <div className="flex justify-between">
                  <span>Search</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">Ctrl+K</code>
                </div>
                <div className="flex justify-between">
                  <span>Toggle Favorites</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">Ctrl+F</code>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Select All</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">Ctrl+A</code>
                </div>
                <div className="flex justify-between">
                  <span>Delete Selected</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">Ctrl+Del</code>
                </div>
                <div className="flex justify-between">
                  <span>Export</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">Ctrl+E</code>
                </div>
                <div className="flex justify-between">
                  <span>Sync</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">Ctrl+S</code>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowKeyboardShortcuts(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
