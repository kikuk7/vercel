<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <img :src="page.hero_image_url" :alt="page.title" class="hero-image-display" />
        </div>
      </div>
    </section>

    <section class="container">
      <div class="content card">
        <h2 class="section-title">{{ page.title }}</h2>
        <p>
          {{ page.main_intro_body }}
        </p>
      </div>

      <div class="service-grid">
        <div class="service-card">
          <img :src="page.service_1_image_url" :alt="page.service_1_title" />
          <h3>{{ page.service_1_title }}</h3>
          <p>{{ page.service_1_body }}</p>
        </div>

        <div class="service-card">
          <img :src="page.service_2_image_url" :alt="page.service_2_title" />
          <h3>{{ page.service_2_title }}</h3>
          <p>{{ page.service_2_body }}</p>
        </div>

        <div class="service-card">
          <img :src="page.service_3_image_url" :alt="page.service_3_title" />
          <h3>{{ page.service_3_title }}</h3>
          <p>{{ page.service_3_body }}</p>
        </div>
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
  title: 'Memuat Layanan...',
  hero_image_url: '', 
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
    // Atur pesan dan URL fallback jika terjadi error
    page.value.title = 'Layanan Tidak Tersedia';
    page.value.main_intro_body = 'Terjadi kesalahan saat memuat layanan.';
    page.value.service_1_title = 'Error';
    page.value.service_1_body = 'Error';
    page.value.service_1_image_url = ''; 
    page.value.service_2_title = 'Error';
    page.value.service_2_body = 'Error';
    page.value.service_2_image_url = '';
    page.value.service_3_title = 'Error';
    page.value.service_3_body = 'Error';
    page.value.service_3_image_url = '';
  }
}

// Panggil fetchPageData saat komponen dimuat
onMounted(async () => {
  await fetchPageData('layanan');
  // Penting: Jangan ada lagi panggilan manual this.updateStats() atau setInterval di sini.
  // useVisitorStats() sudah mengelola logikanya sendiri secara internal.
});
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
