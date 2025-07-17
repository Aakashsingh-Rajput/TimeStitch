# Supabase Configuration Guide

## Environment Variables Setup

To enable image uploads and database functionality, you need to configure your Supabase environment variables.

### 1eate a `.env` file in your project root with the following content:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DEBUG=true
```

### 2. Get Your Supabase Credentials

1Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** > **API**
4. Copy the **Project URL** and **anon/public key**
5. Replace the placeholder values in your `.env` file

###3. Database Setup
1o to your Supabase project dashboard2 Navigate to **SQL Editor**3Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute the script

### 4Storage Setup

The application will automatically create the required storage bucket when you first upload an image.

### 5. Restart Your Development Server

After setting up the environment variables, restart your development server:

```bash
npm run dev
# or
bun dev
```

## Troubleshooting

### "Supabase not configured" error
- Make sure your `.env` file exists and has the correct values
- Verify that the environment variables are being loaded (check browser console)
- Restart your development server after adding the `.env` file

### "User not authenticated" error
- Make sure you're signed in to the application
- Check that the auth flow is working properly

### Bucket not found" error
- The storage bucket will be created automatically on first upload
- If issues persist, manually create a bucket named memories in yourSupabase dashboard

### Image upload fails
- Check file size (max10er image)
- Verify file type is supported (JPEG, PNG, GIF, WebP, HEIC, HEIF)
- Ensure you have proper permissions in your Supabase project 