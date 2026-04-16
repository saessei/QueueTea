/// <reference types="vite/client" />

declare module "*.css" {
  // Use a string record instead of 'any'
  const content: Record<string, string>;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />