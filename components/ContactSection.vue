<template>
  <section class="contact-section">
    <div class="container contact-grid">
      <div class="kontak-info">
        <h3>Kontak</h3>
        <p class="contact-item">
          <img src="/static/assets/icon/email 1.png" alt="Email" class="contact-icon">
          {{ page.contact_email_address }}
        </p>
        <p class="contact-item">
          <img src="/static/assets/icon/telepon.png" alt="Telepon" class="contact-icon">
          {{ page.contact_phone }}
        </p>
        <p class="contact-item">
          <img src="/static/assets/icon/WA.png" alt="WhatsApp" class="contact-icon">
          {{ page.contact_whatsapp_number }}
        </p>
      </div>

      <div class="lokasi-info">
        <h3>{{ page.contact_location_title }}</h3>
        <p>{{ page.contact_location_body }}</p>
        <a :href="`https://wa.me/${page.contact_whatsapp_number}`"
           :class="['btn-primary', 'contact-section-btn', { 'hidden-on-specific-pages': shouldHideButton }]">
          <img src="/static/assets/icon/WA.png" alt="WA Icon" class="btn-icon-img"> hubungi kami
        </a>
      </div>

      <div class="pengunjung-info">
        <h3>Pengunjung</h3>
        <p class="visitor-item">
          <img src="/static/assets/icon/person.png" alt="Online" class="visitor-icon">
          Pengguna Online: <span>{{ onlineUsers }}</span>
        </p>
        <p class="visitor-item">
          <img src="/static/assets/icon/person.png" alt="Today" class="visitor-icon">
          Pengunjung Hari Ini: <span>{{ todayVisitors }}</span>
        </p>
        <p class="visitor-item">
          <img src="/static/assets/icon/person.png" alt="Total" class="visitor-icon">
          Total Pengunjung: <span>{{ totalVisitors }}</span>
        </p>
      </div>
    </div>

    <div class="map">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d290359.28908634855!2d108.67633979109493!3d-6.7560054978228266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6fb8fc4e0a830f%3A0x18d216b7449db15c!2sSumber%20Alam%20Grup!5e0!3m2!1sid!2sid!4v1751378501547!5m2!1sid!2sid"
        width="100%" height="250" style="border:0; border-radius: 12px;" allowfullscreen="" loading="lazy">
      </iframe>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRuntimeConfig } from '#app';
// Pastikan path ini benar (berdasarkan lokasi file Anda, ~/components/useVisitorStats.js)
import { useVisitorStats } from '~/components/useVisitorStats'; 

// Panggil composable useVisitorStats sekali di sini
const { totalVisitors, todayVisitors, onlineUsers } = useVisitorStats();

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

const shouldHideButton = computed(() => {
  const currentPath = route.path;
  return ['/produk', '/kontak'].includes(currentPath);
});

async function fetchContactPageData() {
  try {
    // Pastikan URL API sudah benar (gunakan /api/pages/kontak, bukan /api/api/pages/kontak)
    const response = await fetch(`${API_BASE_URL}/api/pages/kontak`);
    if (!response.ok) {
        const errorText = await response.text(); // Ambil teks error jika ada
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    page.value = await response.json();
  } catch (error) {
    console.error('Gagal mengambil data halaman kontak:', error);
    page.value.contact_email_address = 'Error Memuat';
    page.value.contact_phone = 'Error Memuat';
    page.value.contact_whatsapp_number = '';
    page.value.contact_location_title = 'Error Memuat';
    page.value.contact_location_body = 'Error Memuat';
  }
}

onMounted(fetchContactPageData);
// HAPUS SEMUA PANGGILAN MANUAL this.updateStats() ATAU setInterval DI SINI!
// useVisitorStats() sudah menanganinya secara otomatis di dalamnya.
</script>

<style scoped>
.hidden-on-specific-pages {
  display: none !important;
}
</style>