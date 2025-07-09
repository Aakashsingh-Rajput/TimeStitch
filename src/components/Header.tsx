import React from 'react'
import ThemeSelector from './ThemeSelector'

interface HeaderProps {
  view: 'projects' | 'memories' | 'gallery'
  onViewChange: (view: 'projects' | 'memories' | 'gallery') => void
  onAddProject: () => void
  onAddMemory: () => void
  search: string
  setSearch: (s: string) => void
  allTags: string[]
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  showFavoritesOnly: boolean
  setShowFavoritesOnly: (v: boolean) => void
  projectTab: string
}

const Header: React.FC<HeaderProps> = ({
  view, onViewChange, onAddProject, onAddMemory,
  search, setSearch, allTags, selectedTags, setSelectedTags,
  showFavoritesOnly, setShowFavoritesOnly, projectTab
}) => {
  return (
    <header className="header">
      <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 className="logo">TimeStitch</h1>
          <div className="nav-tabs">
            <button
              className={`nav-tab ${view === 'projects' ? 'active' : ''}`}
              onClick={() => onViewChange('projects')}
            >
              📁 Projects
            </button>
            <button
              className={`nav-tab ${view === 'memories' ? 'active' : ''}`}
              onClick={() => onViewChange('memories')}
            >
              📸 Memories
            </button>
            <button
              className={`nav-tab ${view === 'gallery' ? 'active' : ''}`}
              onClick={() => onViewChange('gallery')}
            >
              🖼️ Gallery
            </button>
          </div>
        </div>
        {/* Search Bar and Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: 600, marginLeft: '2rem' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, description, or tag..."
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid #ede8e8',
              fontSize: '1rem',
              minWidth: '180px',
              maxWidth: '320px',
              boxShadow: '0 1px 4px #ec489911',
              outline: 'none',
              color: '#ec4899',
              fontWeight: 500,
              flex: 1
            }}
          />
          {/* Tag Filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag])}
                style={{
                  background: selectedTags.includes(tag) ? 'linear-gradient(to right, #ec4899, #0ea5e9)' : '#fdf2f8',
                  color: selectedTags.includes(tag) ? 'white' : '#ec4899',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.35rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  boxShadow: selectedTags.includes(tag) ? '0 2px 8px #ec489933' : 'none',
                  transition: 'all 0.18s',
                }}
                aria-pressed={selectedTags.includes(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
          {/* Favorites Toggle: Only show in gallery views */}
          {(view === 'gallery' || (view === 'memories' && projectTab === 'gallery')) && (
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              style={{
                background: showFavoritesOnly ? 'linear-gradient(to right, #ec4899, #0ea5e9)' : '#fdf2f8',
                color: showFavoritesOnly ? 'white' : '#ec4899',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.35rem 1.1rem',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: showFavoritesOnly ? '0 2px 8px #ec489933' : 'none',
                transition: 'all 0.18s',
                marginLeft: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              aria-pressed={showFavoritesOnly}
            >
              {showFavoritesOnly ? '♥' : '♡'} Favorites
            </button>
          )}
        </div>
        {/* Action Buttons */}
        <div className="action-buttons">
          {view === 'projects' && (
            <button className="btn-primary" onClick={onAddProject}>
              + Add Project
            </button>
          )}
          {view === 'memories' && (
            <button className="btn-primary" onClick={onAddMemory}>
              + Add Memory
            </button>
          )}
          <ThemeSelector />
        </div>
      </div>
    </header>
  )
}

export default Header 