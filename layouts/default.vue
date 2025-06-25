<template>
  <!-- Menambahkan kelas 'app-wrapper' untuk kontrol layout global -->
  <div class="app-wrapper">
    <Header />
    <MobileNav />
    <!-- Konten halaman akan masuk di sini -->
    <slot /> 
    <ContactSection /> 
    <Footer />
  </div>
</template>

<script>
import Header from '~/components/Header.vue'
import MobileNav from '~/components/MobileNav.vue'
import ContactSection from '~/components/ContactSection.vue'
import Footer from '~/components/Footer.vue'

export default {
  components: {
    Header,
    MobileNav,
    ContactSection,
    Footer
  },
  // Perbaikan untuk Vue warn: Property "currentYear" accessed during render
  // Jika ini masih muncul dari komponen Footer, tambahkan di sini atau di Footer.vue
  data() {
    return {
      currentYear: new Date().getFullYear() // Tambahkan ini jika Footer membutuhkan currentYear
    };
  }
}
</script>

<style>
/* Gaya global untuk layout di sini */

/* Gaya untuk body dan html untuk memastikan lebar dan tinggi penuh */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif; /* Pastikan font Inter digunakan */
}

/* Gaya untuk wrapper aplikasi utama */
.app-wrapper {
  min-height: 100vh; /* Pastikan wrapper mengambil tinggi penuh viewport */
  display: flex;
  flex-direction: column;
  width: 100%; /* Pastikan wrapper mengambil lebar penuh */
  overflow-x: hidden; /* Mencegah horizontal scroll yang tidak diinginkan */
}

/* Gaya dasar untuk .container yang digunakan di banyak tempat */
.container {
    width: 100%; /* Selalu 100% dari parent-nya */
    max-width: 1200px; /* Batas lebar maksimum untuk desktop */
    margin-left: auto;
    margin-right: auto;
    padding-left: 15px; /* Padding samping agar konten tidak menempel ke tepi */
    padding-right: 15px;
    box-sizing: border-box; /* Pastikan padding dan border disertakan dalam lebar/tinggi */
}

/* Media queries untuk responsivitas .container (sesuaikan dengan kebutuhan desain Anda) */
@media (min-width: 576px) { /* Small devices (sm) */
    .container { max-width: 540px; }
}
@media (min-width: 768px) { /* Medium devices (md) */
    .container { max-width: 720px; }
}
@media (min-width: 992px) { /* Large devices (lg) */
    .container { max-width: 960px; }
}
@media (min-width: 1200px) { /* Extra large devices (xl) */
    .container { max-width: 1140px; }
}
/* Anda bisa menambahkan breakpoint lebih besar seperti @media (min-width: 1400px) { .container { max-width: 1320px; } } */


/* Pastikan elemen seperti header, contact section, footer mengambil lebar penuh */
/* Ini adalah contoh; Anda mungkin memiliki kelas CSS spesifik untuk komponen ini */
header, footer, .contact-section { /* Ganti .contact-section dengan kelas spesifik ContactSection */
  width: 100%;
  /* tambahkan padding/margin internal sesuai desain */
}

/* Optional: Untuk elemen img di galeri atau produk yang mungkin melebihi batas */
img {
    max-width: 100%;
    height: auto;
    display: block; /* Menghilangkan spasi ekstra di bawah gambar */
}

/* Anda juga bisa menambahkan atau memindahkan gaya umum lain dari file CSS Anda di sini */
/* Misalnya, gaya untuk button, font, warna dasar, dll. */
</style>
