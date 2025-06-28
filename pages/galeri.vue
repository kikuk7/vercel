<template>
  <main>
    <!-- Wrapper baru untuk mengontrol lebar dan pemusatan seluruh bagian galeri -->
    <section class="galeri-section-wrapper"> 
      <h2 class="galeri-title">Galeri Kami</h2>
      <p class="galeri-description">
        <!-- Menggunakan gallery_intro_body dari database -->
        {{ page.gallery_intro_body }}
      </p>
      
      <!-- Grid untuk gambar galeri -->
      <div class="gallery-grid-container"> 
        <div v-for="(imageUrl, index) in page.images" :key="index" class="gallery-item">
          <img :src="imageUrl" :alt="`Galeri ${index + 1}`">
        </div>
      </div>
      <!-- Pesan jika tidak ada gambar -->
      <div v-if="!page.images || page.images.length === 0" class="no-images-message">
        Tidak ada gambar untuk ditampilkan.
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats'; // Import the mixin
import { useRuntimeConfig } from '#app'; // Impor useRuntimeConfig

export default {
  name: 'GaleriPage',
  mixins: [visitorStats], // Use the mixin for visitor stats
  data() {
    return {
      // Inisialisasi properti 'page' dengan nilai default/placeholder
      page: {
        gallery_intro_body: 'Memuat galeri...',
        images: [] // Inisialisasi sebagai array kosong
      }
    };
  },
  methods: {
    async fetchPageData(slug, apiBaseUrl) { // Terima apiBaseUrl sebagai argumen
      try {
        const response = await fetch(`${apiBaseUrl}/pages/${slug}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();
        
        this.page = data; 
        
        // PENTING: Periksa dan parse 'images' jika datang sebagai string JSON (dari DB JSONB)
        if (typeof this.page.images === 'string' && this.page.images.startsWith('[')) {
          try {
            this.page.images = JSON.parse(this.page.images);
          } catch (parseError) {
            console.error('Gagal mengurai JSON gambar dari DB:', parseError);
            this.page.images = []; 
          }
        } else if (!Array.isArray(this.page.images)) {
          this.page.images = []; 
        }
      } catch (error) {
        console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
        // Fallback data jika gagal mengambil dari API
        this.page.gallery_intro_body = 'Gagal memuat galeri.';
        this.page.images = []; 
      }
    }
  },
  async mounted() { // Ubah mounted menjadi async
    const config = useRuntimeConfig(); // Ambil runtime config
    const API_BASE_URL = config.public.apiBase; // Akses properti 'public.apiBase'

    // Panggil API untuk mendapatkan data halaman 'galeri'
    await this.fetchPageData('galeri', API_BASE_URL);
    this.updateStats(); 
    this.intervalId = setInterval(this.updateStats, 30000); 
  },
  beforeDestroy() {
    clearInterval(this.intervalId); 
  }
}
</script>

<style scoped> /* Menggunakan scoped agar gaya ini hanya berlaku untuk komponen ini */
/* Gaya Dasar untuk Bagian Galeri Keseluruhan */
.galeri-section-wrapper {
  padding: 20px 15px; /* Padding samping untuk responsivitas */
  text-align: center; /* Memusatkan teks di dalamnya */
  max-width: 1200px; /* Batas lebar maksimum untuk seluruh bagian galeri */
  margin-left: auto; /* Memusatkan bagian galeri secara horizontal */
  margin-right: auto;
}

.galeri-title {
  margin-bottom: 10px;
  font-size: 2.5em; /* Ukuran judul yang sedikit lebih besar */
  color: #333;
  margin-top: 100px;
}

.galeri-description {
  margin-bottom: 30px;
  max-width: 800px; /* Batasi lebar deskripsi agar tidak terlalu panjang */
  margin-left: auto;
  margin-right: auto;
  color: #555;
  line-height: 1.6;
}

/* Gaya untuk grid gambar galeri */
.gallery-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsif: min 280px, memenuhi ruang */
  gap: 15px; /* Jarak antar gambar */
  /* max-width dan margin:auto tidak lagi diperlukan di sini karena sudah ditangani oleh .galeri-section-wrapper */
  margin-bottom: 50px; /* Margin bawah untuk memisahkan dari konten lain */
}

.gallery-item {
  overflow: hidden;
  border-radius: 10px; /* Sudut membulat */
  box-shadow: 0 5px 15px rgba(0,0,0,0.1); /* Bayangan yang lebih menonjol */
  background-color: #fff;
  display: flex;
  justify-content: center; /* Memusatkan gambar secara horizontal di dalam item */
  align-items: center; /* Memusatkan gambar secara vertikal di dalam item */
  position: relative; 
  height: 200px; /* Tinggi item galeri yang seragam */
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Penting agar gambar mengisi area item dan terpotong jika perlu */
  display: block; 
  transition: transform 0.3s ease; /* Efek hover zoom */
}

.gallery-item:hover img {
  transform: scale(1.08); /* Efek zoom saat hover */
}

/* Overlay saat hover (opsional, untuk tombol/teks) */
.gallery-item:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.3); /* Overlay gelap saat hover */
  opacity: 1;
  transition: opacity 0.3s ease;
}

/* Tambahan untuk tampilan saat tidak ada gambar */
.no-images-message {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

/* Media Query untuk mengatur grid pada layar yang lebih besar (misal 3 kolom) */
@media (min-width: 992px) {
  .gallery-grid-container {
    grid-template-columns: repeat(3, 1fr); /* 3 kolom di desktop */
  }
}

/* Media Query untuk 2 kolom di tablet */
@media (min-width: 600px) and (max-width: 991px) {
  .gallery-grid-container {
    grid-template-columns: repeat(2, 1fr); /* 2 kolom di tablet */
  }
}

/* Media Query untuk 1 kolom di mobile */
@media (max-width: 599px) {
  .gallery-grid-container {
    grid-template-columns: 1fr; /* 1 kolom di mobile */
  }
  .gallery-item {
    height: 250px; /* Tinggi item galeri di mobile */
  }
}
</style>
