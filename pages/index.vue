<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <video autoplay muted loop>
            <source src="/static/assets/beranda.mp4" type="video/mp4" />
            Browser Anda tidak mendukung video.
          </video>
            <div class="hero-text">
            <h1>CV Sumber Alam Raya</h1>
            <NuxtLink to="/produk" class="btn-primary">lihat produk kami</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="content container layanan-kami-section">
      <div class="about-section">
        <div class="card">
          <h2>Tentang Kami</h2>
          <p>
            CV Sumber Alam Raya adalah perusahaan manufaktur berbahan dasar besi yang melayani berbagai kebutuhan industri, mulai dari otomotif, konstruksi, hingga pengadaan barang umum.
          </p>
          <NuxtLink to="/tentang" class="btn-outline">selengkapnya</NuxtLink>
        </div>

        <div class="card" style="margin-top: 50px;">
          <h2>Layanan Kami</h2>
          <p>CV Sumber Alam Raya adalah perusahaan manufaktur yang berbasis di Tegal, Jawa Tengah.</p>
          <NuxtLink to="/layanan" class="btn-outline">selengkapnya</NuxtLink>
        </div>
      </div>

      <div class="bottom-section">
        <div class="image-content">
          <img src="/static/assets/layanan2.jpg" alt="layanan2" class="img-small" />
          <img src="/static/assets/layanan1.jpg" alt="layanan1" class="img-large" />
          <img src="/static/assets/layanan3.jpg" alt="layanan3" class="img-small" />
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats';

export default {
  name: 'IndexPage',
  mixins: [visitorStats],
  mounted() {
    this.updateStats();
    this.intervalId = setInterval(this.updateStats, 30000);
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  }
}
</script>

<style>
/* Page-specific styles if any */
</style>