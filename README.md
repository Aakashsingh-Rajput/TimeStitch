# TimeStitch

**TimeStitch** is a modern, single-page photo log app built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**. It lets users upload, organize, and view project memories with images, titles, dates, and descriptions — like a digital scrapbook.

## Tech Stack
- React + TypeScript
- Tailwind CSS
- Supabase (Database + Storage)
- Vite

## Features
- Upload and store images via Supabase Storage
- Save memory entries with title, date & description
- View memories in a responsive, animated gallery
- Clean, soft, mobile-first design
- Project organization and tagging
- Real-time collaboration features
- Offline support

## Setup

###1. Clone the repo & install dependencies
```bash
git clone <repo> && cd TimeStitch && npm install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to your project dashboard3gate to **Settings** > **API**
4. Copy the **Project URL** and **anon/public key**

### 3. Configure Environment Variables
Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DEBUG=true
```

### 4. Set up Database1o to your Supabase project dashboard2 Navigate to **SQL Editor**3Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute the script

### 5. Start the development server
```bash
npm run dev
```

## Troubleshooting

### Image Upload Issues
If you're unable to upload images when adding memories:

1. **Check Environment Variables**: Ensure your `.env` file exists and has the correct Supabase credentials
2. **Verify Database Setup**: Make sure you've run the `supabase-setup.sql` script
3eck Console Errors**: Look for any error messages in the browser console
4. **Restart Development Server**: After adding environment variables, restart your dev server

### Common Error Messages
- **"Supabase not configured"**: Missing or incorrect environment variables
- **"User not authenticated**:User needs to sign in first
- **Bucket not found"**: Storage bucket will be created automatically on first upload

## Deployment
- Deploy easily on **Vercel** or any other platform
- Make sure to set the environment variables in your deployment platform

## Documentation
For detailed setup instructions, see:
- `DATABASE_SETUP.md` - Complete database setup guide
- `SUPABASE_CONFIG.md` - Supabase configuration guide
- `DOCUMENTATION.md` - Full application documentation

