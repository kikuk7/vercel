<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <video
            v-if="page.hero_video_url"
            autoplay
            muted
            loop
            class="hero-media"
          >
            <source :src="page.hero_video_url" type="video/mp4" />
            Browser Anda tidak mendukung video.
          </video>

          <img
            :src="page.hero_image_url"
            :alt="page.hero_title || 'Hero Image'"
            v-else-if="page.hero_image_url"
            class="hero-media hero-image-fallback"
          />

          <img
            src="/images/default-hero-background.jpg"
            alt="Default Hero Background"
            class="hero-media hero-image-fallback"
            v-else
          />

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
          <img src="/assets/DSCF5421.jpg" alt="layanan2" class="img-small" />
          <img src="/assets/DSCF5375.jpg" alt="layanan1" class="img-large" />
          <img src="/assets/DSCF5385.jpg" alt="layanan3" class="img-small" />
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
        hero_title: 'Memuat Konten...',
        hero_video_url: '', // Akan diisi dari API
        hero_image_url: '', // Akan diisi dari API
        homepage_about_section_text: 'Memuat informasi tentang kami...',
        homepage_services_section_text: 'Memuat informasi layanan kami...'
      },
      intervalId: null
    };
  },
  async mounted() {
    const config = useRuntimeConfig();
    const API_BASE_URL = config.public.apiBase;

    await this.fetchPageData('beranda', API_BASE_URL);

    this.updateStats();
    this.intervalId = setInterval(this.updateStats, 30000);
  },
  beforeUnmount() { // Menggunakan beforeUnmount untuk Vue 3 lifecycle
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  methods: {
    async fetchPageData(slug, apiBaseUrl) {
      try {
        console.log(`Mengambil data dari: ${apiBaseUrl}/pages/${slug}`);
        const response = await fetch(`${apiBaseUrl}/pages/${slug}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'No additional error info' }));
          throw new Error(`HTTP error! Status: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();

        // Mengisi semua properti 'page' dari data API
        this.page = {
          hero_title: data.hero_title || 'Selamat Datang',
          hero_video_url: data.hero_video_url || '',
          hero_image_url: data.hero_image_url || '',
          homepage_about_section_text: data.homepage_about_section_text || 'Deskripsi singkat tentang kami.',
          homepage_services_section_text: data.homepage_services_section_text || 'Deskripsi singkat layanan kami.'
        };
      } catch (error) {
        console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
        this.page = {
          hero_title: 'Konten Tidak Tersedia',
          hero_video_url: '', // Biarkan kosong agar fallback gambar statis muncul
          hero_image_url: '', // Biarkan kosong agar fallback gambar statis muncul
          homepage_about_section_text: 'Maaf, terjadi kesalahan saat memuat konten tentang kami. Silakan coba lagi nanti.',
          homepage_services_section_text: 'Maaf, terjadi kesalahan saat memuat konten layanan kami. Silakan coba lagi nanti.'
        };
      }
    }
  }
}
</script>

<style>
/* Gaya yang sama seperti sebelumnya */
.hero-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


</style>