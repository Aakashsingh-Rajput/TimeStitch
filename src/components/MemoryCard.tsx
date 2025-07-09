import React, { useState } from 'react'
import { Memory } from '../types/Memory'

interface MemoryCardProps {
  memory: Memory
  onEdit?: (memory: Memory) => void
  onDelete?: (id: string) => void
  onFavorite?: (id: string, value: boolean) => void
  viewMode?: 'grid' | 'list'
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onEdit, onDelete, onFavorite }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(memory.id)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div
      className="memory-card"
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.75)',
        borderRadius: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(236, 72, 153, 0.10)',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        transition: 'transform 0.25s cubic-bezier(.21,1.02,.73,1), box-shadow 0.25s',
        willChange: 'transform',
        margin: '0 auto',
        cursor: 'pointer',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-8px) scale(1.025)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 48px 0 rgba(31, 38, 135, 0.22), 0 2px 12px 0 rgba(236, 72, 153, 0.13)';
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(236, 72, 153, 0.10)';
      }}
    >
      {/* Favorite Heart Button */}
      {onFavorite && (
        <button
          onClick={e => { e.stopPropagation(); onFavorite(memory.id, !memory.favorite) }}
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
          aria-label={memory.favorite ? 'Unfavorite' : 'Favorite'}
        >
          {memory.favorite ? (
            <span style={{ color: '#ec4899', fontSize: '1.5rem', filter: 'drop-shadow(0 1px 4px #ec489955)' }}>♥</span>
          ) : (
            <span style={{ color: '#ec4899', fontSize: '1.5rem', filter: 'drop-shadow(0 1px 4px #ec489955)' }}>♡</span>
          )}
        </button>
      )}
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
          opacity: 0.18,
          filter: 'blur(2px)',
          pointerEvents: 'none',
          animation: 'floatBlob 6s ease-in-out infinite alternate',
        }}
      >
        <defs>
          <linearGradient id="blobGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <path
          d="M60 20 Q90 0 120 20 Q160 40 140 80 Q120 120 80 140 Q40 160 20 120 Q0 80 20 40 Q40 20 60 20Z"
          fill="url(#blobGradient)"
        />
      </svg>
      <style>{`
        @keyframes floatBlob {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(16px) scale(1.08); }
        }
      `}</style>
      <div className="memory-content" style={{ position: 'relative', zIndex: 1 }}>
        {/* Image carousel/gallery */}
        <div className="memory-image" style={{
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 2px 12px 0 rgba(31, 38, 135, 0.10)',
          marginBottom: '1rem',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '16/9',
          minHeight: 0,
          position: 'relative',
        }}>
          {memory.imageUrls && memory.imageUrls.length > 0 && (
            <>
              <img
                src={memory.imageUrls[currentImage]}
                alt={memory.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '1rem',
                  boxShadow: '0 1px 4px 0 rgba(31, 38, 135, 0.08)'
                }}
              />
              {memory.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setCurrentImage((currentImage - 1 + memory.imageUrls.length) % memory.imageUrls.length) }}
                    style={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.7)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      zIndex: 2,
                      boxShadow: '0 2px 8px #0001',
                    }}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setCurrentImage((currentImage + 1) % memory.imageUrls.length) }}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.7)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      zIndex: 2,
                      boxShadow: '0 2px 8px #0001',
                    }}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                  <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                    {memory.imageUrls.map((_, idx) => (
                      <span key={idx} style={{ width: 8, height: 8, borderRadius: '50%', background: idx === currentImage ? '#ec4899' : '#e5e7eb', display: 'inline-block' }} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
        
        {/* Content */}
        <div className="memory-details" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <h3 className="memory-title">{memory.title}</h3>
              <span className="memory-date">
                {formatDate(memory.date)}
              </span>
            </div>
            
            <p className="memory-description" style={{ marginBottom: '0.5rem', fontSize: '1.05rem', color: '#374151', lineHeight: 1.6 }}
               dangerouslySetInnerHTML={{ __html: memory.description }} />
          </div>
          
          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              {memory.tags.map(tag => (
                <span key={tag} style={{ background: '#fdf2f8', color: '#ec4899', borderRadius: '9999px', padding: '0.25rem 0.75rem', fontWeight: 600, fontSize: '0.95rem' }}>{tag}</span>
              ))}
            </div>
          )}
          
          {/* Footer */}
          <div className="memory-footer">
            <span>
              Added on {memory.createdAt.toLocaleDateString()}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="memory-status">
                <span className="status-dot"></span>
                <span>Memory preserved</span>
              </div>
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onEdit && (
                  <button
                    onClick={() => onEdit(memory)}
                    style={{
                      background: 'linear-gradient(to right, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    ✏️ Edit
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      background: 'linear-gradient(to right, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Delete Memory?</h3>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Are you sure you want to delete "{memory.title}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background: 'linear-gradient(to right, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemoryCard 