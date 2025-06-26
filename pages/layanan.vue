<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <!-- Menggunakan page.hero_image_url dari database -->
          <img src="/static/assets/layanan2.jpg" alt="Layanan Hero" />
        </div>
      </div>
    </section>

    <section class="container">
      <div class="content card">
        <!-- Menggunakan page.title dari database -->
        <h2 class="section-title">{{ page.title }}</h2>
        <p>
          <!-- Menggunakan page.main_intro_body dari database -->
          {{ page.main_intro_body }}
        </p>
      </div>

      <div class="service-grid">
        <div class="service-card">
          <!-- Menggunakan page.service_1_image_url dari database -->
          <img src="/static/assets/layanan1.jpg" alt="Jasa Fabrikasi" />
          <!-- Menggunakan page.service_1_title dan page.service_1_body dari database -->
          <h3>{{ page.service_1_title }}</h3>
          <p>{{ page.service_1_body }}</p>
        </div>

        <div class="service-card">
          <!-- Menggunakan page.service_2_image_url dari database -->
          <img src="/static/assets/Foto Galeri/3.jpg" alt="Komponen Besi" />
          <!-- Menggunakan page.service_2_title dan page.service_2_body dari database -->
          <h3>{{ page.service_2_title }}</h3>
          <p>{{ page.service_2_body }}</p>
        </div>

        <div class="service-card">
          <!-- Menggunakan page.service_3_image_url dari database -->
          <img src="/static/assets/Foto Galeri/6.JPG" alt="Pengadaan Barang" />
          <!-- Menggunakan page.service_3_title dan page.service_3_body dari database -->
          <h3>{{ page.service_3_title }}</h3>
          <p>{{ page.service_3_body }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats'; // Import the mixin
import { useRuntimeConfig } from '#app'; // Impor useRuntimeConfig

export default {
  name: 'LayananPage',
  mixins: [visitorStats], // Use the mixin for visitor stats
  data() {
    return {
      // Inisialisasi properti 'page' dengan nilai default/placeholder
      page: {
        title: 'Memuat Layanan...',
        hero_image_url: '/static/assets/layanan2.jpg', // Default jika DB kosong
        main_intro_body: 'Memuat konten layanan...',
        service_1_title: 'Memuat...',
        service_1_body: 'Memuat...',
        service_1_image_url: '/static/assets/layanan1.jpg', // Default
        service_2_title: 'Memuat...',
        service_2_body: 'Memuat...',
        service_2_image_url: '/static/assets/Foto Galeri/3.jpg', // Default
        service_3_title: 'Memuat...',
        service_3_body: 'Memuat...',
        service_3_image_url: '/static/assets/Foto Galeri/6.JPG'  // Default
      }
    };
  },
  async mounted() { // Ubah mounted menjadi async
    const config = useRuntimeConfig(); // Ambil runtime config
    const API_BASE_URL = config.public.apiBase; // Akses properti 'public.apiBase'

    // Panggil fungsi untuk mengambil data halaman 'layanan' dari API
    await this.fetchPageData('layanan', API_BASE_URL); 
    
    // Panggil updateStats dari mixin
    this.updateStats(); 
    // Set up interval untuk update stats
    this.intervalId = setInterval(this.updateStats, 30000); 
  },
  beforeDestroy() {
    clearInterval(this.intervalId); 
  },
  methods: {
    async fetchPageData(slug, apiBaseUrl) { // Terima apiBaseUrl sebagai argumen
      try {
        const response = await fetch(`${apiBaseUrl}/pages/${slug}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();
        this.page = data; 
      } catch (error) {
        console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
        // Fallback data jika terjadi error
        this.page.title = 'Layanan Tidak Tersedia';
        this.page.main_intro_body = 'Terjadi kesalahan saat memuat layanan.';
        this.page.service_1_title = 'Error';
        this.page.service_1_body = 'Error';
        this.page.service_1_image_url = ''; 
        this.page.service_2_title = 'Error';
        this.page.service_2_body = 'Error';
        this.page.service_2_image_url = '';
        this.page.service_3_title = 'Error';
        this.page.service_3_body = 'Error';
        this.page.service_3_image_url = '';
      }
    }
  }
}
</script>
<style>
/* Tambahan untuk hero-image-fallback agar gambar hero tampil baik */
.hero-image-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
