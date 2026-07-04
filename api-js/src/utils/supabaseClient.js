require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is missing. Ensure they are set in .env for production.');
}

// We use the service role key on the backend to bypass RLS for admin operations 
// if needed, or anon key for standard operations.
const supabase = createClient(supabaseUrl || 'http://localhost:54321', supabaseKey || 'placeholder');

module.exports = supabase;
