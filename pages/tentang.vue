<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <!-- Menggunakan page.hero_image_url dari database -->
          <img src="/static/assets/DSCF5376.JPG" alt="Tentang Kami" />
        </div>
      </div>
    </section>

    <section class="container">
      <div class="content card">
        <h2 class="section-title">{{ page.title }}</h2>
        <!-- Menggunakan page.body dari database -->
        <p>{{ page.body }}</p>
        <!-- Jika Anda memecah body di DB menjadi p1 dan p2 -->
        <!-- <p v-if="page.about_main_text_p1">{{ page.about_main_text_p1 }}</p> -->
        <!-- <p v-if="page.about_main_text_p2">{{ page.about_main_text_p2 }}</p> -->
      </div>
    </section>

    <section class="visi-misi">
      <div class="container visi-misi-box">
        <div>
          <!-- Menggunakan vision_title dan vision_body dari database -->
          <h3>{{ page.vision_title }}</h3>
          <p>{{ page.vision_body }}</p>
        </div>
        <div>
          <!-- Menggunakan mission_title dan mission_body dari database -->
          <h3>{{ page.mission_title }}</h3>
          <p>{{ page.mission_body }}</p>
        </div>
      </div>
    </section>

    <section class="galeri">
      <section class="container">
        <!-- Menggunakan excellence_title dari database -->
        <h2 class="section-title">{{ page.excellence_title }}</h2>
      </section>
      <div class="tentang-grid">
        <!-- Gambar-gambar ini masih hardcoded. Untuk membuatnya dinamis, 
             Anda perlu kolom di DB untuk menyimpan URL gambar-gambar ini atau mengadopsi struktur JSONB. -->
        <img src="/static/assets/tentang2.png" alt="Keunggulan 1" />
        <img src="/static/assets/tentang1.png" alt="Keunggulan 2" />
        <img src="/static/assets/tentang3.png" alt="Keunggulan 3" />
      </div>
    </section>
  </main>
</template>

<script>
import { useRuntimeConfig } from '#app'; // Impor useRuntimeConfig

export default {
  name: 'TentangPage',
  data() {
    return {
      // Inisialisasi properti 'page' dengan nilai default/placeholder
      // Ini akan diisi oleh data yang diambil dari API
      page: {
        title: 'Memuat Tentang Kami...',
        hero_image_url: '/static/assets/tentang.JPG', // Default jika DB kosong
        body: 'Memuat konten utama...',
        // about_main_text_p1: '', // Jika Anda memecah body di DB
        // about_main_text_p2: '', // Jika Anda memecah body di DB
        vision_title: 'Memuat Visi...',
        vision_body: 'Memuat isi visi...',
        mission_title: 'Memuat Misi...',
        mission_body: 'Memuat isi misi...',
        excellence_title: 'Memuat Keunggulan...'
      }
    };
  },
  async mounted() {
    const config = useRuntimeConfig(); // Ambil runtime config
    const API_BASE_URL = config.public.apiBase; // Akses properti 'public.apiBase'

    // Panggil fungsi untuk mengambil data halaman 'tentang' dari API
    await this.fetchPageData('tentang', API_BASE_URL); 
    
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
    async fetchPageData(slug, apiBaseUrl) { // Terima apiBaseUrl sebagai argumen
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
        this.page.title = 'Tentang Kami Tidak Tersedia';
        this.page.body = 'Terjadi kesalahan saat memuat informasi.';
        this.page.vision_title = 'Error';
        this.page.mission_title = 'Error';
        this.page.excellence_title = 'Error';
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
