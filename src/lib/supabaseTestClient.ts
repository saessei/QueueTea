import { createClient } from '@supabase/supabase-js'

// MUST match the VITE_ prefix used in your .env.test and config
const supabaseUrl = process.env.VITE_SUPABASE_URL 
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY 

if (!supabaseKey) {
  throw new Error("API Key is missing in supabaseTestClient!");
}

export const supabaseTest = createClient(supabaseUrl!, supabaseKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

export const supabaseAdmin = createClient(supabaseUrl!, supabaseKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})