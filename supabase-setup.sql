-- TimeStitch Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_project_id ON memories(project_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_date ON memories(date DESC);
CREATE INDEX IF NOT EXISTS idx_memories_is_favorite ON memories(is_favorite);
CREATE INDEX IF NOT EXISTS idx_images_memory_id ON images(memory_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_memories_search ON memories USING gin(to_tsvector('english', title || ' ' || description));

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

DROP POLICY IF EXISTS "Users can view their own memories" ON memories;
DROP POLICY IF EXISTS "Users can insert their own memories" ON memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete their own memories" ON memories;

DROP POLICY IF EXISTS "Users can view images from their memories" ON images;
DROP POLICY IF EXISTS "Users can insert images to their memories" ON images;
DROP POLICY IF EXISTS "Users can delete images from their memories" ON images;

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for memories
CREATE POLICY "Users can view their own memories" ON memories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories" ON memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" ON memories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" ON memories
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for images
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

CREATE POLICY "Users can update images from their memories" ON images
  FOR UPDATE USING (
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

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_memories_updated_at ON memories;
CREATE TRIGGER update_memories_updated_at
    BEFORE UPDATE ON memories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get project statistics
CREATE OR REPLACE FUNCTION get_project_stats(project_uuid UUID)
RETURNS TABLE (
  memory_count BIGINT,
  image_count BIGINT,
  favorite_count BIGINT,
  total_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT m.id)::BIGINT as memory_count,
    COUNT(i.id)::BIGINT as image_count,
    COUNT(CASE WHEN m.is_favorite THEN 1 END)::BIGINT as favorite_count,
    COALESCE(SUM(i.size), 0)::BIGINT as total_size
  FROM projects p
  LEFT JOIN memories m ON m.project_id = p.id
  LEFT JOIN images i ON i.memory_id = m.id
  WHERE p.id = project_uuid
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search memories
CREATE OR REPLACE FUNCTION search_memories(
  search_query TEXT,
  project_uuid UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(200),
  description TEXT,
  date DATE,
  location VARCHAR(200),
  tags TEXT[],
  is_favorite BOOLEAN,
  project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.description,
    m.date,
    m.location,
    m.tags,
    m.is_favorite,
    m.project_id,
    m.created_at,
    m.updated_at
  FROM memories m
  WHERE m.user_id = auth.uid()
    AND (project_uuid IS NULL OR m.project_id = project_uuid)
    AND (
      m.title ILIKE '%' || search_query || '%'
      OR m.description ILIKE '%' || search_query || '%'
      OR m.location ILIKE '%' || search_query || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(m.tags) tag
        WHERE tag ILIKE '%' || search_query || '%'
      )
    )
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user storage statistics
CREATE OR REPLACE FUNCTION get_user_storage_stats()
RETURNS TABLE (
  total_size BIGINT,
  file_count BIGINT,
  memory_count BIGINT,
  project_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(i.size), 0)::BIGINT as total_size,
    COUNT(i.id)::BIGINT as file_count,
    COUNT(DISTINCT m.id)::BIGINT as memory_count,
    COUNT(DISTINCT p.id)::BIGINT as project_count
  FROM auth.users u
  LEFT JOIN projects p ON p.user_id = u.id
  LEFT JOIN memories m ON m.user_id = u.id
  LEFT JOIN images i ON i.memory_id = m.id
  WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create storage bucket (this will be handled by the application)
-- The application will create the 'memories' bucket automatically

-- Insert sample data (optional - for testing)
-- Uncomment the following lines if you want to insert sample data

/*
INSERT INTO projects (user_id, name, description, color, is_public) VALUES
  (auth.uid(), 'Website Redesign', 'Complete overhaul of our company website with modern design principles and improved user experience', 'blue', false),
  (auth.uid(), 'Mobile App Launch', 'Development and launch of our new mobile application for iOS and Android platforms', 'purple', true),
  (auth.uid(), 'Team Building Retreat', 'Annual team building activities and strategic planning sessions in the mountains', 'green', false),
  (auth.uid(), 'Product Launch', 'Major product launch event with press coverage and customer demonstrations', 'orange', true);

INSERT INTO memories (user_id, project_id, title, description, date, location, tags, is_favorite) VALUES
  (auth.uid(), (SELECT id FROM projects WHERE name = 'Website Redesign' LIMIT 1), 'Design System Creation', 'We spent weeks creating a comprehensive design system that would serve as the foundation for our entire project.', '2024-01-20', 'New York Office', ARRAY['design', 'system', 'milestone'], true),
  (auth.uid(), (SELECT id FROM projects WHERE name = 'Mobile App Launch' LIMIT 1), 'First MVP Demo', 'Our first working prototype demo to stakeholders. The excitement in the room was palpable.', '2024-02-15', 'Conference Room A', ARRAY['mvp', 'demo', 'prototype'], true),
  (auth.uid(), (SELECT id FROM projects WHERE name = 'Team Building Retreat' LIMIT 1), 'Team Hiking Adventure', 'Nothing builds team spirit like conquering a mountain together.', '2024-03-15', 'Blue Ridge Mountains', ARRAY['team', 'hiking', 'adventure'], true);
*/

-- Success message
SELECT 'TimeStitch database setup completed successfully!' as status; 