import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance;

if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
} else {
    console.error("Missing Supabase URL or Key in environment variables.")
    // Provide a dummy client or throw safely to avoid crashing imports?
    //createClient requires valid URL. 
    // We'll create a mock object to prevent crash on import, but auth calls will fail.
    supabaseInstance = {
        auth: {
            getUser: async () => ({ data: { user: null }, error: "Supabase not configured" }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signOut: async () => { },
            signInWithPassword: async () => ({ error: "Supabase not configured" }),
            signUp: async () => ({ error: "Supabase not configured" }),
        },
        from: () => ({ select: () => ({ eq: () => ({ execute: async () => ({ data: [] }) }) }) }), // Mock for data fetching
        storage: { from: () => ({ upload: async () => { }, getPublicUrl: () => ({ publicUrl: "" }) }) }
    }
}

export const supabase = supabaseInstance
