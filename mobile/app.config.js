/**
 * Dynamic Expo config — injects environment variables into `extra` so the app
 * can read them via `Constants.expoConfig.extra` (see lib/supabase.ts).
 *
 * Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in a
 * .env file (see .env.example) or in your EAS build environment.
 *
 * The static base lives in app.json; this file merges env-driven values on top.
 */
export default ({ config }) => {
  return {
    ...config,
    plugins: [...(config.plugins || []), "@react-native-community/datetimepicker"],
    extra: {
      ...(config.extra || {}),
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      personaTemplateId: process.env.EXPO_PUBLIC_PERSONA_TEMPLATE_ID,
      eas: {
        ...(config.extra && config.extra.eas ? config.extra.eas : {}),
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  };
};
