import { beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Use process.env because Vitest injects the loaded envs there
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

beforeAll(() => {
  if (!supabaseUrl || !serviceKey) {
    console.error("Current ENV:", process.env); // Debugging line
    throw new Error("❌ Environment variables failed to load. Check .env.test");
  }
});

export const adminClient = createClient(supabaseUrl!, serviceKey!);