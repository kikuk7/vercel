<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <!-- Logika Kondisional untuk Sumber Video Hero (MP4, YouTube, Drive) -->
          <template v-if="page.hero_video_source_type === 'youtube' && page.hero_video_url">
            <!-- YouTube Embed -->
            <iframe
              :src="`https://www.youtube.com/embed/${getYoutubeVideoId(page.hero_video_url)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeVideoId(page.hero_video_url)}&controls=0`" 
              frameborder="0" 
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen 
              class="hero-media-embed">
            </iframe>
          </template>
          <template v-else-if="page.hero_video_source_type === 'drive' && page.hero_video_url">
            <!-- Google Drive Video Embed -->
            <iframe 
              :src="`https://drive.google.com/file/d/${getDriveFileId(page.hero_video_url)}/preview`" 
              frameborder="0" 
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen 
              class="hero-media-embed">
            </iframe>
          </template>
          <video autoplay muted loop v-else-if="page.hero_video_source_type === 'mp4' && page.hero_video_url">
            <!-- MP4 Video - Pastikan src diambil dari page.hero_video_url -->
            <source :src="page.hero_video_url" type="video/mp4" />
            Browser Anda tidak mendukung video.
          </video>
          <!-- Fallback ke gambar hero jika tidak ada video atau jenis tidak dikenal -->
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
          <!-- PENTING: Gambar-gambar ini sekarang DINAMIS dari database -->
          <img src="" alt="layanan2" class="img-small">
          <img :src="page.homepage_bottom_image_2_url" alt="Gambar Bawah 2" class="img-large" />
          <img :src="page.homepage_bottom_image_3_url" alt="Gambar Bawah 3" class="img-small" />
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats';
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
        hero_video_source_type: 'mp4', 
        hero_image_source_type: 'static', 
        homepage_about_section_text: 'Memuat konten...',
        homepage_services_section_text: 'Memuat konten...',
        homepage_bottom_image_1_url: '', // Tambahan untuk gambar bawah
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
        this.page.hero_video_source_type = 'mp4'; 
        this.page.hero_image_source_type = 'static'; 
        this.page.homepage_bottom_image_1_url = ''; // Fallback
        this.page.homepage_bottom_image_2_url = '';
        this.page.homepage_bottom_image_3_url = '';
      }
    },
    // Fungsi helper untuk mendapatkan ID YouTube dari URL
    getYoutubeVideoId(url) {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2] && match[2].length === 11) ? match[2] : null;
    },
    // Fungsi helper untuk mendapatkan ID File Google Drive dari URL
    getDriveFileId(url) {
      if (!url) return null;
      const regExp = /(https?:\/\/drive\.google\.com\/file\/d\/|https?:\/\/drive\.google\.com\/open\?id=)([^#\&\?\/]+)/;
      const match = url.match(regExp);
      return (match && match[2]) ? match[2] : null;
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

.hero-media-embed { 
  width: 100%;
  height: 500px; 
  object-fit: cover;
}
</style>
