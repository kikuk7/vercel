<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <!-- Menggunakan page.hero_image_url dari database -->
          <img :src="page.hero_image_url" :alt="page.title" class="hero-image-fallback" />
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
          <!-- PENTING: src sekarang mengikat ke service_1_image_url dari DB -->
          <img :src="page.service_1_image_url" :alt="page.service_1_title" />
          <h3>{{ page.service_1_title }}</h3>
          <p>{{ page.service_1_body }}</p>
        </div>

        <div class="service-card">
          <!-- PENTING: src sekarang mengikat ke service_2_image_url dari DB -->
          <img :src="page.service_2_image_url" :alt="page.service_2_title" />
          <h3>{{ page.service_2_title }}</h3>
          <p>{{ page.service_2_body }}</p>
        </div>

        <div class="service-card">
          <!-- PENTING: src sekarang mengikat ke service_3_image_url dari DB -->
          <img :src="page.service_3_image_url" :alt="page.service_3_title" />
          <h3>{{ page.service_3_title }}</h3>
          <p>{{ page.service_3_body }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats'; 
import { useRuntimeConfig } from '#app'; 

export default {
  name: 'LayananPage',
  mixins: [visitorStats], 
  data() {
    return {
      page: {
        title: 'Memuat Layanan...',
        hero_image_url: '', // Akan diisi dari DB
        main_intro_body: 'Memuat konten layanan...',
        service_1_title: 'Memuat...',
        service_1_body: 'Memuat...',
        service_1_image_url: '', 
        service_2_title: 'Memuat...',
        service_2_body: 'Memuat...',
        service_2_image_url: '', 
        service_3_title: 'Memuat...',
        service_3_body: 'Memuat...',
        service_3_image_url: ''  
      }
    };
  },
  async mounted() { 
    const config = useRuntimeConfig(); 
    const API_BASE_URL = config.public.apiBase; 

    await this.fetchPageData('layanan', API_BASE_URL); 
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

/* Gaya untuk service-card images agar konsisten */
.service-card img {
  width: 100%;
  height: 150px; 
  object-fit: cover; 
  border-radius: 8px; 
  margin-bottom: 15px; 
}
</style>
