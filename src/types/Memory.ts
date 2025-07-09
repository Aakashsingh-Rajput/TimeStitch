export interface Memory {
  id: string
  title: string
  date: string
  description: string
  imageUrls: string[]
  createdAt: Date
  projectId: string // Reference to the project/folder
  tags?: string[]
  favorite?: boolean
}

export interface Project {
  id: string
  name: string
  description: string
  color: 'blush' | 'sky' | 'lime' | 'amber' | 'rose' | 'indigo'
  createdAt: Date
  memoryCount: number
  tags?: string[]
} 