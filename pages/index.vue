<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <video autoplay muted loop v-if="page.hero_video_url">
            <source src="/static/assets/brnd.mp4" type="video/mp4" />
            Browser Anda tidak mendukung video.
          </video>
          <img :src="page.hero_image_url" :alt="page.hero_title" v-else-if="page.hero_image_url" class="hero-image-fallback" />
          <div class="hero-text">
            <h1>{{ page.hero_title }}</h1>
            <NuxtLink to="/produk" class="btn-primary">lihat produk kami</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="content container layanan-kami-section">
      <div class="about-section">
        <div class="card">
          <h2>Tentang Kami</h2>
          <p>{{ page.homepage_about_section_text }}</p>
          <NuxtLink to="/tentang" class="btn-outline">selengkapnya</NuxtLink>
        </div>

        <div class="card" style="margin-top: 50px;">
          <h2>Layanan Kami</h2>
          <p>{{ page.homepage_services_section_text }}</p>
          <NuxtLink to="/layanan" class="btn-outline">selengkapnya</NuxtLink>
        </div>
      </div>

      <div class="bottom-section">
        <div class="image-content">
          <img src="/static/assets/layanan2.jpg" alt="layanan2" class="img-small" />
          <img src="/static/assets/layanan1.jpg" alt="layanan1" class="img-large" />
          <img src="/static/assets/layanan3.jpg" alt="layanan3" class="img-small" />
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats';
import { useRuntimeConfig } from '#app'; // Penting: Impor useRuntimeConfig

export default {
  name: 'IndexPage',
  mixins: [visitorStats],
  data() {
    return {
      // Inisialisasi properti 'page' dengan nilai default kosong atau placeholder
      // Ini akan diisi oleh data yang diambil dari API
      page: {
        hero_title: 'Memuat...',
        hero_video_url: '',
        hero_image_url: '',
        homepage_about_section_text: 'Memuat konten...',
        homepage_services_section_text: 'Memuat konten...'
      }
    };
  },
  async mounted() {
    // Ambil runtime config di sini, di dalam mounted hook
    const config = useRuntimeConfig();
    const API_BASE_URL = config.public.apiBase; // Akses properti 'public.apiBase'

    // Panggil fungsi untuk mengambil data halaman 'beranda' dari API
    await this.fetchPageData('beranda', API_BASE_URL); // Teruskan API_BASE_URL sebagai argumen
    
    // Panggil updateStats dari mixin
    this.updateStats(); 
    // Set up interval untuk update stats
    this.intervalId = setInterval(this.updateStats, 30000); 
  },
  beforeDestroy() {
    // Bersihkan interval saat komponen dihancurkan
    clearInterval(this.intervalId); 
  },
  methods: {
    // Terima apiBaseUrl sebagai argumen
    async fetchPageData(slug, apiBaseUrl) { 
      try {
        const response = await fetch(`${apiBaseUrl}/pages/${slug}`);
        if (!response.ok) {
          // Tangani error jika respons tidak OK (misalnya 404, 500)
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();
        // Pasangkan data yang diterima langsung dari API ke properti 'page'
        this.page = data; 
      } catch (error) {
        console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
        // Jika terjadi error, Anda bisa mengisi properti 'page' dengan data fallback
        // atau pesan error agar tidak kosong di UI.
        this.page.hero_title = 'Konten Tidak Tersedia';
        this.page.homepage_about_section_text = 'Maaf, terjadi kesalahan saat memuat konten.';
        this.page.homepage_services_section_text = 'Silakan coba lagi nanti.';
      }
    }
  }
}
</script>

<style>
/* Gaya spesifik halaman jika ada */
.hero-image-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
