import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--color-glass)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--color-text)',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px var(--color-shadow)'
        }}
        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span style={{ fontSize: '1.25rem' }}>🌞</span>
        <span>{theme.name}</span>
        <span
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '1rem',
            padding: '1rem',
            minWidth: '220px',
            boxShadow: '0 10px 25px var(--color-shadow)',
            backdropFilter: 'blur(12px)',
            zIndex: 1000
          }}
        >
          {availableThemes.map(themeOption => (
            <button
              key={themeOption.id}
              onClick={() => {
                setTheme(themeOption)
                setIsOpen(false)
              }}
              style={{
                width: '100%',
                background: theme.id === themeOption.id ? 'var(--color-primary)' : 'var(--color-accent)',
                color: theme.id === themeOption.id ? 'white' : 'var(--color-text)',
                border: `2px solid ${theme.id === themeOption.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: '0.5rem',
                padding: '0.75rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'flex-start'
              }}
              onMouseOver={e => {
                if (theme.id !== themeOption.id) {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.background = 'var(--color-accent)'
                }
              }}
              onMouseOut={e => {
                if (theme.id !== themeOption.id) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.background = 'var(--color-accent)'
                }
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🌞</span>
              <span>{themeOption.name}</span>
            </button>
          ))}
        </div>
      )}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ThemeSelector 