<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <!-- Pastikan v-if dan :src menggunakan page.hero_video_url -->
          <video autoplay muted loop v-if="page.hero_video_url">
            <source src="/static/assets/beranda.mp4" type="video/mp4" />
            Browser Anda tidak mendukung video.
          </video>
          <!-- Pastikan v-else-if dan :src menggunakan page.hero_image_url -->
          <img :src="page.hero_image_url" :alt="page.hero_title" v-else-if="page.hero_image_url" class="hero-image-fallback" />
          <div class="hero-text">
            <!-- Pastikan ini menggunakan page.hero_title -->
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
          <p>
            <!-- Pastikan ini menggunakan page.homepage_about_section_text -->
            {{ page.homepage_about_section_text }}
          </p>
          <NuxtLink to="/tentang" class="btn-outline">selengkapnya</NuxtLink>
        </div>

        <div class="card" style="margin-top: 50px;">
          <h2>Layanan Kami</h2>
          <p>
            <!-- Pastikan ini menggunakan page.homepage_services_section_text -->
            {{ page.homepage_services_section_text }}
          </p>
          <NuxtLink to="/layanan" class="btn-outline">selengkapnya</NuxtLink>
        </div>
      </div>

      <div class="bottom-section">
        <div class="image-content">
          <!-- Gambar ini masih hardcoded. Untuk membuatnya dinamis, 
               Anda perlu menambahkan URL gambar ini ke database dan mengambilnya dari API. -->
          <img src="/static/assets/layanan2.jpg" alt="layanan2" class="img-small" />
          <img src="/static/assets/layanan1.jpg" alt="layanan1" class="img-large" />
          <img src="/static/assets/layanan3.jpg" alt="layanan3" class="img-small" />
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
  name: 'IndexPage',
  mixins: [visitorStats], // Use the mixin for visitor stats
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
    // Panggil fungsi untuk mengambil data halaman 'beranda' dari API
    await this.fetchPageData('beranda'); 
    
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
        this.page.hero_title = 'Konten Tidak Tersedia';
        this.page.homepage_about_section_text = 'Maaf, terjadi kesalahan saat memuat konten.';
        this.page.homepage_services_section_text = 'Silakan coba lagi nanti.';
      }
    }
  }
}
</script>

<style>
/* Page-specific styles if any */
.hero-image-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
