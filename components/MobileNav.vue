<template>
  <nav class="mobile-nav" id="mobileNavSidebar">
    <div class="close-button" @click="closeMobileNav">×</div>
    <ul>
      <li><NuxtLink to="/" @click="closeMobileNav">beranda</NuxtLink></li>
      <li><NuxtLink to="/tentang" @click="closeMobileNav">tentang</NuxtLink></li>
      <li><NuxtLink to="/layanan" @click="closeMobileNav">layanan</NuxtLink></li>
      <li><NuxtLink to="/produk" @click="closeMobileNav">produk</NuxtLink></li>
      <li><NuxtLink to="/galeri" @click="closeMobileNav">galeri</NuxtLink></li>
      <li><NuxtLink to="/kontak" @click="closeMobileNav">kontak</NuxtLink></li>
    </ul>
  </nav>

  <div class="logomobile">
      <img src="/static/assets/logo.png" alt="Logo" class="logo" />
    </div>

    <div class="menu">
      <div class="hamburger-menu" id="hamburgerMenu" @click="toggleMobileNav">☰</div>
      <nav class="desktop-nav"></nav>
      <NuxtLink to="/kontak" class="btn-secondary active">kontak</NuxtLink>
    </div>

    
</template>

<script>
export default {
  methods: {
    closeMobileNav() {
      const mobileNavSidebar = document.getElementById('mobileNavSidebar');
      if (mobileNavSidebar) {
        mobileNavSidebar.classList.remove('open');
      }
    },
    toggleMobileNav() {
      const mobileNavSidebar = document.getElementById('mobileNavSidebar');
      if (mobileNavSidebar) {
        mobileNavSidebar.classList.toggle('open');
      }
    }
  }
}
</script>
