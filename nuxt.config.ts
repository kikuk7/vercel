// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  plugins: ['~/plugins/model-viewer.client.js'],

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'model-viewer'
    }
  },

  // ...
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  }
});

