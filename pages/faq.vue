<template>
  <main>
    <section class="faq-section">
      <!-- Menggunakan faq_main_title dari database -->
      <h2>{{ page.faq_main_title || 'FAQ' }}</h2> <!-- Fallback jika judul kosong -->

      <!-- Menggunakan faqItems yang dibangun dari data database -->
      <div class="faq-item" v-for="(item, index) in faqItems" :key="index">
        <div class="faq-question" @click="toggleAnswer(index)" :class="{ 'active': activeIndex === index }">
          {{ item.question }}
          <span class="toggle-icon">{{ activeIndex === index ? '-' : '+' }}</span> <!-- Tambahkan ikon +/- -->
        </div>
        <div class="faq-answer" :class="{ 'show': activeIndex === index }">
          {{ item.answer }}
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';
// Impor useVisitorStats.js. Pastikan path ini benar!
// Berdasarkan diskusi terakhir, sepertinya di '~/components/useVisitorStats.js'
import { useVisitorStats } from '~/components/useVisitorStats'; 

// Panggil composable useVisitorStats di sini.
// Ini akan mengelola seluruh logika visitor counter (fetch, update, onMounted, onUnmounted).
const { totalVisitors, todayVisitors, onlineUsers } = useVisitorStats();

const config = useRuntimeConfig();
const API_BASE_URL = config.public.apiBase;

// Gunakan ref untuk state reaktif
const activeIndex = ref(null);
const page = ref({
  faq_main_title: 'Memuat FAQ...'
});
const faqItems = ref([]); // Gunakan ref untuk faqItems

// Fungsi untuk mengelola tampilan jawaban FAQ
const toggleAnswer = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

// Fungsi untuk mengambil data halaman dari backend
async function fetchPageData(slug) {
  try {
    // URL endpoint API backend Anda harus diawali dengan /api/
    const response = await fetch(`${API_BASE_URL}/api/pages/${slug}`);
    if (!response.ok) {
      const errorText = await response.text(); 
      throw new Error(`HTTP error! status: ${response.status}: ${errorText || 'Unknown error'}`);
    }
    const data = await response.json();
    page.value = data; 

    // Bangun array faqItems dari properti halaman yang flat
    const tempFaqItems = [];
    for (let i = 1; i <= 5; i++) { // Asumsi ada 5 item FAQ seperti di form admin
      if (data[`faq_${i}_question`] && data[`faq_${i}_answer`]) {
        tempFaqItems.push({
          question: data[`faq_${i}_question`],
          answer: data[`faq_${i}_answer`]
        });
      }
    }
    faqItems.value = tempFaqItems; // Perbarui ref faqItems
  } catch (error) {
    console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
    // Fallback data
    page.value.faq_main_title = 'FAQ Tidak Tersedia';
    faqItems.value = [
      { question: 'Error memuat pertanyaan.', answer: 'Silakan coba lagi nanti.' }
    ];
  }
}

// Panggil fetchPageData saat komponen dimuat
onMounted(async () => {
  await fetchPageData('faq');
  // Penting: Jangan ada lagi panggilan manual this.updateStats() atau setInterval di sini.
  // useVisitorStats() sudah mengelola logikanya sendiri secara internal.
});
</script>

<style>
/* Add faq.css content here */
</style>
