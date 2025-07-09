import React, { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import UploadForm from './components/UploadForm'
import MemoryCard from './components/MemoryCard'
import ProjectCard from './components/ProjectCard'
import ProjectForm from './components/ProjectForm'
import Footer from './components/Footer'
import { ThemeProvider } from './contexts/ThemeContext'
import { Memory, Project } from './types/Memory'

// Demo data for testing without Firebase
const demoProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of our company website with modern design and improved UX',
    color: 'blush',
    createdAt: new Date('2024-01-01'),
    memoryCount: 2
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Building a new mobile app for iOS and Android platforms',
    color: 'sky',
    createdAt: new Date('2024-02-01'),
    memoryCount: 1
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    description: 'Summer marketing campaign with social media and influencer partnerships',
    color: 'lime',
    createdAt: new Date('2024-03-01'),
    memoryCount: 0
  }
]

const demoMemories: Memory[] = [
  {
    id: '1',
    title: 'First Team Meeting',
    date: '2024-01-15',
    description: 'Our very first team meeting where we brainstormed the initial ideas for the project. The energy was incredible and everyone was so excited to get started!',
    imageUrls: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'
    ],
    createdAt: new Date('2024-01-15'),
    projectId: '1'
  },
  {
    id: '2',
    title: 'Milestone Celebration',
    date: '2024-02-20',
    description: 'We celebrated our first major milestone! The team worked incredibly hard and this moment was so rewarding. Pizza and high-fives all around!',
    imageUrls: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
    ],
    createdAt: new Date('2024-02-20'),
    projectId: '1'
  },
  {
    id: '3',
    title: 'Late Night Coding Session',
    date: '2024-03-10',
    description: 'One of those magical late-night coding sessions where everything just clicked. The coffee was flowing and the ideas were flying!',
    imageUrls: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop'
    ],
    createdAt: new Date('2024-03-10'),
    projectId: '2'
  }
]

function App() {
  const [memories, setMemories] = useState<Memory[]>(demoMemories)
  const [projects, setProjects] = useState<Project[]>(demoProjects)
  const [loading, setLoading] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [view, setView] = useState<'projects' | 'memories' | 'gallery'>('projects')
  const [memoryModalOpen, setMemoryModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [projectTab, setProjectTab] = useState<'memories' | 'gallery'>('memories')
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null)
  const [modalPos, setModalPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  // Simulate loading
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Update memory counts when memories change
  useEffect(() => {
    const updatedProjects = projects.map(project => ({
      ...project,
      memoryCount: memories.filter(memory => memory.projectId === project.id).length
    }))
    setProjects(updatedProjects)
  }, [memories])

  const addMemory = async (memory: Omit<Memory, 'id'>) => {
    // Demo version - just add to local state
    const newMemory: Memory = {
      ...memory,
      id: Date.now().toString()
    }
    setMemories(prev => [newMemory, ...prev])
  }

  const updateMemory = async (memory: Memory) => {
    // Demo version - update in local state
    setMemories(prev => prev.map(m => m.id === memory.id ? memory : m))
    setEditingMemory(null) // Exit edit mode
  }

  const deleteMemory = async (id: string) => {
    // Demo version - remove from local state
    setMemories(prev => prev.filter(m => m.id !== id))
  }

  const addProject = async (project: Omit<Project, 'id' | 'memoryCount'>) => {
    // Demo version - just add to local state
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      memoryCount: 0
    }
    setProjects(prev => [newProject, ...prev])
  }

  const updateProject = async (project: Project) => {
    // Demo version - update in local state
    setProjects(prev => prev.map(p => p.id === project.id ? project : p))
    setEditingProject(null) // Exit edit mode
  }

  const deleteProject = async (id: string) => {
    // Demo version - remove project and its memories
    setProjects(prev => prev.filter(p => p.id !== id))
    setMemories(prev => prev.filter(m => m.projectId !== id))
    if (selectedProject?.id === id) {
      setSelectedProject(null)
    }
  }

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory)
  }

  const handleCancelEdit = () => {
    setEditingMemory(null)
  }

  const handleProjectEdit = (project: Project) => {
    setEditingProject(project)
  }

  const handleProjectCancelEdit = () => {
    setEditingProject(null)
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setView('memories')
  }

  // Gather all unique tags from memories and projects
  const allTags = Array.from(new Set([
    ...memories.flatMap(m => m.tags || []),
    ...projects.flatMap(p => p.tags || [])
  ])).filter(Boolean)

  // Filtering logic
  const matchesSearch = (text: string) => text.toLowerCase().includes(search.toLowerCase())
  const memoryMatches = (memory: Memory) => (
    (!search || matchesSearch(memory.title) || matchesSearch(memory.description) || (memory.tags || []).some(t => matchesSearch(t))) &&
    (selectedTags.length === 0 || (memory.tags || []).some(t => selectedTags.includes(t)))
  )
  const projectMatches = (project: Project) => (
    (!search || matchesSearch(project.name) || matchesSearch(project.description) || (project.tags || []).some(t => matchesSearch(t))) &&
    (selectedTags.length === 0 || (project.tags || []).some(t => selectedTags.includes(t)))
  )
  const filteredProjects = projects.filter(projectMatches)
  const filteredMemories = (selectedProject
    ? memories.filter(m => m.projectId === selectedProject.id)
    : memories
  ).filter(memoryMatches)
  const filteredGalleryImages = (view === 'gallery'
    ? memories
    : selectedProject
      ? memories.filter(m => m.projectId === selectedProject.id)
      : []
  ).filter(memory => memoryMatches(memory) && (!showFavoritesOnly || memory.favorite)).flatMap(m => (m.imageUrls || []).map(url => ({ url, memoryId: m.id, memoryTitle: m.title, tags: m.tags || [] })))
    .filter(img => selectedTags.length === 0 || img.tags.some(t => selectedTags.includes(t)))

  const openAddProjectModal = () => {
    setEditingProject(null)
    setProjectModalOpen(true)
  }
  const openEditProjectModal = (project: Project) => {
    setEditingProject(project)
    setProjectModalOpen(true)
  }
  const closeProjectModal = () => {
    setProjectModalOpen(false)
    setEditingProject(null)
  }

  const openAddMemoryModal = () => {
    setEditingMemory(null)
    setMemoryModalOpen(true)
  }
  const openEditMemoryModal = (memory: Memory) => {
    setEditingMemory(memory)
    setMemoryModalOpen(true)
  }
  const closeMemoryModal = () => {
    setMemoryModalOpen(false)
    setEditingMemory(null)
  }

  const handleFavorite = (id: string, value: boolean) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, favorite: value } : m))
  }

  // Drag logic
  const handleModalMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect()
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }
  useEffect(() => {
    if (!dragOffset) return
    const handleMouseMove = (e: MouseEvent) => {
      setModalPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
    }
    const handleMouseUp = () => setDragOffset(null)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragOffset])

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh' }}>
        {/* Floating decorations */}
        <div className="floating-decoration" style={{ top: '5rem', left: '2.5rem', animationDelay: '0s' }}></div>
        <div className="floating-decoration" style={{ top: '10rem', right: '5rem', animationDelay: '2s' }}></div>
        <div className="floating-decoration" style={{ bottom: '10rem', left: '5rem', animationDelay: '4s' }}></div>
        
        <Header 
          view={view}
          onViewChange={setView}
          onAddProject={openAddProjectModal}
          onAddMemory={openAddMemoryModal}
          search={search}
          setSearch={setSearch}
          allTags={allTags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
          projectTab={projectTab}
        />
        
        <main className="main" style={{ padding: '0.5rem 0', marginTop: '2rem' }}>
          <div className="container">
            {view === 'projects' ? (
              <>
                {/* Modal for ProjectForm */}
                {projectModalOpen && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      background: 'rgba(0,0,0,0.18)',
                      zIndex: 1000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={closeProjectModal}
                    tabIndex={-1}
                    onKeyDown={e => { if (e.key === 'Escape') closeProjectModal() }}
                  >
                    <div
                      ref={modalRef}
                      style={{
                        background: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 32px rgba(0,0,0,0.12)',
                        padding: '2rem',
                        minWidth: '340px',
                        maxWidth: '540px',
                        width: '100%',
                        position: 'absolute',
                        left: modalPos.x || '50%',
                        top: modalPos.y || '50%',
                        transform: modalPos.x || modalPos.y ? undefined : 'translate(-50%, -50%)',
                        cursor: dragOffset ? 'grabbing' : 'default',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Draggable Header */}
                      <div
                        style={{
                          width: '100%',
                          cursor: 'grab',
                          paddingBottom: '0.5rem',
                          marginBottom: '1rem',
                          borderBottom: '1px solid #ede8e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          userSelect: 'none',
                        }}
                        onMouseDown={handleModalMouseDown}
                      >
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#ec4899', letterSpacing: '0.01em' }}>
                          {editingProject ? 'Edit Project' : 'Create Project'}
                        </span>
                        <button
                          onClick={closeProjectModal}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: '#888',
                            cursor: 'pointer',
                            zIndex: 10,
                          }}
                          aria-label="Close"
                        >
                          ×
                        </button>
                      </div>
                      <ProjectForm
                        onAddProject={addProject}
                        onUpdateProject={updateProject}
                        editingProject={editingProject}
                        onCancelEdit={closeProjectModal}
                      />
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {loading ? (
                    <div className="spinner"></div>
                  ) : projects.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📁</div>
                      <h3 className="empty-state-title">No projects yet</h3>
                      <p className="empty-state-text">Create your first project to get started!</p>
                    </div>
                  ) : (
                    filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isSelected={selectedProject?.id === project.id}
                        onSelect={handleProjectSelect}
                        onEdit={() => openEditProjectModal(project)}
                        onDelete={deleteProject}
                      />
                    ))
                  )}
                </div>
              </>
            ) : view === 'memories' ? (
              <>
                {/* Modal for UploadForm */}
                {memoryModalOpen && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      background: 'rgba(0,0,0,0.18)',
                      zIndex: 1000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={closeMemoryModal}
                    tabIndex={-1}
                    onKeyDown={e => { if (e.key === 'Escape') closeMemoryModal() }}
                  >
                    <div
                      ref={modalRef}
                      style={{
                        background: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 32px rgba(0,0,0,0.12)',
                        padding: '2rem',
                        minWidth: '340px',
                        maxWidth: '540px',
                        width: '100%',
                        position: 'absolute',
                        left: modalPos.x || '50%',
                        top: modalPos.y || '50%',
                        transform: modalPos.x || modalPos.y ? undefined : 'translate(-50%, -50%)',
                        cursor: dragOffset ? 'grabbing' : 'default',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Draggable Header */}
                      <div
                        style={{
                          width: '100%',
                          cursor: 'grab',
                          paddingBottom: '0.5rem',
                          marginBottom: '1rem',
                          borderBottom: '1px solid #ede8e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          userSelect: 'none',
                        }}
                        onMouseDown={handleModalMouseDown}
                      >
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#ec4899', letterSpacing: '0.01em' }}>
                          {editingMemory ? 'Edit Memory' : 'Add New Memory'}
                        </span>
                        <button
                          onClick={closeMemoryModal}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: '#888',
                            cursor: 'pointer',
                            zIndex: 10,
                          }}
                          aria-label="Close"
                        >
                          ×
                        </button>
                      </div>
                      <UploadForm
                        onAddMemory={addMemory}
                        onUpdateMemory={updateMemory}
                        editingMemory={editingMemory}
                        onCancelEdit={closeMemoryModal}
                        projects={projects}
                        selectedProjectId={selectedProject?.id}
                      />
                    </div>
                  </div>
                )}
                <div style={{
                  maxWidth: '1100px',
                  margin: '0 auto',
                  padding: '2rem 0',
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.92)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                    padding: '2.5rem 2rem',
                  }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem',
                        alignItems: 'center',
                      }}
                    >
                      {loading ? (
                        <div className="spinner"></div>
                      ) : filteredMemories.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-state-icon">📸</div>
                          <h3 className="empty-state-title">
                            {selectedProject ? `No memories in ${selectedProject.name}` : 'No memories yet'}
                          </h3>
                          <p className="empty-state-text">
                            {selectedProject ? 'Add your first memory to this project!' : 'Start by adding your first memory!'}
                          </p>
                        </div>
                      ) : (
                        <div className="memory-list">
                          {filteredMemories.map((memory) => (
                            <MemoryCard
                              key={memory.id}
                              memory={memory}
                              onEdit={() => openEditMemoryModal(memory)}
                              onDelete={deleteMemory}
                              viewMode={viewMode}
                              onFavorite={handleFavorite}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : view === 'gallery' ? (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '1.5rem',
                  padding: '2rem 2rem',
                  background: 'rgba(255,255,255,0.85)',
                  borderRadius: '1.5rem',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                  margin: '2rem 0',
                }}>
                  {filteredGalleryImages.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6b7280', fontSize: '1.25rem', padding: '2rem 0' }}>
                      No images yet. Add memories to see them here!
                    </div>
                  ) : (
                    filteredGalleryImages.map((img, idx) => (
                      <div key={img.url + idx} style={{ position: 'relative', cursor: 'pointer', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 12px #ec489933', background: '#f3f4f6', aspectRatio: '4/3', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', minHeight: 0 }}
                        onClick={() => { setLightboxImages(filteredGalleryImages.map(i => i.url)); setLightboxIndex(idx); setLightboxOpen(true); }}
                      >
                        <img
                          src={img.url}
                          alt={img.memoryTitle}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: '4/3', minHeight: 0 }}
                        />
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(0deg, #ec4899cc 60%, #ec489900 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          padding: '0.75rem 1rem 0.5rem 1rem',
                          textShadow: '0 2px 8px #0008',
                          borderBottomLeftRadius: '1.25rem',
                          borderBottomRightRadius: '1.25rem',
                          letterSpacing: '0.01em',
                          zIndex: 2,
                          pointerEvents: 'none',
                          textAlign: 'left',
                          lineHeight: 1.2
                        }}>
                          {img.memoryTitle}
                        </div>
                        {/* Gallery Favorite Heart */}
                        <button
                          onClick={e => { e.stopPropagation(); handleFavorite(img.memoryId, !(memories.find(m => m.id === img.memoryId)?.favorite)); }}
                          style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            background: 'rgba(255,255,255,0.85)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 38,
                            height: 38,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px #ec489933',
                            cursor: 'pointer',
                            zIndex: 10,
                            transition: 'background 0.18s',
                          }}
                          aria-label={memories.find(m => m.id === img.memoryId)?.favorite ? 'Unfavorite' : 'Favorite'}
                        >
                          {memories.find(m => m.id === img.memoryId)?.favorite ? (
                            <span style={{ color: '#ec4899', fontSize: '1.5rem', filter: 'drop-shadow(0 1px 4px #ec489955)' }}>♥</span>
                          ) : (
                            <span style={{ color: '#ec4899', fontSize: '1.5rem', filter: 'drop-shadow(0 1px 4px #ec489955)' }}>♡</span>
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {/* Lightbox Modal */}
                {lightboxOpen && (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      background: 'rgba(0,0,0,0.82)',
                      zIndex: 2000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setLightboxOpen(false)}
                    tabIndex={-1}
                    onKeyDown={e => { if (e.key === 'Escape') setLightboxOpen(false) }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        background: 'white',
                        borderRadius: '1.25rem',
                        boxShadow: '0 10px 32px rgba(0,0,0,0.18)',
                        padding: '1.5rem',
                        minWidth: '320px',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <img
                        src={lightboxImages[lightboxIndex]}
                        alt="Gallery Full Size"
                        style={{
                          maxWidth: '70vw',
                          maxHeight: '60vh',
                          borderRadius: '1rem',
                          marginBottom: '1rem',
                          boxShadow: '0 2px 12px #0002',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                        <button
                          onClick={e => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length) }}
                          style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: '1.5rem', cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}
                          aria-label="Previous image"
                        >
                          ‹
                        </button>
                        <span style={{ color: '#6b7280', fontWeight: 600 }}>{lightboxIndex + 1} / {lightboxImages.length}</span>
                        <button
                          onClick={e => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % lightboxImages.length) }}
                          style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: '1.5rem', cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}
                          aria-label="Next image"
                        >
                          ›
                        </button>
                      </div>
                      <button
                        onClick={() => setLightboxOpen(false)}
                        style={{ marginTop: '0.5rem', background: 'linear-gradient(to right, #ec4899, #0ea5e9)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #ec489933' }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </main>
        
        <Footer memories={memories} />
      </div>
    </ThemeProvider>
  )
}

export default App 