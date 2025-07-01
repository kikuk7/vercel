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
        <p>{{ page.body }}</p>
      </div>
    </section>

    <section class="visi-misi">
      <div class="container visi-misi-box">
        <div>
          <h3>{{ page.vision_title }}</h3>
          <p>{{ page.vision_body }}</p>
        </div>
        <div>
          <h3>{{ page.mission_title }}</h3>
          <p>{{ page.mission_body }}</p>
        </div>
      </div>
    </section>

    <section class="galeri">
      <section class="container">
        <h2 class="section-title">{{ page.excellence_title }}</h2>
      </section>
      <div class="tentang-grid">
        <img :src="page.excellence_image_1_url" alt="Keunggulan 1" v-if="page.excellence_image_1_url" />
        <img :src="page.excellence_image_2_url" alt="Keunggulan 2" v-if="page.excellence_image_2_url" />
        <img :src="page.excellence_image_3_url" alt="Keunggulan 3" v-if="page.excellence_image_3_url" />
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
  title: 'Memuat Tentang Kami...',
  hero_image_url: '/static/assets/DSCF5376.JPG', // Default jika DB kosong atau belum dimuat
  body: 'Memuat konten utama...',
  vision_title: 'Memuat Visi...',
  vision_body: 'Memuat isi visi...',
  mission_title: 'Memuat Misi...',
  mission_body: 'Memuat isi misi...',
  excellence_title: 'Memuat Keunggulan...',
  // Tambahkan default untuk URL gambar keunggulan
  excellence_image_1_url: '/static/assets/tentang2.png', 
  excellence_image_2_url: '/static/assets/tentang1.png',
  excellence_image_3_url: '/static/assets/tentang3.png',
});

// Fungsi untuk mengambil data halaman 'tentang' dari backend
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
    page.value.title = 'Tentang Kami Tidak Tersedia';
    page.value.body = 'Terjadi kesalahan saat memuat informasi.';
    page.value.vision_title = 'Error Memuat';
    page.value.vision_body = 'Silakan coba lagi nanti.';
    page.value.mission_title = 'Error Memuat';
    page.value.mission_body = 'Silakan coba lagi nanti.';
    page.value.excellence_title = 'Error Memuat';
    // Atur URL gambar fallback jika ada error
    page.value.hero_image_url = '/static/assets/DSCF5376.JPG'; 
    page.value.excellence_image_1_url = '/static/assets/tentang2.png'; 
    page.value.excellence_image_2_url = '/static/assets/tentang1.png';
    page.value.excellence_image_3_url = '/static/assets/tentang3.png';
  }
}

// Panggil fetchPageData saat komponen dimuat
onMounted(async () => {
  await fetchPageData('tentang');
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
</style>
