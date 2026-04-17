// src/lib/supabaseTestClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

export const supabaseTest = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Important: prevents state leaking between tests
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})