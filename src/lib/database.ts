import { supabase } from './supabaseClient';
import { Project, Memory, GalleryImage } from '@/hooks/useTimeStitch';

// Database schema types
export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  is_public: boolean;
  collaborators: string[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseMemory {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseImage {
  id: string;
  memory_id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  created_at: string;
}

// Database service class
export class DatabaseService {
  // Project operations
  static async createProject(project: Omit<Project, 'id' | 'memoryCount' | 'imageCount' | 'createdDate'>): Promise<Project> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.user.id,
        name: project.name,
        description: project.description,
        color: project.color,
        is_public: project.isPublic || false,
        collaborators: project.collaborators || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      memoryCount: 0,
      imageCount: 0,
      color: data.color,
      createdDate: new Date(data.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      collaborators: data.collaborators,
      isPublic: data.is_public
    };
  }

  static async getProjects(): Promise<Project[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        memories:memories(count),
        images:memories(images(count))
      `)
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      memoryCount: project.memories?.[0]?.count || 0,
      imageCount: project.images?.reduce((total: number, memory: any) => 
        total + (memory.images?.[0]?.count || 0), 0) || 0,
      color: project.color,
      createdDate: new Date(project.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      collaborators: project.collaborators,
      isPublic: project.is_public
    }));
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        color: updates.color,
        is_public: updates.isPublic,
        collaborators: updates.collaborators,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      memoryCount: updates.memoryCount || 0,
      imageCount: updates.imageCount || 0,
      color: data.color,
      createdDate: new Date(data.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      collaborators: data.collaborators,
      isPublic: data.is_public
    };
  }

  static async deleteProject(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) throw error;
  }

  // Memory operations
  static async createMemory(memory: Omit<Memory, 'id'>): Promise<Memory> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('memories')
      .insert({
        user_id: user.user.id,
        project_id: memory.projectId,
        title: memory.title,
        description: memory.description,
        date: memory.date,
        location: memory.location,
        tags: memory.tags,
        is_favorite: memory.isFavorite,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: data.date,
      images: [], // Will be populated by storage service
      isFavorite: data.is_favorite,
      tags: data.tags,
      projectId: data.project_id,
      location: data.location,
      createdBy: data.user_id
    };
  }

  static async getMemories(projectId?: string): Promise<Memory[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    let query = supabase
      .from('memories')
      .select(`
        *,
        images:images(url)
      `)
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(memory => ({
      id: memory.id,
      title: memory.title,
      description: memory.description,
      date: memory.date,
      images: memory.images?.map((img: any) => img.url) || [],
      isFavorite: memory.is_favorite,
      tags: memory.tags,
      projectId: memory.project_id,
      location: memory.location,
      createdBy: memory.user_id
    }));
  }

  static async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('memories')
      .update({
        project_id: updates.projectId,
        title: updates.title,
        description: updates.description,
        date: updates.date,
        location: updates.location,
        tags: updates.tags,
        is_favorite: updates.isFavorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: data.date,
      images: updates.images || [],
      isFavorite: data.is_favorite,
      tags: data.tags,
      projectId: data.project_id,
      location: data.location,
      createdBy: data.user_id
    };
  }

  static async deleteMemory(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) throw error;
  }

  static async toggleMemoryFavorite(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // First get the current favorite status
    const { data: currentMemory } = await supabase
      .from('memories')
      .select('is_favorite')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .single();

    if (!currentMemory) throw new Error('Memory not found');

    // Toggle the favorite status
    const { error } = await supabase
      .from('memories')
      .update({ 
        is_favorite: !currentMemory.is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) throw error;
  }
}

// SQL for creating tables (run this in Supabase SQL editor)
export const CREATE_TABLES_SQL = `
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  color VARCHAR(20) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  collaborators TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(200),
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_project_id ON memories(project_id);
CREATE INDEX IF NOT EXISTS idx_images_memory_id ON images(memory_id);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own memories" ON memories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories" ON memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" ON memories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" ON memories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view images from their memories" ON images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = images.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert images to their memories" ON images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = images.memory_id 
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images from their memories" ON images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = images.memory_id 
      AND memories.user_id = auth.uid()
    )
  );
`; 