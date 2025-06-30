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

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8000/api',
      JSONBIN_API_KEY: process.env.VITE_JSONBIN_API_KEY,
      JSONBIN_BIN_ID: process.env.VITE_JSONBIN_BIN_ID
    }
  }
})

