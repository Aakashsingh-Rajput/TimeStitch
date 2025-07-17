# TimeStitch Database & Storage Setup Guide

This guide will help you set up the complete database and storage functionality for TimeStitch using Supabase.

## 🚀 Quick Setup

### 1. Supabase Project Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Configure Environment Variables**
   - Create a `.env` file in your project root
   - Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 2. Database Setup

1. **Run the SQL Setup Script**
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase-setup.sql`
   - Click "Run" to execute the script

2. **Verify Tables Created**
   - Go to Table Editor in Supabase
   - You should see these tables:
     - `projects`
     - `memories`
     - `images`
     - `profiles` (for user profiles)

### 3. Storage Setup

1. **Create Storage Bucket**
   - Go to Storage in your Supabase Dashboard
   - The application will automatically create a `memories` bucket
   - Or manually create it with these settings:
     - Name: `memories`
     - Public: `false`
     - File size limit: `10MB`
     - Allowed MIME types: `image/*`

2. **Configure Storage Policies**
   - The SQL script includes RLS policies for storage
   - Users can only access their own images

## 📊 Database Schema

### Projects Table
```sql
projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(100),
  description TEXT,
  color VARCHAR(20),
  is_public BOOLEAN,
  collaborators TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Memories Table
```sql
memories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  title VARCHAR(200),
  description TEXT,
  date DATE,
  location VARCHAR(200),
  tags TEXT[],
  is_favorite BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Images Table
```sql
images (
  id UUID PRIMARY KEY,
  memory_id UUID REFERENCES memories(id),
  url TEXT,
  filename VARCHAR(255),
  size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP
)
```

## 🔐 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Automatic user isolation

### Storage Security
- Images are stored in user-specific folders
- Access controlled by RLS policies
- File type and size validation

## 🛠️ API Functions

The setup includes several PostgreSQL functions:

### `get_project_stats(project_uuid)`
Returns statistics for a specific project:
- Memory count
- Image count
- Favorite count
- Total size

### `search_memories(search_query, project_uuid)`
Full-text search across memories:
- Searches title, description, location, and tags
- Optional project filtering
- Returns ranked results

### `get_user_storage_stats()`
Returns user storage statistics:
- Total size used
- File count
- Memory count
- Project count

## 📁 File Structure

```
src/lib/
├── database.ts      # Database operations
├── storage.ts       # File storage operations
├── dataService.ts   # Combined service layer
└── supabaseClient.ts # Supabase client configuration
```

## 🔧 Usage Examples

### Creating a Project
```typescript
import { DataService } from '@/lib/dataService';

const project = await DataService.createProject({
  name: 'My Project',
  description: 'Project description',
  color: 'blue',
  isPublic: false
});
```

### Creating a Memory with Images
```typescript
const memory = await DataService.createMemory({
  title: 'My Memory',
  description: 'Memory description',
  date: '2024-01-15',
  projectId: project.id,
  tags: ['tag1', 'tag2']
}, imageFiles);
```

### Uploading Images
```typescript
import { StorageService } from '@/lib/storage';

const uploadResults = await StorageService.uploadImages(files, memoryId);
```

## 🚨 Important Notes

### Environment Variables
Make sure your environment variables are set correctly:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Storage Limits
- Maximum file size: 10MB per image
- Supported formats: JPEG, PNG, GIF, WebP, HEIC, HEIF
- Automatic image optimization available

### Performance
- Indexes created for optimal query performance
- Full-text search enabled
- Automatic timestamp updates

## 🔍 Troubleshooting

### Common Issues

1. **"User not authenticated" error**
   - Ensure user is logged in
   - Check auth state in your app

2. **"Bucket not found" error**
   - Run the storage initialization in your app
   - Check bucket permissions

3. **"Policy violation" error**
   - Verify RLS policies are active
   - Check user ownership of data

4. **Image upload fails**
   - Check file size (max 10MB)
   - Verify file type is supported
   - Ensure storage bucket exists

### Debug Mode
Enable debug logging by adding to your environment:
```env
VITE_DEBUG=true
```

## 📈 Monitoring

### Database Monitoring
- Use Supabase Dashboard for query performance
- Monitor storage usage
- Check RLS policy effectiveness

### Storage Monitoring
- Track file uploads/downloads
- Monitor storage costs
- Check for orphaned files

## 🔄 Migration

If you need to modify the schema:

1. **Backup your data**
2. **Create migration scripts**
3. **Test in development first**
4. **Apply to production**

## 📞 Support

For issues with:
- **Database**: Check Supabase logs
- **Storage**: Verify bucket configuration
- **Authentication**: Review RLS policies
- **Performance**: Monitor query execution plans

## 🎯 Next Steps

After setup:
1. Test the authentication flow
2. Create a test project and memory
3. Upload some test images
4. Verify all CRUD operations work
5. Test search functionality
6. Monitor performance

Your TimeStitch application is now ready with full database and storage functionality! 🎉 