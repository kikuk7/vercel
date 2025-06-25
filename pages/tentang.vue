<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <img src="/static/assets/tentang.JPG" alt="Tentang Kami" />
        </div>
      </div>
    </section>

    <section class="container">
      <div class="content card">
        <h2 class="section-title">Tentang Kami</h2>
        <p>
          CV Sumber Alam Raya adalah perusahaan manufaktur yang berbasis di Tegal, Jawa Tengah. Kami bergerak di bidang pengolahan besi untuk memenuhi kebutuhan industri, seperti tangki oli hidrolik, ornamen pagar, aksesori knalpot, serta berbagai komponen kendaraan lainnya.
        </p>
        <p>
          Didirikan pada tahun 2018, kami telah membangun reputasi sebagai penyedia produk berkualitas dengan layanan profesional dan pengiriman tepat waktu. Dengan pengalaman hampir 7 tahun, kami terus berinovasi dan mengembangkan bisnis untuk menjangkau pasar nasional hingga internasional melalui pendekatan digital yang adaptif dan efisien.
        </p>
      </div>
    </section>

    <section class="visi-misi">
      <div class="container visi-misi-box">
        <div>
          <h3>Visi</h3>
          <p>Membangun perusahaan yang profesional, berintegritas tinggi, inovatif dan berkelanjutan.</p>
        </div>
        <div>
          <h3>Misi</h3>
          <p>Menyediakan produk dan layanan unggulan, menjaga hubungan baik dengan pelanggan, serta berkontribusi positif terhadap industri dan masyarakat.</p>
        </div>
      </div>
    </section>

    <section class="galeri">
      <section class="container">
        <h2 class="section-title">Keunggulan Kami</h2>
      </section>
      <div class="tentang-grid">
        <img src="/static/assets/tentang2.png" alt="Keunggulan 1" />
        <img src="/static/assets/tentang1.png" alt="Keunggulan 2" />
        <img src="/static/assets/tentang3.png" alt="Keunggulan 3" />
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats'; // Import the mixin

export default {
  name: 'TentangPage',
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