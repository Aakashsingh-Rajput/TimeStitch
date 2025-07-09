export interface Theme {
  id: string
  name: string
  type: 'light' | 'dark'
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    shadow: string
    glass: string
  }
}

export const defaultThemes: Theme[] = [
  {
    id: 'blush-light',
    name: 'Blush Light',
    type: 'light',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#fdf2f8',
      background: '#fefefe',
      surface: 'rgba(255,255,255,0.92)',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      shadow: 'rgba(0,0,0,0.07)',
      glass: 'rgba(255,255,255,0.75)'
    }
  },
  {
    id: 'blush-dark',
    name: 'Blush Dark',
    type: 'dark',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#1f1f2e',
      background: '#0f0f1a',
      surface: 'rgba(31,31,46,0.92)',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      shadow: 'rgba(0,0,0,0.3)',
      glass: 'rgba(31,31,46,0.75)'
    }
  },
  {
    id: 'ocean-light',
    name: 'Ocean Light',
    type: 'light',
    colors: {
      primary: '#0ea5e9',
      secondary: '#3b82f6',
      accent: '#f0f9ff',
      background: '#fefefe',
      surface: 'rgba(255,255,255,0.92)',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      shadow: 'rgba(0,0,0,0.07)',
      glass: 'rgba(255,255,255,0.75)'
    }
  },
  {
    id: 'ocean-dark',
    name: 'Ocean Dark',
    type: 'dark',
    colors: {
      primary: '#0ea5e9',
      secondary: '#3b82f6',
      accent: '#0f172a',
      background: '#020617',
      surface: 'rgba(15,23,42,0.92)',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      shadow: 'rgba(0,0,0,0.3)',
      glass: 'rgba(15,23,42,0.75)'
    }
  },
  {
    id: 'forest-light',
    name: 'Forest Light',
    type: 'light',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#f0fdf4',
      background: '#fefefe',
      surface: 'rgba(255,255,255,0.92)',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      shadow: 'rgba(0,0,0,0.07)',
      glass: 'rgba(255,255,255,0.75)'
    }
  },
  {
    id: 'forest-dark',
    name: 'Forest Dark',
    type: 'dark',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#0f1f0f',
      background: '#0a0f0a',
      surface: 'rgba(15,31,15,0.92)',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      shadow: 'rgba(0,0,0,0.3)',
      glass: 'rgba(15,31,15,0.75)'
    }
  }
]

export const getDefaultTheme = (): Theme => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? defaultThemes[1] : defaultThemes[0] // blush-dark or blush-light
} 