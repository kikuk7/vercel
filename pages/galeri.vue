<template>
  <main>
    <section class="galeri">
      <h2>Galeri Kami</h2>
      <p>
        Dokumentasi visual dari setiap proses dan hasil karya kami mencerminkan komitmen terhadap kualitas dan ketelitian. Melalui galeri ini, Anda dapat melihat bagaimana kami bekerja dengan penuh dedikasi dan tim yang berpengalaman untuk menghasilkan solusi terbaik bagi kebutuhan industri Anda.
      </p>
      <div class="parent">
        <div class="div7"><img src="/assets/Foto Galeri/DSCF5415.JPG" alt="Galeri 1"></div>
        <div class="div8"><img src="/assets/Foto Galeri/5.jpg" alt="Galeri 2"></div>
        <div class="div9"><img src="/assets/Foto Galeri/DSCF5362.JPG" alt="Galeri 3"></div>
        <div class="div10"><img src="/DSCF5374.JPG" alt="Galeri 4"></div>
        <div class="div11"><img src="/assets/Foto Galeri/DSCF5418.JPG" alt="Galeri 5"></div>
        <div class="div12"><img src="/assets/DSCF5359.JPG" alt="Galeri 6"></div>
        <div class="div13"><img src="/assets/DSCF5365.jpg" alt="Galeri 7"></div>
        <div class="div14"><img src="/assets/DSCF5361.JPG" alt="Galeri 8"></div>
        <div class="div15"><img src="/assets/Foto Galeri/DSCF5421.JPG" alt="Galeri 9"></div>
        <div class="div16"><img src="/assets/DSCF5360.JPG" alt="Galeri 10"></div>
        <div class="div17"><img src="/assets/DSCF5385.JPG" alt="Galeri 11"></div>
        <div class="div18"><img src="/assets/tentang.JPG" alt="Galeri 12"></div>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats'; // Import the mixin

export default {
  name: 'GaleriPage',
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