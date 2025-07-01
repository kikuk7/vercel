<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <video autoplay muted loop v-if="page.hero_video_url && page.hero_video_source_type === 'mp4'">
            <source :src="page.hero_video_url" type="video/mp4" /> Browser Anda tidak mendukung video.
          </video>
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
          <img :src="page.homepage_bottom_image_1_url" alt="Gambar Bawah 1" class="img-small" />
          <img :src="page.homepage_bottom_image_2_url" alt="Gambar Bawah 2" class="img-large" />
          <img :src="page.homepage_bottom_image_3_url" alt="Gambar Bawah 3" class="img-small" />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';
// Impor useVisitorStats.js. Pastikan path ini benar!
// Berdasarkan gambar terakhir Anda, sepertinya di '~/components/useVisitorStats.js'
// Jika Anda memindahkannya ke 'composables', ubah menjadi '@/composables/useVisitorStats'
import { useVisitorStats } from '~/components/useVisitorStats'; 

// Panggil composable useVisitorStats di sini.
// Ini akan mengelola seluruh logika visitor counter (fetch, update, onMounted, onUnmounted).
const { totalVisitors, todayVisitors, onlineUsers } = useVisitorStats();

const config = useRuntimeConfig();
const API_BASE_URL = config.public.apiBase;

// Gunakan ref untuk membuat objek 'page' reaktif
const page = ref({
  hero_title: 'Memuat...',
  hero_video_url: '',
  hero_image_url: '',
  hero_video_source_type: 'mp4',
  hero_image_source_type: 'static',
  homepage_about_section_text: 'Memuat konten...',
  homepage_services_section_text: 'Memuat konten...',
  homepage_bottom_image_1_url: '',
  homepage_bottom_image_2_url: '',
  homepage_bottom_image_3_url: ''
});

// Fungsi untuk mengambil data halaman dari backend
async function fetchPageData(slug) {
  try {
    // URL endpoint API backend Anda harus diawali dengan /api/
    const response = await fetch(`${API_BASE_URL}/api/pages/${slug}`);
    if (!response.ok) {
      // Lebih baik mengambil teks error jika response bukan JSON
      const errorText = await response.text(); 
      throw new Error(`HTTP error! status: ${response.status}: ${errorText || 'Unknown error'}`);
    }
    const data = await response.json();
    page.value = data; // Perbarui ref 'page'
  } catch (error) {
    console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
    // Atur pesan fallback jika terjadi error
    page.value.hero_title = 'Konten Tidak Tersedia';
    page.value.homepage_about_section_text = 'Maaf, terjadi kesalahan saat memuat konten.';
    page.value.homepage_services_section_text = 'Silakan coba lagi nanti.';
    page.value.hero_video_url = ''; // Pastikan URL video/gambar juga direset jika error
    page.value.hero_image_url = '';
    page.value.homepage_bottom_image_1_url = '';
    page.value.homepage_bottom_image_2_url = '';
    page.value.homepage_bottom_image_3_url = '';
  }
}

// Panggil fetchPageData saat komponen dimuat
onMounted(async () => {
  await fetchPageData('beranda');
  // Penting: Jangan ada lagi panggilan this.updateStats() atau setInterval di sini.
  // useVisitorStats() sudah mengelola logikanya sendiri secara internal.
});
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