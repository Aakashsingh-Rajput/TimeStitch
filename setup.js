#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 TimeStitch Setup Guide\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file found');
  
  // Read and validate .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('✅ Supabase environment variables are configured');
  } else {
    console.log('❌ Supabase environment variables are missing or incomplete');
    console.log('Please check your .env file and ensure it contains:');
    console.log('VITE_SUPABASE_URL=your_supabase_project_url');
    console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  }
} else {
  console.log('❌ .env file not found');
  console.log('Creating .env file...\n');
  
  rl.question('Enter your Supabase Project URL: ', (supabaseUrl) => {
    rl.question('Enter your Supabase Anon Key: ', (supabaseKey) => {
      const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}
VITE_DEBUG=true
`;
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created successfully');
      console.log('\nNext steps:');
      console.log('1. Run the database setup script in your Supabase dashboard');
      console.log('2. Restart your development server');
      console.log('3. Test image uploads in the application');
      
      rl.close();
    });
  });
  
  return;
}

// Check if supabase-setup.sql exists
const sqlPath = path.join(process.cwd(), 'supabase-setup.sql');
if (fs.existsSync(sqlPath)) {
  console.log('✅ Database setup script found');
} else {
  console.log('❌ Database setup script not found');
}

console.log('\n📋 Setup Checklist:');
console.log('□ Create Supabase project at https://supabase.com');
console.log('□ Copy Project URL and Anon Key to .env file');
console.log('□ Run supabase-setup.sql in Supabase SQL Editor');
console.log('□ Restart development server');
console.log('□ Test image uploads');

console.log('\n🔧 To start the development server:');
console.log('npm run dev');

console.log('\n📚 For detailed instructions, see:');
console.log('- DATABASE_SETUP.md');
console.log('- SUPABASE_CONFIG.md');
console.log('- README.md');

rl.close(); 