// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
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
      JSONBIN_API_KEY: process.env.NUXT_PUBLIC_JSONBIN_API_KEY,
      JSONBIN_BIN_ID: process.env.NUXT_PUBLIC_JSONBIN_BIN_ID,
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  }
});

