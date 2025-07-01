// nuxt.config.ts (Modifikasi)
export default defineNuxtConfig({
  devtools: { enabled: true },

  plugins: [
    '~/plugins/model-viewer.client.js',
    // HAPUS BARIS INI JIKA ADA: '~/plugins/supabase.client.js'
  ],

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'model-viewer'
    }
  },

  runtimeConfig: {
    public: {
      // Pastikan ini menunjuk ke BASE URL backend Railway Anda (TANPA /api di akhir)
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      // HAPUS BARIS INI JIKA ADA:
      // supabaseUrl: process.env.SUPABASE_URL,
      // supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  }
});