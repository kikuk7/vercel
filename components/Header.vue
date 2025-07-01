<template>
  <header>
    <div class="navbar container">
      <div class="logo-container">
        <img src="/static/assets/lgc.png" alt="Logo" class="logo" />
      </div>

      <nav class="desktop-nav">
        <ul class="nav-links">
          <li><NuxtLink to="/">beranda</NuxtLink></li>
          <li><NuxtLink to="/tentang">tentang</NuxtLink></li>
          <li><NuxtLink to="/layanan">layanan</NuxtLink></li>
          <li><NuxtLink to="/produk">produk</NuxtLink></li>
          <li><NuxtLink to="/galeri">galeri</NuxtLink></li>
        </ul>
      </nav>
      <NuxtLink to="/kontak" class="btn-secondary active">kontak</NuxtLink>
    </div>

    <div class="logomobile">
      <img src="/static/assets/lgc.png" alt="Logo" class="logo" />
    </div>

    <div class="menu">
      <div class="hamburger-menu" id="hamburgerMenu" @click="toggleMobileNav">☰</div>
      <nav class="desktop-nav"></nav>
      <NuxtLink to="/kontak" class="btn-secondary active">kontak</NuxtLink>
    </div>
  </header>
</template>

<script>
export default {
  methods: {
    toggleMobileNav() {
      const mobileNavSidebar = document.getElementById('mobileNavSidebar');
      if (mobileNavSidebar) {
        mobileNavSidebar.classList.toggle('open');
      }
    }
  }
}
</script>