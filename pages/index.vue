<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <video autoplay :muted="isMuted" loop v-if="page.hero_video_url && page.hero_video_source_type === 'mp4'">
            <source src="/static/assets/bbb.mp4" type="video/mp4" />
            Browser Anda tidak mendukung video.
          </video>
          <img :src="page.hero_image_url" :alt="page.hero_title" v-else-if="page.hero_image_url" class="hero-image-fallback" />

          <div class="hero-text">
            <h1>{{ page.hero_title }}</h1>
            <NuxtLink to="/produk" class="btn-primary">lihat produk kami</NuxtLink>
          </div>

          <button @click="toggleSound" class="sound-toggle-btn">
            <span v-if="isMuted">🔊 Aktifkan Suara</span>
            <span v-else>🔇 Matikan Suara</span>
          </button>
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
import { useVisitorStats } from '~/components/useVisitorStats';

// Mengelola statistik pengunjung
const { totalVisitors, todayVisitors, onlineUsers } = useVisitorStats();

// State baru untuk mengontrol suara
const isMuted = ref(true);

// Fungsi untuk toggle suara
function toggleSound() {
  isMuted.value = !isMuted.value;
}

const config = useRuntimeConfig();
const API_BASE_URL = config.public.apiBase;

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
    const response = await fetch(`${API_BASE_URL}/api/pages/${slug}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}: ${errorText || 'Unknown error'}`);
    }
    const data = await response.json();
    page.value = data;
  } catch (error) {
    console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
    page.value.hero_title = 'Konten Tidak Tersedia';
    page.value.homepage_about_section_text = 'Maaf, terjadi kesalahan saat memuat konten.';
    page.value.homepage_services_section_text = 'Silakan coba lagi nanti.';
    page.value.hero_video_url = '';
    page.value.hero_image_url = '';
    page.value.homepage_bottom_image_1_url = '';
    page.value.homepage_bottom_image_2_url = '';
    page.value.homepage_bottom_image_3_url = '';
  }
}

// Panggil fetchPageData saat komponen dimuat
onMounted(async () => {
  await fetchPageData('beranda');
});
</script>

<style>
/* Gaya spesifik halaman */
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

/* Gaya baru untuk tombol suara dan wrapper-nya */
.hero-image-wrapper {
  position: relative; /* Diperlukan agar positioning absolut pada anak elemen bekerja */
}

.sound-toggle-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: 1px solid white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.sound-toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>