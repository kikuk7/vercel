<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <video autoplay muted loop class="hero-media">
            <source src="/static/assets/brnd.mp4" type="video/mp4" />
            Browser Anda tidak mendukung video.
          </video>

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
      // Inisialisasi properti 'page'. hero_video_url dan hero_image_url tidak lagi dibutuhkan
      // jika media hero sepenuhnya statis dan tidak dikontrol oleh API.
      page: {
        hero_title: 'Memuat...', // Ini akan diisi dari API
        homepage_about_section_text: 'Memuat konten...', // Ini akan diisi dari API
        homepage_services_section_text: 'Memuat konten...' // Ini akan diisi dari API
      },
      intervalId: null
    };
  },
  async mounted() {
    const config = useRuntimeConfig();
    const API_BASE_URL = config.public.apiBase;

    // Panggil fungsi untuk mengambil data halaman 'beranda' dari API
    // Sekarang hanya untuk teks, bukan media hero
    await this.fetchPageData('beranda', API_BASE_URL);

    this.updateStats();
    this.intervalId = setInterval(this.updateStats, 30000);
  },
  beforeUnmount() { // Menggunakan beforeUnmount untuk Vue 3
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

        // Hanya pasangkan properti teks yang relevan dari API
        this.page.hero_title = data.hero_title || 'Selamat Datang';
        this.page.homepage_about_section_text = data.homepage_about_section_text || 'Deskripsi singkat tentang kami.';
        this.page.homepage_services_section_text = data.homepage_services_section_text || 'Deskripsi singkat layanan kami.';

        // hero_video_url dan hero_image_url tidak lagi diperbarui dari API
        // karena kita menggunakan aset statis untuk media hero.
      } catch (error) {
        console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
        // Jika terjadi error, isi properti teks dengan data fallback
        this.page.hero_title = 'Konten Tidak Tersedia';
        this.page.homepage_about_section_text = 'Maaf, terjadi kesalahan saat memuat konten tentang kami. Silakan coba lagi nanti.';
        this.page.homepage_services_section_text = 'Maaf, terjadi kesalahan saat memuat konten layanan kami. Silakan coba lagi nanti.';
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

/* Jika Anda menambahkan gambar fallback statis */
.hero-image-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>