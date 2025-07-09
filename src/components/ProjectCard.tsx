import React, { useState, useRef, useEffect } from 'react'
import { Project } from '../types/Memory'

interface ProjectCardProps {
  project: Project
  isSelected: boolean
  onSelect: (project: Project) => void
  onEdit?: (project: Project) => void
  onDelete?: (id: string) => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const getColorGradient = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'blush': 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      'sky': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      'lime': 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%)',
      'purple': 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      'orange': 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
      'teal': 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)'
    }
    return colorMap[color] || colorMap['blush']
  }

  const getColorAccent = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'blush': '#ec4899',
      'sky': '#0ea5e9',
      'lime': '#84cc16',
      'purple': '#a855f7',
      'orange': '#f97316',
      'teal': '#14b8a6'
    }
    return colorMap[color] || colorMap['blush']
  }

  const getCardBackground = () => {
    return isSelected ? getColorGradient(project.color) : '#fff';
  };
  const getCardBorder = () => {
    return isSelected ? `2px solid ${getColorAccent(project.color)}` : '1px solid #ececec';
  };
  const getTextColor = () => '#1f2937';
  const getSubTextColor = () => '#6b7280';

  return (
    <div 
      className="project-card"
      style={{
        position: 'relative',
        background: getCardBackground(),
        border: getCardBorder(),
        borderRadius: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(236, 72, 153, 0.10)',
        backdropFilter: 'blur(8px)',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'transform 0.25s cubic-bezier(.21,1.02,.73,1), box-shadow 0.25s',
        willChange: 'transform',
        overflow: 'hidden',
        margin: '0 auto',
        width: '340px',
        minWidth: '300px',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
      onClick={e => {
        if (!menuOpen) onSelect(project)
      }}
      onMouseOver={e => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.025)';
          e.currentTarget.style.boxShadow = '0 16px 48px 0 rgba(31, 38, 135, 0.22), 0 2px 12px 0 rgba(236, 72, 153, 0.13)';
        }
      }}
      onMouseOut={e => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(236, 72, 153, 0.10)';
        }
      }}
    >
      {/* 3D Floating SVG Blob */}
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          zIndex: 0,
          opacity: 0.16,
          filter: 'blur(2px)',
          pointerEvents: 'none',
          animation: 'floatBlob 7s ease-in-out infinite alternate',
        }}
      >
        <defs>
          <linearGradient id="blobGradientProject" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <path
          d="M60 20 Q90 0 120 20 Q160 40 140 80 Q120 120 80 140 Q40 160 20 120 Q0 80 20 40 Q40 20 60 20Z"
          fill="url(#blobGradientProject)"
        />
      </svg>
      <style>{`
        @keyframes floatBlob {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(16px) scale(1.08); }
        }
      `}</style>

      {/* Decorative corner accent */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '0 2rem 2rem 0',
          borderColor: `transparent ${getColorAccent(project.color)} transparent transparent`,
          opacity: isSelected ? 1 : 0.3
        }}
      />

      {/* Project icon with always-visible colored circle */}
      <div 
        style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          fontSize: '1.5rem',
          boxShadow: '0 2px 8px #ec489933',
          border: 'none',
        }}
      >
        <span>📁</span>
      </div>

      {/* Project info */}
      <h3 
        style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: getTextColor(),
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        {project.name}
        {isSelected && (
          <span style={{ fontSize: '1rem', color: getColorAccent(project.color) }}>
            ✓
          </span>
        )}
      </h3>

      <p 
        style={{
          color: getSubTextColor(),
          fontSize: '0.875rem',
          marginBottom: '1rem',
          lineHeight: '1.4'
        }}
      >
        {project.description}
      </p>

      {/* Memory count */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}
      >
        <span 
          style={{
            background: getColorAccent(project.color),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}
        >
          {project.memoryCount} {project.memoryCount === 1 ? 'memory' : 'memories'}
        </span>
        <span 
          style={{
            fontSize: '0.75rem',
            color: getSubTextColor()
          }}
        >
          Created {project.createdAt.toLocaleDateString()}
        </span>
      </div>
      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {project.tags.map(tag => (
            <span key={tag} style={{ background: '#fdf2f8', color: '#ec4899', borderRadius: '9999px', padding: '0.25rem 0.75rem', fontWeight: 600, fontSize: '0.95rem' }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Three Dots Menu */}
      <div
        style={{
          position: 'absolute',
          top: '1.1rem',
          right: '1.1rem',
          zIndex: 10,
        }}
        onClick={e => {
          e.stopPropagation()
          setMenuOpen(v => !v)
        }}
      >
        <span
          style={{
            fontSize: '1.5rem',
            color: '#64748b',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '50%',
            background: menuOpen ? 'rgba(236,72,153,0.08)' : 'transparent',
            transition: 'background 0.18s',
            boxShadow: menuOpen ? '0 2px 8px #ec489933' : 'none',
            userSelect: 'none',
          }}
          aria-label="Project actions"
        >
          &#8942;
        </span>
        {menuOpen && (
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: '2.2rem',
              right: 0,
              minWidth: '120px',
              background: 'rgba(255,255,255,0.98)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
              borderRadius: '0.75rem',
              padding: '0.5rem 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              zIndex: 100,
              animation: 'fadeInMenu 0.18s',
            }}
          >
            {onEdit && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onEdit(project)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0ea5e9',
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '0.5rem 1.25rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(14,165,233,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onDelete(project.id)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '0.5rem 1.25rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectCard 