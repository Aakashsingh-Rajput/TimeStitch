#  TimeStitch

**TimeStitch** is a modern, single-page photo log app built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**. It lets users upload, organize, and view project memories with images, titles, dates, and descriptions — like a digital scrapbook.

##  Tech Stack
- React + TypeScript
- Tailwind CSS
- Supabase (Database + Storage)
- Vite

##  Features
- Upload and store images via Supabase Storage
- Save memory entries with title, date & description
- View memories in a responsive, animated gallery
- Clean, soft, mobile-first design

##  Setup
1. Clone the repo & install dependencies  
   `git clone <repo> && cd TimeStitch && npm install`

2. Create a project at [supabase.com](https://supabase.com)  
   - Add a `memories` table and a storage bucket  
   - Add `.env`:
     ```
     VITE_SUPABASE_URL=your-url
     VITE_SUPABASE_ANON_KEY=your-key
     ```

3. Start the dev server  
   `npm run dev`

##  Deployment
- Deploy easily on **Vercel** 

