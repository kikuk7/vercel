<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <img :src="page.hero_image_url" :alt="page.title" class="hero-image-display" />
          <div class="overlay-text">{{ page.contact_overlay_text }}</div>
        </div>
      </div>
    </section>

    <section class="kontak-kami">
      <h2>{{ page.contact_title }}</h2>
      <div class="info-boxes">
        <div class="info-card">
          <div class="icon"><img src="/static/assets/icon/telp 2.png" alt="Ikon Telepon"></div>
          <h3>Telepon</h3>
          <p>{{ page.contact_phone }}</p>
        </div>
        <div class="info-card">
          <div class="icon"><img src="/static/assets/icon/home.png" alt="Ikon Lokasi"></div>
          <h3>{{ page.contact_location_title }}</h3>
          <p>{{ page.contact_location_body }}</p>
        </div>
        <div class="info-card">
          <div class="icon"><img src="/static/assets/icon/email 2.png" alt="Ikon Email"></div>
          <h3>{{ page.contact_email_title }}</h3>
          <p>{{ page.contact_email_address }}</p>
        </div>
      </div>

      <div class="atau">atau</div>
      <div class="wa-button">
        <a :href="`https://wa.me/${page.contact_whatsapp_number}`" class="btn-primary" target="_blank" rel="noopener noreferrer">
          <img src="/static/assets/icon/WA.png" alt="WhatsApp Icon" class="btn-icon-img"> WA Sekarang
        </a>
      </div>
    </section>

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';
// Impor useVisitorStats.js. Pastikan path ini benar!
// Berdasarkan diskusi terakhir, sepertinya di '~/components/useVisitorStats.js'
import { useVisitorStats } from '~/components/useVisitorStats'; 

// Panggil composable useVisitorStats di sini.
// Ini akan mengelola seluruh logika visitor counter (fetch, update, onMounted, onUnmounted).
const { totalVisitors, todayVisitors, onlineUsers } = useVisitorStats();

const config = useRuntimeConfig();
const API_BASE_URL = config.public.apiBase;

// Gunakan ref untuk membuat objek 'page' reaktif
const page = ref({
  hero_image_url: '/static/assets/Foto Galeri/1.jpg', // Default jika database kosong
  contact_overlay_text: 'Memuat...',
  contact_title: 'Memuat...',
  contact_phone: 'Memuat...',
  contact_location_title: 'Memuat...',
  contact_location_body: 'Memuat...',
  contact_email_title: 'Memuat...',
  contact_email_address: 'Memuat...',
  contact_whatsapp_number: '', // Hanya nomor, link akan dibuat
  // map_embed_url: '' // Tambahkan jika Anda memiliki URL embed peta di DB
});

// Fungsi untuk mengambil data halaman dari backend
async function fetchPageData(slug) {
  try {
    // URL endpoint API backend Anda harus diawali dengan /api/
    const response = await fetch(`${API_BASE_URL}/api/pages/${slug}`);
    if (!response.ok) {
      const errorText = await response.text(); 
      throw new Error(`HTTP error! status: ${response.status}: ${errorText || 'Unknown error'}`);
    }
    const data = await response.json();
    page.value = data; // Perbarui ref 'page'
  } catch (error) {
    console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
    // Fallback data jika gagal mengambil dari API
    page.value.hero_image_url = '/static/assets/Foto Galeri/1.jpg'; // Default fallback
    page.value.contact_overlay_text = 'Gagal Memuat';
    page.value.contact_title = 'Hubungi Kami (Offline)';
    page.value.contact_phone = 'N/A';
    page.value.contact_location_title = 'Lokasi (Error)';
    page.value.contact_location_body = 'Tidak dapat memuat alamat.';
    page.value.contact_email_title = 'Email (Error)';
    page.value.contact_email_address = 'email@error.com';
    page.value.contact_whatsapp_number = '';
    // page.value.map_embed_url = ''; // Reset map URL if error
  }
}

// Panggil fetchPageData saat komponen dimuat
onMounted(async () => {
  await fetchPageData('kontak');
  // Penting: Jangan ada lagi panggilan manual this.updateStats() atau setInterval di sini.
  // useVisitorStats() sudah mengelola logikanya sendiri secara internal.
});
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
