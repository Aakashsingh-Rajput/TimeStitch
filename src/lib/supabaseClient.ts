import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!');
  console.error('');
  console.error('To fix this issue:');
  console.error('1. Create a .env file in your project root');
  console.error('2. Add your Supabase credentials:');
  console.error('   VITE_SUPABASE_URL=your_supabase_project_url');
  console.error('   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('');
  console.error('You can find these values in your Supabase project dashboard:');
  console.error('1. Go to https://supabase.com/dashboard');
  console.error('2. Select your project');
  console.error('3. Go to Settings > API');
  console.error('4. Copy the Project URL and anon/public key');
  console.error('');
  console.error('After adding the .env file, restart your development server.');
  
  // Create a mock client for development
  if (import.meta.env.DEV) {
    console.warn('⚠️  Using mock Supabase client for development');
    console.warn('⚠️ Image uploads and database operations will not work until Supabase is configured');
    
    supabase = {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured. Please set up your environment variables.' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured. Please set up your environment variables.' } }),
        signOut: () => Promise.resolve({ error: null })
      },
      from: () => ({
        select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }) })
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }),
          download: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }),
          remove: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }),
          list: () => Promise.resolve({ data: [], error: null }),
          createBucket: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } }),
          listBuckets: () => Promise.resolve({ data: [], error: null })
        })
      }
    };
  } else {
    throw new Error('Supabase environment variables are required in production. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
} else {
  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.error('❌ Invalid Supabase URL format. URL should be: https://your-project-id.supabase.co');
  }
  
  // Validate key format (basic check)
  if (supabaseAnonKey.length < 100) {
    console.error('❌ Invalid Supabase anon key format. Please check your key in the Supabase dashboard.');
  }
  
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    throw error;
  }
}

export { supabase }; 