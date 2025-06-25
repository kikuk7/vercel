<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        
      </div>

      <div class="user-profile">
        <img src="/assets/1.png" alt="John David" class="profile-pic" />
        <div class="user-info">
          <span class="user-name">John David</span>
          <span class="user-status online">Online</span>
        </div>
      </div>

      <nav class="main-nav">
        <ul>
          <li class="nav-item-header">General</li>
          <li :class="['nav-item', { 'active': $route.path === '/admin/dashboard' }]">
            <NuxtLink to="/admin/dashboard" class="nav-link">
              <i class="fas fa-tachometer-alt nav-icon"></i>
              <span>Dashboard</span>
            </NuxtLink>
          </li>
          <li :class="['nav-item', { 'active': $route.path.startsWith('/admin/pages') }, 'has-submenu', { 'open': openMenu === 'pages' || $route.path.startsWith('/admin/pages') }]">
            <a @click="toggleMenu('pages')" class="nav-link">
              <i class="fas fa-file-alt nav-icon"></i>
              <span>Manajemen Halaman</span> <i class="fas fa-chevron-right submenu-arrow"></i>
            </a>
            <ul class="submenu" v-if="openMenu === 'pages' || $route.path.startsWith('/admin/pages')">
                <li><NuxtLink to="/admin/pages" :class="{ 'active-sub': $route.path === '/admin/pages' }">Daftar Halaman</NuxtLink></li>
                <li><NuxtLink to="/admin/pages/create" :class="{ 'active-sub': $route.path === '/admin/pages/create' }">Tambah Halaman</NuxtLink></li>
            </ul>
          </li>
          <li :class="['nav-item', { 'active': $route.path.startsWith('/admin/products') }]">
            <NuxtLink to="/admin/products" class="nav-link">
              <i class="fas fa-box nav-icon"></i>
              <span>Manajemen Produk</span>
            </NuxtLink>
          </li>
          <li :class="['nav-item', { 'active': $route.path.startsWith('/admin/gallery') }]">
            <NuxtLink to="/admin/gallery" class="nav-link">
              <i class="fas fa-images nav-icon"></i>
              <span>Manajemen Galeri</span>
            </NuxtLink>
          </li>
          <li :class="['nav-item', { 'active': $route.path.startsWith('/admin/users') }]">
            <NuxtLink to="/admin/users" class="nav-link">
              <i class="fas fa-users nav-icon"></i>
              <span>Manajemen Pengguna</span>
            </NuxtLink>
          </li>
          <li :class="['nav-item', { 'active': $route.path.startsWith('/admin/settings') }]">
            <NuxtLink to="/admin/settings" class="nav-link">
              <i class="fas fa-cog nav-icon"></i>
              <span>Pengaturan</span>
            </NuxtLink>
          </li>
          <li class="nav-item-header">Lainnya</li>
          <li class="nav-item">
            <a @click="logout" class="nav-link">
              <i class="fas fa-sign-out-alt nav-icon"></i>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="main-content">
      

      <div class="page-content-wrapper">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const openMenu = ref(null);
const toggleMenu = (menuName) => {
  openMenu.value = openMenu.value === menuName ? null : menuName;
};

const logout = () => {
  if (process.client) {
    localStorage.removeItem('admin_logged_in');
  }
  router.push('/login');
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

:root {
  --primary-blue: #2c3e50;
  --secondary-blue: #34495e;
  --light-blue: #007bff;
  --text-color-light: #ecf0f1;
  --text-color-dark: #343a40;
  --border-color: #4e6277;
  --card-bg: white;
  --card-border: #e0e0e0;
  --sidebar-width: 250px;
  --navbar-height: 60px;
}

/* Global Reset/Normalize */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Arial', sans-serif;
  overflow-x: hidden;
}
*, *::before, *::after {
  box-sizing: border-box;
}

/* Main Layout Structure */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  width: 100%;
}

/* Sidebar Styling */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--primary-blue);
  color: var(--text-color-light);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  position: sticky; /* Menggunakan sticky agar sidebar ikut scroll jika konten terlalu panjang */
  top: 0; /* Penting untuk sticky */
  height: 100vh; /* Agar sidebar setinggi viewport */
  overflow-y: auto;
  z-index: 1000;
  flex-shrink: 0;
}

/* Main Content Area */
.main-content {
  flex-grow: 1;
  /* Tidak perlu margin-left karena sidebar tidak lagi position: fixed */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Top Navbar/Header */
.top-navbar {
  background-color: var(--card-bg);
  height: var(--navbar-height);
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  z-index: 999;
  width: 100%;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--text-color-dark);
}

.navbar-left, .navbar-right {
  display: flex;
  align-items: center;
}

/* Tombol hamburger dihapus, jadi gaya ini tidak diperlukan lagi */
.toggle-sidebar-btn {
  display: none;
}

.notification-icon, .user-dropdown {
  position: relative;
  margin-left: 25px;
  color: #777;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 3px 7px;
  font-size: 0.75em;
  line-height: 1;
}

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 1px solid #ccc;
}

.user-name-top {
  color: var(--text-color-dark);
  font-weight: 500;
}

/* Page Content Area Wrapper */
.page-content-wrapper {
  flex-grow: 1;
  padding: 20px;
  background-color: #f8f9fa;
  overflow-y: auto;
}

/* Sidebar Specific Styles (lanjutan) */
.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  justify-content: center;
}

.admin-logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.logo-text {
  font-size: 1.5em;
  font-weight: bold;
  color: white;
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.profile-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
  border: 2px solid var(--light-blue);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  font-size: 1.1em;
}

.user-status {
  font-size: 0.85em;
  display: flex;
  align-items: center;
  color: #bdc3c7;
}

.user-status.online::before {
  content: '';
  width: 8px;
  height: 8px;
  background-color: #28a745;
  border-radius: 50%;
  margin-right: 5px;
}

.main-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item-header {
  padding: 15px 20px 5px;
  font-size: 0.9em;
  color: #bdc3c7;
  text-transform: uppercase;
  font-weight: bold;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: var(--text-color-light);
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover, .nav-item.active .nav-link {
  background-color: var(--secondary-blue);
  color: rgb(128, 152, 224);
}

.nav-icon {
  margin-right: 15px;
  width: 20px;
  text-align: center;
}

.has-submenu .nav-link {
    justify-content: space-between;
}

.submenu {
  list-style: none;
  padding: 0;
  background-color: rgba(0,0,0,0.2);
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease-out;
}

.nav-item.open .submenu {
  max-height: 200px;
}

.submenu li a {
  display: block;
  padding: 10px 20px 10px 55px;
  color: var(--text-color-light);
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.submenu li a:hover, .submenu li .active-sub {
  background-color: rgba(0,0,0,0.3);
  color: white;
}

.submenu-arrow {
  transition: transform 0.2s ease;
}

.nav-item.open .submenu-arrow {
  transform: rotate(90deg);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  /* Untuk mobile (mode portrait) */
  .sidebar {
    width: var(--sidebar-width);
    position: absolute; /* Ubah ke absolute untuk menyembunyikan sepenuhnya dari view */
    left: -250px; /* Sembunyikan di luar layar */
    top: 0; /* Pastikan top 0 */
    height: 100%; /* Setinggi viewport */
    z-index: 1000;
    box-shadow: 4px 0 10px rgba(0,0,0,0.2);
    /* Tidak ada transisi transform karena tidak ada toggle JS */
  }
  
  .main-content {
    margin-left: 0; /* Konten utama tidak ada margin di mobile */
    width: 100%; /* Memenuhi lebar penuh */
  }
  .top-navbar {
    padding: 10px 15px;
  }
  /* Hapus semua gaya toggle-sidebar-btn karena tombol tidak ada */
  .top-navbar .navbar-left .toggle-sidebar-btn { /* Pastikan ini tidak muncul */
      display: none;
  }
  .top-navbar .navbar-right {
    display: none; /* Sembunyikan item kanan navbar di mobile untuk ruang */
  }
  .page-title {
    font-size: 1.2em;
  }
}
</style>