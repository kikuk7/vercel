// nuxt.config.js
export default {

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'model-viewer'
    }
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
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
      { rel: 'icon', type: 'image/x-icon', href: '/static/assets/logo.png' } // Assuming your logo is in static/assets
    ],
    head() {
return {
    script: [
      {
        src: "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js",
        type: "module",
        body: true
      }
    ]
  }
},
    
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
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build


  // Server-side rendering (SSR): https://go.nuxtjs.dev/ssr-mode
  ssr: false, // Set to true if you want SSR

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static', // For static site generation (like your current setup)
};

