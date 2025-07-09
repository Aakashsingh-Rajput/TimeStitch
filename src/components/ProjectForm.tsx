import React, { useState, useEffect } from 'react'
import { Project } from '../types/Memory'

interface ProjectFormProps {
  onAddProject: (project: Omit<Project, 'id' | 'memoryCount'>) => Promise<void>
  onUpdateProject?: (project: Project) => Promise<void>
  editingProject?: Project | null
  onCancelEdit?: () => void
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  onAddProject, 
  onUpdateProject, 
  editingProject, 
  onCancelEdit 
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const allowedColors = ['blush', 'sky', 'lime', 'amber', 'rose', 'indigo'] as const;

  // Populate form when editing
  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name)
      setDescription(editingProject.description)
      setTags(editingProject.tags || [])
    } else {
      setName('')
      setDescription('')
      setTags([])
    }
  }, [editingProject])

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !description) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      if (editingProject && onUpdateProject) {
        // Update existing project
        const updatedProject: Project = {
          ...editingProject,
          name,
          description,
          color: editingProject.color,
          tags
        }
        await onUpdateProject(updatedProject)
      } else {
        // Create new project
        const color = allowedColors[(Math.floor(Date.now() / 1000) + name.length) % allowedColors.length];
        const project: Omit<Project, 'id' | 'memoryCount'> = {
          name,
          description,
          color,
          createdAt: new Date(),
          tags
        }
        await onAddProject(project)
      }
      
      // Reset form
      setName('')
      setDescription('')
      setTags([])
      
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Error saving project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit()
    }
  }

  return (
    <div
      className="memory-card"
      style={{
        background: 'rgba(255,255,255,0.82)',
        borderRadius: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(236, 72, 153, 0.10)',
        backdropFilter: 'blur(10px)',
        padding: '2rem 2.5rem',
        maxWidth: '420px',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
        {editingProject ? 'Edit Project' : 'Create New Project'}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="projectName" className="form-label">
            Project Name
          </label>
          <input
            type="text"
            id="projectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="Enter project name..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectDescription" className="form-label">
            Description
          </label>
          <textarea
            id="projectDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="form-input form-textarea"
            placeholder="Describe this project..."
            required
          />
        </div>

        {/* Tag input */}
        <div className="form-group">
          <label htmlFor="tags" className="form-label">Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {tags.map(tag => (
              <span key={tag} style={{ background: '#fdf2f8', color: '#ec4899', borderRadius: '9999px', padding: '0.25rem 0.75rem', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {tag}
                <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: '#ec4899', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', marginLeft: '0.25rem' }} aria-label={`Remove tag ${tag}`}>×</button>
              </span>
            ))}
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagInput}
              placeholder="Add tag and press Enter"
              style={{ flex: 1, minWidth: '120px', border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', color: '#ec4899', fontWeight: 500 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{
              flex: 1,
              background: 'linear-gradient(90deg, #ec4899 0%, #0ea5e9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 2px 12px 0 rgba(236, 72, 153, 0.13)',
              cursor: 'pointer',
              transition: 'transform 0.18s, box-shadow 0.18s',
              outline: 'none',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 6px 24px 0 rgba(236, 72, 153, 0.18)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 2px 12px 0 rgba(236, 72, 153, 0.13)';
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '1.25rem', height: '1.25rem', border: '2px solid #f3f4f6', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}></div>
                {editingProject ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              editingProject ? 'Update Project' : 'Create Project'
            )}
          </button>

          {editingProject && onCancelEdit && (
            <button
              type="button"
              onClick={handleCancel}
              style={{
                flex: 1,
                background: 'rgba(55,65,81,0.92)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.18s, box-shadow 0.18s',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseOut={e => e.currentTarget.style.transform = 'none'}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ProjectForm 