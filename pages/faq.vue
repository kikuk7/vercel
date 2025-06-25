<template>
  <main>
    <section class="faq-section">
      <h2>Frequently Ask Question</h2>

      <div class="faq-item" v-for="(item, index) in faqItems" :key="index">
        <div class="faq-question" @click="toggleAnswer(index)" :class="{ 'active': activeIndex === index }">
          {{ item.question }}
        </div>
        <div class="faq-answer" :class="{ 'show': activeIndex === index }">
          {{ item.answer }}
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats'; // Import the mixin

export default {
  name: 'FaqPage',
  mixins: [visitorStats], // Use the mixin for visitor stats
  data() {
    return {
      activeIndex: null,
      faqItems: [
        {
          question: "Produk apa saja yang diproduksi oleh CV Sumber Alam Raya?",
          answer: "Kami memproduksi beragam produk berbahan dasar besi seperti tangki oli hidrolik, ornamen pagar, aksesoris knalpot, pipa hollow, dan komponen kendaraan lainnya."
        },
        {
          question: "Apakah bisa pesan produk custom sesuai kebutuhan?",
          answer: "Ya, kami menerima pemesanan produk sesuai desain atau spesifikasi dari pelanggan."
        },
        {
          question: "Bagaimana cara melakukan pemesanan?",
          answer: "Anda dapat menghubungi kami melalui WhatsApp pada website ini. Tim kami akan membantu Anda dalam proses pemesanan."
        },
        {
          question: "Berapa lama waktu produksi dan pengiriman?",
          answer: "Waktu produksi dan pengiriman bervariasi tergantung kompleksitas dan lokasi. Umumnya 3–7 hari kerja."
        },
        {
          question: "Apakah bisa melakukan kerja sama jangka panjang?",
          answer: "Tentu saja! Kami terbuka untuk kerja sama jangka panjang dengan perusahaan, instansi, atau mitra distribusi."
        }
      ]
    };
  },
  methods: {
    toggleAnswer(index) {
      this.activeIndex = this.activeIndex === index ? null : index;
    }
  },
  mounted() {
    this.updateStats(); // Call updateStats when the component is mounted
    this.intervalId = setInterval(this.updateStats, 30000); // Set up interval
  },
  beforeDestroy() {
    clearInterval(this.intervalId); // Clear interval when component is destroyed
  }
}
</script>
<style>
/* Add faq.css content here */
</style>