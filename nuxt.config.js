// nuxt.config.js
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  // Global page headers: https://go.nuxtjs.dev/config-head
  app: { // Konfigurasi head dipindahkan ke 'app' di Nuxt 3
    head: {
      title: 'CV Sumber Alam Raya',
      htmlAttrs: {
        lang: 'id'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/static/assets/1.png' }, // Assuming your logo is in static/assets
        { rel: 'icon', type: 'image/x-icon', href: '/assets/1.png' }
      ],
      script: [ // Script untuk model-viewer
        {
          src: "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js",
          type: "module",
          body: true
        }
      ]
    }
  },

  // Konfigurasi Vue (untuk custom elements seperti model-viewer)
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'model-viewer'
    }
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/static/style/style.css', 
    '~/static/style/kontak.css',
    '~/static/style/produk.css',
    '~/static/style/faq.css',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  // buildModules di Nuxt 3 diganti dengan modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/sitemap', // Untuk sitemap
    {
        siteUrl: 'https://www.cvsumberalamraya.com',
        exclude: [
          '/admin/**', // Ini akan mengecualikan semua halaman di dalam folder admin
        ],
      }
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },

  // Server-side rendering (SSR): https://go.nuxtjs.dev/ssr-mode
  ssr: true, // Set to true if you want SSR

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static', // For static site generation (like your current setup)

  // Runtime Config untuk variabel lingkungan publik (seperti API_BASE_URL)
  runtimeConfig: {
    public: {
      // API_BASE_URL untuk backend Anda
      // Gunakan process.env.NUXT_PUBLIC_API_BASE untuk deployment
      // Fallback ke localhost untuk pengembangan lokal
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080/api'
    }
  },

  // Vite (Nuxt 3 menggunakan Vite sebagai builder default)
  // Anda bisa menambahkan konfigurasi Vite spesifik di sini jika diperlukan
  vite: {
    // Menghilangkan error 'Element is missing end tag' pada <style scoped>
    // Ini adalah solusi untuk masalah yang sering terjadi dengan Vite dan Vue
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['model-viewer'].includes(tag),
        },
      },
    },
  }
});
