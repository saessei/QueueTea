import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL 
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY 
// 1. Get the Service Role Key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY 

if (!supabaseKey || !serviceRoleKey) {
  throw new Error("Missing API Keys in supabaseTestClient!");
}

// Client for simulating a NORMAL user (Barista)
export const supabaseTest = createClient(supabaseUrl!, supabaseKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

export const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})