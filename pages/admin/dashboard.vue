<template>
  <div class="py-3">
    <h1 class="mb-4 dashboard-page-title">Dashboard Utama</h1>
    <p class="lead">Selamat Datang kembali, Admin! Anda bisa mulai mengelola website Anda dari sini.</p>

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
                <h5 class="card-title">Total Pengguna</h5>
                <p class="card-text fs-4 fw-bold">{{ totalUsers }}</p>
              </div>
              <i class="fas fa-users fa-3x stat-icon"></i>
            </div>
            <NuxtLink to="/admin/users" class="text-white text-decoration-none card-footer-link">Lihat Pengguna <i class="fas fa-arrow-circle-right ms-2"></i></NuxtLink>
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
import { ref } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: ['auth-admin'],
  title: 'Dashboard'
});

const totalPages = ref(7);
const totalUsers = ref(125);
const latestActivity = ref('Halaman Kontak Diperbarui');
const recentActivities = ref([
  'Pengguna John Doe memperbarui halaman "Kontak" (2 menit yang lalu)',
  'Admin John David login ke dashboard (baru saja)',
  'Produk baru "Tangki Oli Hidrolik" ditambahkan (1 jam yang lalu)',
  'Gambar galeri baru diunggah (3 jam yang lalu)'
]);

// Fungsi untuk mengambil data aktual dari API (placeholder)
// import { onMounted } from 'vue';
// onMounted(() => {
//   // Implementasikan pemanggilan API di sini
// });
</script>

<style scoped>
/* Variabel CSS (opsional, bisa diambil dari file utama jika sudah ada) */
:root {
  --primary-blue: #0d6efd;
  --success-green: #198754;
  --info-cyan: #0dcaf0;
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
.me-3 { margin-right: 1rem; }
.ms-2 { margin-left: 0.5rem; }
.d-flex { display: flex; }
.align-items-center { align-items: center; }
.justify-content-between { justify-content: space-between; }
.fs-4 { font-size: 1.5rem !important; }
.fs-6 { font-size: 1rem !important; }
.fw-bold { font-weight: 700 !important; }
.lead { font-size: 1.25rem; font-weight: 300; color: #6c757d; }
.mb-0 { margin-bottom: 0 !important; }
.text-white { color: #000000 !important; }
.text-decoration-none { text-decoration: none !important; }

.dashboard-page-title {
  color: var(--text-dark);
}

/* Row Grid */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.75rem; /* Setengah dari --bs-gutter-x */
  margin-left: -0.75rem; /* Setengah dari --bs-gutter-x */
  margin-top: calc(-1 * 1.5rem); /* Mengimbangi gap vertikal jika ada mt-* di child */
}
.row > * {
  padding-right: 0.75rem; /* Setengah dari --bs-gutter-x */
  padding-left: 0.75rem;  /* Setengah dari --bs-gutter-x */
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  margin-top: 1.5rem; /* Setara dengan g-4 */
}

/* Grid columns for responsiveness */
@media (min-width: 768px) { /* Medium devices (md) and up */
  .col-md-4 {
    flex: 0 0 auto;
    width: 33.33333333%;
  }
  .col-md-6 { /* Jika ada kasus 2 kolom */
    flex: 0 0 auto;
    width: 50%;
  }
}
@media (min-width: 576px) { /* Small devices (sm) and up */
  .col-sm-6 {
    flex: 0 0 auto;
    width: 50%;
  }
}
.col-12 { /* Default for all screen sizes */
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
  height: 100%; /* Agar semua kartu memiliki tinggi yang sama dalam baris */
  overflow: hidden; /* Penting untuk stretched-link */
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
    padding: 0.75rem 1rem; /* Padding footer link */
    background-color: rgba(0,0,0,0.1); /* Sedikit gelap */
    color: rgb(255, 255, 255);
    text-decoration: none;
    font-size: 0.9em;
    transition: background-color 0.2s ease;
    /* Membuat link memenuhi lebar footer kartu */
    position: relative; /* Penting agar tidak menjadi stretched-link asli */
    z-index: 2; /* Pastikan di atas konten kartu jika ada stretched-link */
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
    width: 100%; /* Pastikan mengisi lebar penuh */
    margin-top: auto; /* Mendorong ke bawah */
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