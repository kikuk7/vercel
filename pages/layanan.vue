<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <img src="/static/assets/layanan2.jpg" alt="Layanan Hero" />
        </div>
      </div>
    </section>

    <section class="container">
      <div class="content card">
        <h2 class="section-title">Layanan Kami</h2>
        <p>
          Dalam menjalankan usahanya di bidang manufaktur berbasis besi, CV Sumber Alam Raya berkomitmen untuk memberikan layanan yang profesional, tepat guna, dan sesuai dengan kebutuhan industri. Perusahaan ini menghadirkan berbagai solusi dalam pengolahan besi yang dapat disesuaikan dengan permintaan pelanggan, baik untuk keperluan konstruksi, otomotif, maupun pengadaan industri. Adapun layanan utama yang ditawarkan meliputi:
        </p>
      </div>

      <div class="service-grid">
        <div class="service-card">
          <img src="/static/assets/layanan1.jpg" alt="Jasa Fabrikasi" />
          <h3>Jasa Fabrikasi Besi Custom</h3>
          <p>CV Sumber Alam Raya menyediakan layanan pengolahan bahan baku besi menjadi produk akhir sesuai permintaan pelanggan. Contoh produk: Tangki oli hidrolik, Komponen Knalpot, Komponen khusus industri.</p>
        </div>

        <div class="service-card">
          <img src="/static/assets/Foto Galeri/3.jpg" alt="Komponen Besi" />
          <h3>Produksi Ornamen dan Komponen Besi</h3>
          <p>Menyediakan komponen otomotif (seperti knalpot motor) serta ornamen besi untuk kebutuhan konstruksi dan dekorasi, seperti pagar besi dan ornamen arsitektural.</p>
        </div>

        <div class="service-card">
          <img src="/static/assets/Foto Galeri/6.JPG" alt="Pengadaan Barang" />
          <h3>Pengadaan Barang Berbahan Dasar Besi</h3>
          <p>Layanan penyediaan produk berbasis besi untuk sektor industri, baik dalam skala kecil hingga menengah, dengan jaminan kualitas dan ketepatan waktu.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats'; // Import the mixin

export default {
  name: 'LayananPage',
  mixins: [visitorStats], // Use the mixin for visitor stats
  mounted() {
    this.updateStats(); // Call updateStats when the component is mounted
    this.intervalId = setInterval(this.updateStats, 30000); // Set up interval
  },
  beforeDestroy() {
    clearInterval(this.intervalId); // Clear interval when component is destroyed
  }
}
</script>