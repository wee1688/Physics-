/**
 * Centralized App Configuration
 * 
 * Provides runtime access to environment variables.
 * Ensures consistent configuration across the app.
 */

export const getSupabaseConfig = () => {
    // In a Vite environment, these are populated at build time.
    // In production, these should be set via environment variables on your hosting platform.
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!url || !key) {
        console.warn("[AppConfig] Supabase environment variables are missing");
    }

    return { url, key };
};
