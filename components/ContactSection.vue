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
        <p class="visitor-item"><img src="/static/assets/icon/person.png" alt="Online User Icon" class="visitor-icon"> Pengguna Online: <span>{{ onlineUsers }}</span></p>
        <p class="visitor-item"><img src="/static/assets/icon/person.png" alt="Visitor Today Icon" class="visitor-icon"> Pengunjung Hari Ini: <span>{{ todayVisitors }}</span></p>
        <p class="visitor-item"><img src="/static/assets/icon/person.png" alt="Total Visitor Icon" class="visitor-icon"> Total Pengunjung: <span>{{ totalVisitors }}</span></p>
      </div>
    </div>

    <div class="map">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.214470438183!2d109.11709407421114!3d-7.332304975239169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f9d50a256e297%3A0xc3f5b91b9f7a7f45!2sCV%20Sumber%20Alam%20Raya!5e0!3m2!1sid!2sid!4v1719665671561!5m2!1sid!2sid"
        width="100%" height="250" style="border:0; border-radius: 12px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'; // Impor onBeforeUnmount juga
import { useRoute } from '#app';
import { useRuntimeConfig } from '#app';

const route = useRoute();
const config = useRuntimeConfig();
const API_BASE_URL = config.public.apiBase;

// Page data untuk informasi kontak
const page = ref({
  contact_email_address: 'Memuat...',
  contact_phone: 'Memuat...',
  contact_whatsapp_number: 'Memuat...',
  contact_location_title: 'Memuat...',
  contact_location_body: 'Memuat...'
});

// Statistik Pengunjung
const onlineUsers = ref(0);
const todayVisitors = ref(0);
const totalVisitors = ref(0);
let intervalId = null; // Untuk menyimpan ID interval

// Computed property untuk menentukan apakah tombol harus disembunyikan
const shouldHideButton = computed(() => {
  const currentPath = route.path;
  const pagesToHideButton = [
    '/produk',
    '/kontak' // Halaman kontak sendiri tidak perlu tombol WhatsApp di bagian ini jika sudah ada ikon
  ];
  return pagesToHideButton.includes(currentPath);
});

// Fungsi untuk memuat data halaman 'kontak'
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

// Fungsi untuk mengambil statistik pengunjung
async function fetchVisitorStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/visitor-stats`); // Ganti dengan endpoint API statistik Anda
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || 'Unknown error'}`);
    }
    const stats = await response.json();
    onlineUsers.value = stats.onlineUsers || 0;
    todayVisitors.value = stats.todayVisitors || 0;
    totalVisitors.value = stats.totalVisitors || 0;
  } catch (error) {
    console.error('Gagal mengambil statistik pengunjung:', error);
    onlineUsers.value = 'N/A';
    todayVisitors.value = 'N/A';
    totalVisitors.value = 'N/A';
  }
}

// Map Google: Pastikan URL embed yang benar. URL yang Anda berikan tidak valid.
// URL yang saya berikan adalah placeholder untuk Tegal. Anda perlu mendapatkan URL embed dari Google Maps.
// Pastikan src iframe adalah URL embed Google Maps yang valid, contoh:
// https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d...
// Saya sudah menggantinya dengan contoh URL embed yang lebih realistis.

onMounted(() => {
  fetchContactPageData(); // Ambil data kontak saat komponen dimuat
  fetchVisitorStats(); // Ambil statistik pengunjung saat komponen dimuat

  // Atur interval untuk memperbarui statistik setiap 30 detik (30000 ms)
  intervalId = setInterval(fetchVisitorStats, 30000);
});

// Bersihkan interval saat komponen dilepas untuk mencegah kebocoran memori
onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>


<style>
.hidden-on-specific-pages {
  display: none !important; /* !important untuk memastikan penimpaan gaya lain */
}
</style>