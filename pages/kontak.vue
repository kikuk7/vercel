<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <img :src="heroImage" alt="Layanan Hero" />
          <div class="overlay-text">{{ heroOverlayText }}</div>
        </div>
      </div>
    </section>

    <section class="kontak-kami">
      <h2>Kontak Kami</h2>
      <div class="info-boxes">
        <div class="info-card">
          <div class="icon"><img src="/static/assets/icon/telp 2.png" alt="Ikon Telepon"></div>
          <h3>Telepon</h3>
          <p>{{ contactInfo.phone }}</p>
        </div>
        <div class="info-card">
          <div class="icon"><img src="/static/assets/icon/home.png" alt="Ikon Lokasi"></div>
          <h3>Kunjungi kami</h3>
          <p>{{ contactInfo.address }}</p>
        </div>
        <div class="info-card">
          <div class="icon"><img src="/static/assets/icon/email 2.png" alt="Ikon Email"></div>
          <h3>Email</h3>
          <p>{{ contactInfo.email }}</p>
        </div>
      </div>

      <div class="atau">atau</div>
      <div class="wa-button">
        <a :href="contactInfo.whatsappLink" class="btn-primary"><img src="/static/assets/icon/WA.png" alt="WhatsApp Icon" class="btn-icon-img"> WA Sekarang</a>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats';

export default {
  name: 'KontakPage',
  mixins: [visitorStats],
  data() {
    return {
      // Inisialisasi data default, ini akan ditimpa oleh data dari API
      heroImage: '/static/assets/Foto Galeri/1.jpg',
      heroOverlayText: 'Kepuasan Anda Tujuan Kami',
      contactInfo: {
        phone: '+62 895 0479 8167',
        address: 'Desa Bengledukuh, Bengle, Kec. Talang, Kabupaten Tegal, Jawa Tengah 52193',
        email: 'sumberalam423@gmail.com',
        whatsappLink: 'https://wa.me/+6287801319313'
      }
    };
  },
  async mounted() {
    // Panggil API untuk mendapatkan data kontak
    try {
      const response = await fetch('/api/kontak'); // Ganti dengan endpoint API Anda
      const data = await response.json();
      if (data) {
        this.heroImage = data.heroImage || this.heroImage;
        this.heroOverlayText = data.heroOverlayText || this.heroOverlayText;
        this.contactInfo = { ...this.contactInfo, ...data.contactInfo };
      }
    } catch (e) {
      console.error('Gagal mengambil data kontak:', e);
    }
    this.updateStats();
    this.intervalId = setInterval(this.updateStats, 30000);
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  }
}
</script>
<style>
/* Add kontak.css content here */
</style>