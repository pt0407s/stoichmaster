// Supabase Configuration
// Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

const SUPABASE_CONFIG = {
    url: 'https://exchbjrhcgjugjesypvq.supabase.co', // e.g., 'https://xxxxx.supabase.co'
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Y2hianJoY2dqdWdqZXN5cHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTUyMTUsImV4cCI6MjA4NTgzMTIxNX0.7H6aHe6PsZbskxnN_m6EXIGHv3GtbIcc-OdOFFAP2P4' // Your public anon key
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG };
}
