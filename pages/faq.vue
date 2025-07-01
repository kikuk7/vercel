<template>
  <main>
    <section class="faq-section">
      <!-- Menggunakan faq_main_title dari database -->
      <h2>{{ page.faq_main_title }}</h2>

      <!-- Menggunakan faqItems yang dibangun dari data database -->
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
import { useRuntimeConfig } from '#app'; // Impor useRuntimeConfig

export default {
  name: 'FaqPage',
  data() {
    return {
      activeIndex: null,
      // Properti 'page' untuk data utama dari DB
      page: {
        faq_main_title: 'Memuat FAQ...'
      },
      // faqItems akan dibangun setelah data API diambil
      faqItems: [] 
    };
  },
  methods: {
    toggleAnswer(index) {
      this.activeIndex = this.activeIndex === index ? null : index;
    },
    async fetchPageData(slug, apiBaseUrl) { // Terima apiBaseUrl sebagai argumen
      try {
        const response = await fetch(`${apiBaseUrl}/pages/${slug}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();
        this.page = data; 

        // Bangun array faqItems dari properti halaman yang flat
        this.faqItems = [];
        for (let i = 1; i <= 5; i++) { // Asumsi ada 5 item FAQ seperti di form admin
          if (data[`faq_${i}_question`] && data[`faq_${i}_answer`]) {
            this.faqItems.push({
              question: data[`faq_${i}_question`],
              answer: data[`faq_${i}_answer`]
            });
          }
        }
      } catch (error) {
        console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
        // Fallback data
        this.page.faq_main_title = 'FAQ Tidak Tersedia';
        this.faqItems = [
          { question: 'Error memuat pertanyaan.', answer: 'Silakan coba lagi nanti.' }
        ];
      }
    }
  },
  async mounted() { // Ubah mounted menjadi async
    const config = useRuntimeConfig(); // Ambil runtime config
    const API_BASE_URL = config.public.apiBase; // Akses properti 'public.apiBase'

    // Panggil API untuk mendapatkan data halaman 'faq'
    await this.fetchPageData('faq', API_BASE_URL);
    this.updateStats(); 
    this.intervalId = setInterval(this.updateStats, 30000); 
  },
  beforeDestroy() {
    clearInterval(this.intervalId); 
  }
}
</script>
<style>
/* Add faq.css content here */
</style>
