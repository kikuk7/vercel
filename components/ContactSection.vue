<template>
  <section class="contact-section">
    <div class="container contact-grid">
      <div class="kontak-info">
        <h3>Kontak</h3>
        <p class="contact-item"><img src="/static/assets/icon/email 1.png" alt="Email Icon" class="contact-icon"> sumberalam423@gmail.com</p>
        <p class="contact-item"><img src="/static/assets/icon/telepon.png" alt="Phone Icon" class="contact-icon"> +6287801319313</p>
        <p class="contact-item"><img src="/static/assets/icon/WA.png" alt="Fax Icon" class="contact-icon"> +6287801319313</p>
      </div>
      <div class="lokasi-info">
        <h3>Lokasi</h3>
        <p>Jl. Projosumarto II, Bengledukuh, Bengle, Kec. Talang, Kabupaten Tegal, Jawa Tengah 52193</p>
        <!-- Tombol yang akan disembunyikan secara kondisional -->
        <a :href="`https://wa.me/+6287801319313`" 
           :class="['btn-primary', 'contact-section-btn', { 'hidden-on-specific-pages': shouldHideButton }]">
          <img src="/static/assets/icon/WA.png" alt="WhatsApp Icon" class="btn-icon-img"> hubungi kami
        </a>
      </div>
      <div class="pengunjung-info">
        <h3>Pengunjung</h3>
        <!-- ID ini kemungkinan dari mixin visitorStats, perlu dihubungkan dengan data Vue -->
        <p class="visitor-item"><img src="/static/assets/icon/person.png" alt="Online User Icon" class="visitor-icon"> Pengguna Online: <span id="online-user">Memuat...</span></p>
        <p class="visitor-item"><img src="/static/assets/icon/person.png" alt="Visitor Today Icon" class="visitor-icon"> Pengunjung Hari Ini: <span id="today-visitor">Memuat...</span></p>
        <p class="visitor-item"><img src="/static/assets/icon/person.png" alt="Total Visitor Icon" class="visitor-icon"> Total Pengunjung: <span id="total-visitor">Memuat...</span></p>
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
import { computed } from 'vue'; // Impor computed
import { useRoute } from '#app'; 

const route = useRoute(); 

// Gunakan computed() untuk reaktivitas yang lebih eksplisit
const shouldHideButton = computed(() => {
  const currentPath = route.path; 
  const pagesToHideButton = [
    '/produk', 
    '/kontak'
  ];
  return pagesToHideButton.includes(currentPath);
});
</script>

<style>
</style>