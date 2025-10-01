import { createClient } from '@supabase/supabase-js';

// We get the environment variables.
let supabaseUrl = process.env.SUPABASE_URL;
let supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// If the environment variables are not set (e.g., in a local dev environment),
// we provide non-functional placeholders to prevent the app from crashing.
// A warning is logged to alert the developer.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Warning: Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not set. " +
    "The application is using placeholder credentials and will not connect to a database. " +
    "Please set these variables in your environment for full functionality."
  );
  supabaseUrl = "https://placeholder.supabase.co";
  supabaseAnonKey = "placeholder-anon-key";
}

// Create and export the Supabase client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
