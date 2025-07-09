import React, { createContext, useContext, useState, useEffect } from 'react'
import { Theme, defaultThemes } from '../types/Theme'

// Only allow light themes
const lightThemes = defaultThemes.filter(t => t.type === 'light')

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
  availableThemes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Default to blush-light
  const [theme, setThemeState] = useState<Theme>(lightThemes[0])

  const setTheme = (newTheme: Theme) => {
    if (lightThemes.some(t => t.id === newTheme.id)) {
      setThemeState(newTheme)
      // Apply theme to document
      applyThemeToDocument(newTheme)
      localStorage.setItem('timestitch-theme', newTheme.id)
    }
  }

  const applyThemeToDocument = (theme: Theme) => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-secondary', theme.colors.secondary)
    root.style.setProperty('--color-accent', theme.colors.accent)
    root.style.setProperty('--color-background', theme.colors.background)
    root.style.setProperty('--color-surface', theme.colors.surface)
    root.style.setProperty('--color-text', theme.colors.text)
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--color-border', theme.colors.border)
    root.style.setProperty('--color-shadow', theme.colors.shadow)
    root.style.setProperty('--color-glass', theme.colors.glass)
    root.setAttribute('data-theme', 'light')
  }

  // On mount, check for saved theme
  useEffect(() => {
    const savedThemeId = localStorage.getItem('timestitch-theme')
    const savedTheme = lightThemes.find(t => t.id === savedThemeId)
    if (savedTheme) {
      setThemeState(savedTheme)
      applyThemeToDocument(savedTheme)
    } else {
      applyThemeToDocument(lightThemes[0])
    }
  }, [])

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark: false,
    availableThemes: lightThemes
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
} 