<template>
  <nav class="mobile-nav" id="mobileNavSidebar">
    <div class="close-button" id="closeMobileNav" @click="closeMobileNav">×</div>
    <ul>
      <li><NuxtLink to="/" @click="closeMobileNav">beranda</NuxtLink></li>
      <li><NuxtLink to="/tentang" @click="closeMobileNav">tentang</NuxtLink></li>
      <li><NuxtLink to="/layanan" @click="closeMobileNav">layanan</NuxtLink></li>
      <li><NuxtLink to="/produk" @click="closeMobileNav">produk</NuxtLink></li>
      <li><NuxtLink to="/galeri" @click="closeMobileNav">galeri</NuxtLink></li>
      <li><NuxtLink to="/kontak" @click="closeMobileNav">kontak</NuxtLink></li>
    </ul>
  </nav>
</template>

<script>
export default {
  methods: {
    closeMobileNav() {
      const mobileNavSidebar = document.getElementById('mobileNavSidebar');
      if (mobileNavSidebar) {
        mobileNavSidebar.classList.remove('open');
      }
    }
  }
}
</script>