<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <!-- Menggunakan page.hero_image_url dari database -->
          <img src="/assets/DSCF5363.jpg" alt="Layanan Hero" />
          <!-- Menggunakan contact_overlay_text dari database -->
          <div class="overlay-text">{{ page.contact_overlay_text }}</div>
        </div>
      </div>
    </section>

    <section class="kontak-kami">
      <!-- Menggunakan contact_title dari database -->
      <h2>{{ page.contact_title }}</h2>
      <div class="info-boxes">
        <div class="info-card">
          <div class="icon"><img src="/static/assets/icon/telp 2.png" alt="Ikon Telepon"></div>
          <!-- Menggunakan contact_phone dari database -->
          <h3>Telepon</h3>
          <p>{{ page.contact_phone }}</p>
        </div>
        <div class="info-card">
          <div class="icon"><img src="/static/assets/icon/home.png" alt="Ikon Lokasi"></div>
          <!-- Menggunakan contact_location_title dan contact_location_body dari database -->
          <h3>{{ page.contact_location_title }}</h3>
          <p>{{ page.contact_location_body }}</p>
        </div>
        <div class="info-card">
          <div class="icon"><img src="/static/assets/icon/email 2.png" alt="Ikon Email"></div>
          <!-- Menggunakan contact_email_title dan contact_email_address dari database -->
          <h3>{{ page.contact_email_title }}</h3>
          <p>{{ page.contact_email_address }}</p>
        </div>
      </div>

      <div class="atau">atau</div>
      <div class="wa-button">
        <!-- Menggunakan contact_whatsapp_number dari database untuk link WA -->
        <a :href="`https://wa.me/${page.contact_whatsapp_number}`" class="btn-primary"><img src="/static/assets/icon/WA.png" alt="WhatsApp Icon" class="btn-icon-img"> WA Sekarang</a>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats';
import { useRuntimeConfig } from '#app'; // Impor useRuntimeConfig

export default {
  name: 'KontakPage',
  mixins: [visitorStats],
  data() {
    return {
      // Inisialisasi properti 'page' dengan nilai default/placeholder
      page: {
        hero_image_url: '/static/assets/Foto Galeri/1.jpg', // Default jika database kosong
        contact_overlay_text: 'Memuat...',
        contact_title: 'Memuat...',
        contact_phone: 'Memuat...',
        contact_location_title: 'Memuat...',
        contact_location_body: 'Memuat...',
        contact_email_title: 'Memuat...',
        contact_email_address: 'Memuat...',
        contact_whatsapp_number: '' // Hanya nomor, link akan dibuat
      }
    };
  },
  async mounted() { // Ubah mounted menjadi async
    const config = useRuntimeConfig(); // Ambil runtime config
    const API_BASE_URL = config.public.apiBase; // Akses properti 'public.apiBase'

    // Panggil API untuk mendapatkan data halaman 'kontak'
    await this.fetchPageData('kontak', API_BASE_URL);
    this.updateStats();
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
        this.page = data; // Pasangkan data dari API ke properti 'page'
      } catch (error) {
        console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
        // Fallback data jika gagal mengambil dari API
        this.page.contact_overlay_text = 'Gagal Memuat';
        this.page.contact_title = 'Hubungi Kami (Offline)';
        this.page.contact_phone = 'N/A';
        this.page.contact_location_title = 'N/A';
        this.page.contact_location_body = 'N/A';
        this.page.contact_email_title = 'N/A';
        this.page.contact_email_address = 'N/A';
        this.page.contact_whatsapp_number = '';
      }
    }
  }
}
</script>
<style>
/* Add kontak.css content here */
/* Tambahan untuk hero-image-fallback agar gambar hero tampil baik */
.hero-image-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
