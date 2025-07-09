import React, { useState, useEffect } from 'react'
import { Memory, Project } from '../types/Memory'

interface UploadFormProps {
  onAddMemory: (memory: Omit<Memory, 'id'>) => Promise<void>
  onUpdateMemory?: (memory: Memory) => Promise<void>
  editingMemory?: Memory | null
  onCancelEdit?: () => void
  projects: Project[]
  selectedProjectId?: string
}

const UploadForm: React.FC<UploadFormProps> = ({ 
  onAddMemory, 
  onUpdateMemory, 
  editingMemory, 
  onCancelEdit,
  projects,
  selectedProjectId
}) => {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState(selectedProjectId || '')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const descriptionRef = React.useRef<HTMLDivElement>(null)

  // Populate form when editing
  useEffect(() => {
    if (editingMemory) {
      setTitle(editingMemory.title)
      setDate(editingMemory.date)
      setDescription(editingMemory.description)
      if (descriptionRef.current) descriptionRef.current.innerHTML = editingMemory.description || ''
      setProjectId(editingMemory.projectId)
      setImagePreviews(editingMemory.imageUrls || [])
      setImages([])
      setTags(editingMemory.tags || [])
    } else {
      // Reset form when not editing
      setTitle('')
      setDate('')
      setDescription('')
      if (descriptionRef.current) descriptionRef.current.innerHTML = ''
      setProjectId(selectedProjectId || '')
      setImages([])
      setImagePreviews([])
      setTags([])
    }
  }, [editingMemory, selectedProjectId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(files)
    if (files.length > 0) {
      Promise.all(files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })).then(setImagePreviews)
    } else {
      setImagePreviews([])
    }
  }

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
    if (!title || !date || !description || !projectId || (images.length === 0 && imagePreviews.length === 0)) {
      alert('Please fill in all fields, select a project, and select at least one image')
      return
    }

    setLoading(true)
    try {
      // Use new images if uploaded, otherwise keep existing
      const imageUrls = imagePreviews
      
      if (editingMemory && onUpdateMemory) {
        // Update existing memory
        const updatedMemory: Memory = {
          ...editingMemory,
          title,
          date,
          description,
          projectId,
          imageUrls,
          tags
        }
        await onUpdateMemory(updatedMemory)
      } else {
        // Create new memory
        const memory: Omit<Memory, 'id'> = {
          title,
          date,
          description,
          projectId,
          imageUrls,
          createdAt: new Date(),
          tags
        }
        await onAddMemory(memory)
      }
      
      // Reset form
      setTitle('')
      setDate('')
      setDescription('')
      setImages([])
      setImagePreviews([])
      setTags([])
      
    } catch (error) {
      console.error('Error saving memory:', error)
      alert('Error saving memory. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit()
    }
  }

  // Rich text toolbar actions
  const format = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    setDescription(descriptionRef.current?.innerHTML || '')
  }

  return (
    <div className="memory-card">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
        {editingMemory ? 'Edit Memory' : 'Add New Memory'}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            placeholder="Enter memory title..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date" className="form-label">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          {/* Rich text toolbar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button type="button" onClick={() => format('bold')} style={{ fontWeight: 700, color: '#ec4899', background: '#fdf2f8', border: 'none', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', cursor: 'pointer' }}>B</button>
            <button type="button" onClick={() => format('italic')} style={{ fontStyle: 'italic', color: '#ec4899', background: '#fdf2f8', border: 'none', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', cursor: 'pointer' }}>I</button>
            <button type="button" onClick={() => { const url = prompt('Enter link URL:'); if (url) format('createLink', url) }} style={{ color: '#ec4899', background: '#fdf2f8', border: 'none', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', cursor: 'pointer' }}>🔗</button>
          </div>
          <div
            id="description"
            ref={descriptionRef}
            contentEditable
            suppressContentEditableWarning
            onInput={e => setDescription((e.target as HTMLDivElement).innerHTML)}
            className="form-input form-textarea"
            style={{ minHeight: '100px', background: 'white', border: '1px solid #d8d0d0', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '1rem', outline: 'none', marginBottom: 0 }}
            placeholder="Describe this memory..."
            required={true}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="project" className="form-label">
            Project
          </label>
          <select
            id="project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="form-input"
            required
          >
            <option value="">Select a project...</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">
            Images {editingMemory && <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>(optional - keep current)</span>}
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="form-input form-file"
            required={!editingMemory}
          />
        </div>

        {imagePreviews.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {imagePreviews.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Preview ${idx + 1}`}
                style={{ width: '6rem', height: '6rem', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #ede8e8' }}
              />
            ))}
          </div>
        )}

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
            style={{ flex: 1 }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '1.25rem', height: '1.25rem', border: '2px solid #f3f4f6', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}></div>
                {editingMemory ? 'Updating...' : 'Adding Memory...'}
              </div>
            ) : (
              editingMemory ? 'Update Memory' : 'Add Memory'
            )}
          </button>

          {editingMemory && onCancelEdit && (
            <button
              type="button"
              onClick={handleCancel}
              style={{
                flex: 1,
                background: '#6b7280',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default UploadForm 