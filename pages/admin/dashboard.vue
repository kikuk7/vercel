<template>
  <div class="py-3">
    <h1 class="mb-4 dashboard-page-title">Dashboard Utama</h1>
    <p class="lead">Selamat Datang kembali, John David! Anda bisa mulai mengelola website Anda dari sini.</p>

    <div class="row g-4 mt-4">
      <div class="col-md-4 col-sm-6 col-12">
        <div class="card text-white bg-primary mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h5 class="card-title">Total Halaman</h5>
                <p class="card-text fs-4 fw-bold">{{ totalPages }}</p>
              </div>
              <i class="fas fa-file-alt fa-3x stat-icon"></i>
            </div>
            <NuxtLink to="/admin/pages" class="text-white text-decoration-none card-footer-link">Lihat Halaman <i class="fas fa-arrow-circle-right ms-2"></i></NuxtLink>
          </div>
        </div>
      </div>
      <div class="col-md-4 col-sm-6 col-12">
        <div class="card text-white bg-success mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h5 class="card-title">Manajemen Galeri</h5>
                <p class="card-text fs-4 fw-bold">{{ totalGalleryImages }}</p>
              </div>
              <i class="fas fa-images fa-3x stat-icon"></i>
            </div>
            <NuxtLink to="/admin/gallery" class="text-white text-decoration-none card-footer-link">Edit Galeri <i class="fas fa-arrow-circle-right ms-2"></i></NuxtLink>
          </div>
        </div>
      </div>
      <div class="col-md-4 col-sm-6 col-12">
        <div class="card text-white bg-warning mb-3"> <!-- Warna yang berbeda untuk kontak -->
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h5 class="card-title">Edit Kontak</h5>
                <p class="card-text fs-4 fw-bold"><i class="fas fa-phone-alt"></i> / <i class="fas fa-envelope"></i></p>
              </div>
              <i class="fas fa-address-book fa-3x stat-icon"></i>
            </div>
            <NuxtLink to="/admin/edit-kontak" class="text-white text-decoration-none card-footer-link">Edit Info Kontak <i class="fas fa-arrow-circle-right ms-2"></i></NuxtLink>
          </div>
        </div>
      </div>
      <div class="col-md-4 col-sm-12 col-12">
        <div class="card text-white bg-info mb-3">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h5 class="card-title">Aktivitas Terakhir</h5>
                <p class="card-text fs-6">{{ latestActivity }}</p>
              </div>
              <i class="fas fa-calendar-alt fa-3x stat-icon"></i>
            </div>
            <NuxtLink to="/admin/activity-log" class="text-white text-decoration-none card-footer-link">Lihat Log <i class="fas fa-arrow-circle-right ms-2"></i></NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-4 shadow-sm border-0">
      <div class="card-header bg-light">
        <h5 class="mb-0">Aktivitas Terbaru</h5>
      </div>
      <div class="card-body">
        <ul class="list-group list-group-flush">
          <li class="list-group-item" v-for="(activity, index) in recentActivities" :key="index">
            {{ activity }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';

definePageMeta({
  layout: 'admin',
  middleware: ['auth-admin'],
  title: 'Dashboard'
});

const totalPages = ref(0); // Akan diambil dari API
const totalUsers = ref(0); // Akan diambil dari API atau dihilangkan
const totalGalleryImages = ref(0); // Akan diambil dari API
const latestActivity = ref('Memuat...');
const recentActivities = ref([]);

const config = useRuntimeConfig(); 
const API_BASE_URL = config.public.apiBase; 

// Fungsi untuk mengambil statistik dari API
async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/pages`); // Mengambil semua halaman
    if (!response.ok) {
      throw new Error('Gagal mengambil data statistik.');
    }
    const pagesData = await response.json();
    
    totalPages.value = pagesData.length; // Hitung total halaman
    
    // Temukan halaman galeri untuk menghitung gambar
    const galleryPageData = pagesData.find(p => p.slug === 'galeri');
    if (galleryPageData && galleryPageData.images) {
      // Pastikan images di-parse jika masih string JSON
      let imagesArray = galleryPageData.images;
      if (typeof imagesArray === 'string' && imagesArray.startsWith('[')) {
        try {
          imagesArray = JSON.parse(imagesArray);
        } catch (e) {
          console.error("Failed to parse gallery images for stats:", e);
          imagesArray = [];
        }
      } else if (!Array.isArray(imagesArray)) {
          imagesArray = [];
      }
      totalGalleryImages.value = imagesArray.length;
    } else {
      totalGalleryImages.value = 0;
    }

    // Placeholder untuk totalUsers dan recentActivities jika tidak ada API khusus
    totalUsers.value = 125; // Tetap hardcode jika tidak ada API pengguna
    latestActivity.value = 'Data terbaru berhasil dimuat.';
    recentActivities.value = [
      'Data dashboard diperbarui.',
      'Periksa halaman individual untuk aktivitas spesifik.'
    ];


  } catch (e) {
    console.error('Error fetching dashboard stats:', e);
    errorMessage.value = 'Gagal memuat statistik dashboard.';
    totalPages.value = 'N/A';
    totalUsers.value = 'N/A';
    totalGalleryImages.value = 'N/A';
    latestActivity.value = 'Gagal memuat.';
    recentActivities.value = ['Gagal memuat aktivitas.'];
  }
}

onMounted(fetchStats); // Muat statistik saat dashboard dimuat
</script>

<style scoped>
/* Variabel CSS */
:root {
  --primary-blue: #0d6efd;
  --success-green: #198754;
  --info-cyan: #0dcaf0;
  --warning-orange: #ffc107; /* Warna baru untuk kontak */
  --dark-gray: #212529;
  --light-gray: #f8f9fa;
  --text-dark: #343a40;
  --border-light: rgba(0,0,0,.125);
  --card-bg: white;
}

/* Base Utilities - Mimicking Bootstrap */
.py-3 { padding-top: 1rem; padding-bottom: 1rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mt-4 { margin-top: 1.5rem; }
.ms-2 { margin-left: 0.5rem; }
.d-flex { display: flex; }
.align-items-center { align-items: center; }
.justify-content-between { justify-content: space-between; }
.fs-4 { font-size: 1.5rem !important; }
.fs-6 { font-size: 1rem !important; }
.fw-bold { font-weight: 700 !important; }
.lead { font-size: 1.25rem; font-weight: 300; color: #6c757d; }
.mb-0 { margin-bottom: 0 !important; }
.text-white { color: #fff !important; } /* Diubah agar teks putih benar */
.text-decoration-none { text-decoration: none !important; }

.dashboard-page-title {
  color: var(--text-dark);
}

/* Row Grid */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.75rem; 
  margin-left: -0.75rem; 
  margin-top: calc(-1 * 1.5rem); 
}
.row > * {
  padding-right: 0.75rem; 
  padding-left: 0.75rem; 
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  margin-top: 1.5rem; 
}

/* Grid columns for responsiveness */
@media (min-width: 768px) { 
  .col-md-4 {
    flex: 0 0 auto;
    width: 33.33333333%;
  }
  .col-md-6 { 
    flex: 0 0 auto;
    width: 50%;
  }
}
@media (min-width: 576px) { 
  .col-sm-6 {
    flex: 0 0 auto;
    width: 50%;
  }
}
.col-12 { 
  flex: 0 0 auto;
  width: 100%;
}

/* Card Styling */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: var(--card-bg);
  background-clip: border-box;
  border: 1px solid var(--border-light);
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,.075);
  height: 100%; 
  overflow: hidden; 
}
.card-body {
  flex: 1 1 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
.card-title {
  margin-bottom: 0.5rem;
  font-size: 1.1em;
}
.card-text {
  margin-bottom: 0;
}

/* Card Colors */
.bg-primary { background-color: var(--primary-blue) !important; }
.bg-success { background-color: var(--success-green) !important; }
.bg-info { background-color: var(--info-cyan) !important; }
.bg-warning { background-color: var(--warning-orange) !important; } /* Warna baru */


/* Statistik Icon di dalam kartu */
.stat-icon {
    font-size: 3em;
    opacity: 0.7;
    margin-left: 1rem;
}

/* Card Footer Link */
.card-footer-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem; 
    background-color: rgba(0,0,0,0.1); 
    color: rgb(255, 255, 255);
    text-decoration: none;
    font-size: 0.9em;
    transition: background-color 0.2s ease;
    position: relative; 
    z-index: 2; 
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
    width: 100%; 
    margin-top: auto; 
}

.card-footer-link:hover {
    background-color: rgba(0,0,0,0.2);
    text-decoration: none;
}
.card-footer-link .ms-2 { margin-left: 0.5rem; }


/* Card Header untuk Aktivitas Terbaru */
.card-header {
  padding: 0.75rem 1.25rem;
  margin-bottom: 0;
  background-color: var(--light-gray);
  border-bottom: 1px solid var(--border-light);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}

/* List Group for Activities */
.list-group {
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
  border-radius: 0.25rem;
}
.list-group-flush > .list-group-item {
  border-width: 0 0 1px;
  border-color: var(--border-light);
  border-right-width: 0;
  border-left-width: 0;
  border-radius: 0;
}
.list-group-item {
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  background-color: #fff;
  color: var(--text-dark);
}
.list-group-item:last-child {
    border-bottom: 0;
}
</style>