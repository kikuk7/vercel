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
          <!-- Gambar ini masih hardcoded. Untuk membuatnya dinamis,
               Anda perlu kolom di DB untuk menyimpan URL gambar ini. -->
          <img src="/static/assets/layanan1.jpg" alt="Jasa Fabrikasi" />
          <!-- Menggunakan page.service_1_title dan page.service_1_body dari database -->
          <h3>{{ page.service_1_title }}</h3>
          <p>{{ page.service_1_body }}</p>
        </div>

        <div class="service-card">
          <!-- Gambar ini masih hardcoded. Untuk membuatnya dinamis,
               Anda perlu kolom di DB untuk menyimpan URL gambar ini. -->
          <img src="/static/assets/Foto Galeri/3.jpg" alt="Komponen Besi" />
          <!-- Menggunakan page.service_2_title dan page.service_2_body dari database -->
          <h3>{{ page.service_2_title }}</h3>
          <p>{{ page.service_2_body }}</p>
        </div>

        <div class="service-card">
          <!-- Gambar ini masih hardcoded. Untuk membuatnya dinamis,
               Anda perlu kolom di DB untuk menyimpan URL gambar ini. -->
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

// PENTING: Sesuaikan dengan URL API backend Node.js/Express Anda
const API_BASE_URL = 'http://localhost:3001/api'; 

export default {
  name: 'LayananPage',
  mixins: [visitorStats], // Use the mixin for visitor stats
  data() {
    return {
      // Inisialisasi properti 'page' dengan nilai default/placeholder
      // Ini akan diisi oleh data yang diambil dari API
      page: {
        title: 'Memuat Layanan...',
        hero_image_url: '/static/assets/layanan2.jpg', // Default jika DB kosong
        main_intro_body: 'Memuat konten layanan...',
        service_1_title: 'Memuat...',
        service_1_body: 'Memuat...',
        service_2_title: 'Memuat...',
        service_2_body: 'Memuat...',
        service_3_title: 'Memuat...',
        service_3_body: 'Memuat...'
      }
    };
  },
  async mounted() {
    // Panggil fungsi untuk mengambil data halaman 'layanan' dari API
    await this.fetchPageData('layanan'); 
    
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
    async fetchPageData(slug) {
      try {
        const response = await fetch(`${API_BASE_URL}/pages/${slug}`);
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
        this.page.title = 'Layanan Tidak Tersedia';
        this.page.main_intro_body = 'Terjadi kesalahan saat memuat layanan.';
        this.page.service_1_title = 'Error';
        this.page.service_1_body = 'Error';
        this.page.service_2_title = 'Error';
        this.page.service_2_body = 'Error';
        this.page.service_3_title = 'Error';
        this.page.service_3_body = 'Error';
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
