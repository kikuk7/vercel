<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <video autoplay muted loop v-if="page.hero_video_url && page.hero_video_source_type === 'mp4'">
            <source src="/static/assets/brnd.mp4" type="video/mp4" />
            Browser Anda tidak mendukung video.
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
import { ref, onMounted, onUnmounted } from 'vue'; // Import ref, onMounted, onUnmounted
import { useRuntimeConfig } from '#app';
// --- IMPORTANT: Ensure this path is correct based on where you moved useVisitorStats.js ---
import { useVisitorStats } from '~/components/useVisitorStats'; 

// Use the useVisitorStats composable
// This automatically handles the visitor count logic (fetch, update, etc.)
const { totalVisitors, todayVisitors, onlineUsers } = useVisitorStats();

const config = useRuntimeConfig();
const API_BASE_URL = config.public.apiBase;

// Use ref for reactive data
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

// Function to fetch page data
async function fetchPageData(slug) {
  try {
    // Ensure the API_BASE_URL is correct (e.g., https://your-backend.railway.app)
    // and the endpoint is correctly formed (e.g., /api/pages/beranda)
    const response = await fetch(`${API_BASE_URL}/api/pages/${slug}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || 'Unknown error'}`);
    }
    const data = await response.json();
    page.value = data; // Assign data to page.value
  } catch (error) {
    console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
    page.value.hero_title = 'Konten Tidak Tersedia';
    page.value.homepage_about_section_text = 'Maaf, terjadi kesalahan saat memuat konten.';
    page.value.homepage_services_section_text = 'Silakan coba lagi nanti.';
    page.value.hero_video_source_type = 'mp4';
    page.value.hero_image_source_type = 'static';
    page.value.homepage_bottom_image_1_url = '';
    page.value.homepage_bottom_image_2_url = '';
    page.value.homepage_bottom_image_3_url = '';
  }
}

// Call fetchPageData on mounted
onMounted(async () => {
  await fetchPageData('beranda');
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