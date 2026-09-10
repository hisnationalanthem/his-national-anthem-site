(() => {
  const config = window.APP_CONFIG;

  if (
    !config ||
    !config.SUPABASE_URL ||
    !config.SUPABASE_PUBLISHABLE_KEY
  ) {
    console.error("Supabase configuration is missing.");
    return;
  }

  if (!window.supabase || !window.supabase.createClient) {
    console.error("Supabase JavaScript library failed to load.");
    return;
  }

  window.supabaseClient = window.supabase.createClient(
    config.SUPABASE_URL,
    config.SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  console.log("Supabase client initialized.");
})();
