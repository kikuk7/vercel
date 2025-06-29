<template>
  <section class="contact-section">
    <div class="container contact-grid">
      <div class="kontak-info">
        <h3>Kontak</h3>
        <p class="contact-item"><img src="/static/assets/icon/email 1.png" alt="Email Icon" class="contact-icon"> {{ page.contact_email_address }}</p>
        <p class="contact-item"><img src="/static/assets/icon/telepon.png" alt="Phone Icon" class="contact-icon"> {{ page.contact_phone }}</p>
        <p class="contact-item"><img src="/static/assets/icon/WA.png" alt="WhatsApp Icon" class="contact-icon"> {{ page.contact_whatsapp_number }}</p>
      </div>
      <div class="lokasi-info">
        <h3>{{ page.contact_location_title }}</h3>
        <p>{{ page.contact_location_body }}</p>
        <a :href="`https://wa.me/${page.contact_whatsapp_number}`" 
           :class="['btn-primary', 'contact-section-btn', { 'hidden-on-specific-pages': shouldHideButton }]">
          <img src="/static/assets/icon/WA.png" alt="WhatsApp Icon" class="btn-icon-img"> hubungi kami
        </a>
      </div>
      <div class="pengunjung-info">
        <h3>Pengunjung</h3>
        <!-- PENTING: Sekarang menggunakan binding Vue ke properti data dari mixin -->
        <p class="visitor-item"><img src="/static/assets/icon/person.png" alt="Online User Icon" class="visitor-icon"> Pengguna Online: <span>{{ onlineUsers }}</span></p>
        <p class="visitor-item"><img src="/static/assets/icon/person.png" alt="Visitor Today Icon" class="visitor-icon"> Pengunjung Hari Ini: <span>{{ todayVisitors }}</span></p>
        <p class="visitor-item"><img src="/static/assets/icon/person.png" alt="Total Pengunjung:"> Total Pengunjung: <span>{{ totalVisitors }}</span></p>
      </div>
    </div>

    <div class="map">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63281.57198165715!2d109.02007107341548!3d-6.895978278010659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b1aa9b8c8a1%3A0x3027a76e35212aa6!2sTegal%2C%20Central%20Java%2C%20Indonesia!5e0!3m2!1sen!2sid!4v1685389336040!5m2!1sen!2sid"
        width="100%" height="250" style="border:0; border-radius: 12px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from '#app';
import { useRuntimeConfig } from '#app';
import useVisitorStats from '~/mixins/visitorStats'; // Impor composable useVisitorStats

const route = useRoute();
const config = useRuntimeConfig();
const API_BASE_URL = config.public.apiBase;

const page = ref({
  contact_email_address: 'Memuat...',
  contact_phone: 'Memuat...',
  contact_whatsapp_number: 'Memuat...',
  contact_location_title: 'Memuat...',
  contact_location_body: 'Memuat...'
});

// Panggil composable useVisitorStats
// Ini akan menyediakan onlineUsers, todayVisitors, totalVisitors sebagai refs
const { onlineUsers, todayVisitors, totalVisitors } = useVisitorStats();

// Computed property untuk menentukan apakah tombol harus disembunyikan
const shouldHideButton = computed(() => {
  const currentPath = route.path; 
  const pagesToHideButton = [
    '/produk', 
    '/kontak'
  ];
  return pagesToHideButton.includes(currentPath);
});

// Fungsi untuk memuat data halaman 'kontak' dari database
async function fetchContactPageData() {
  try {
    const response = await fetch(`${API_BASE_URL}/pages/kontak`); 
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || 'Unknown error'}`);
    }
    const data = await response.json();
    page.value = data; 
  } catch (error) {
    console.error(`Gagal mengambil data halaman 'kontak' dari API:`, error);
    page.value.contact_email_address = 'Error Memuat';
    page.value.contact_phone = 'Error Memuat';
    page.value.contact_whatsapp_number = '';
    page.value.contact_location_title = 'Error Memuat';
    page.value.contact_location_body = 'Error Memuat';
  }
}

onMounted(() => {
  fetchContactPageData(); // Panggil saat komponen dimuat
  // updateStats() dan setInterval() tidak perlu dipanggil di sini,
  // karena sudah diurus oleh composable `useVisitorStats` di dalamnya sendiri.
});
</script>

<style scoped>


.hidden-on-specific-pages {
  display: none !important; 
}


</style>
