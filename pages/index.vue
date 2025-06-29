<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <!-- HANYA MP4 Video atau Gambar Hero -->
          <video autoplay muted loop v-if="page.hero_video_url && page.hero_video_source_type === 'mp4'">
            <source src="/static/assets/brnd.mp4" type="video/mp4" />
            Browser Anda tidak mendukung video.
          </video>
          <!-- Fallback ke gambar hero jika tidak ada video atau video bukan mp4 -->
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
          <!-- Gambar-gambar ini tetap DINAMIS dari database -->
          <img :src="page.homepage_bottom_image_1_url" alt="Gambar Bawah 1" class="img-small" />
          <img :src="page.homepage_bottom_image_2_url" alt="Gambar Bawah 2" class="img-large" />
          <img :src="page.homepage_bottom_image_3_url" alt="Gambar Bawah 3" class="img-small" />
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { useRuntimeConfig } from '#app'; 

export default {
  name: 'IndexPage',
  mixins: [visitorStats],
  data() {
    return {
      page: {
        hero_title: 'Memuat...',
        hero_video_url: '',
        hero_image_url: '',
        hero_video_source_type: 'mp4', // Default ke mp4
        hero_image_source_type: 'static', // Default ke static
        homepage_about_section_text: 'Memuat konten...',
        homepage_services_section_text: 'Memuat konten...',
        homepage_bottom_image_1_url: '', 
        homepage_bottom_image_2_url: '',
        homepage_bottom_image_3_url: ''
      }
    };
  },
  async mounted() {
    const config = useRuntimeConfig();
    const API_BASE_URL = config.public.apiBase;

    await this.fetchPageData('beranda', API_BASE_URL); 
    this.updateStats(); 
    this.intervalId = setInterval(this.updateStats, 30000); 
  },
  beforeDestroy() {
    clearInterval(this.intervalId); 
  },
  methods: {
    async fetchPageData(slug, apiBaseUrl) { 
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
        this.page.hero_title = 'Konten Tidak Tersedia';
        this.page.homepage_about_section_text = 'Maaf, terjadi kesalahan saat memuat konten.';
        this.page.homepage_services_section_text = 'Silakan coba lagi nanti.';
        this.page.hero_video_source_type = 'mp4'; // Fallback ke mp4
        this.page.hero_image_source_type = 'static'; // Fallback ke static
        this.page.homepage_bottom_image_1_url = ''; 
        this.page.homepage_bottom_image_2_url = '';
        this.page.homepage_bottom_image_3_url = '';
      }
    }
    // Fungsi getYoutubeVideoId dan getDriveFileId DIHAPUS karena tidak lagi digunakan
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

.hero-media-embed { 
  width: 100%;
  height: 500px; 
  object-fit: cover;
}
</style>
