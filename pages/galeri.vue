<template>
  <main>
    <section class="galeri">
      <h2>Galeri Kami</h2>
      <p>
        <!-- Menggunakan gallery_intro_body dari database -->
        {{ page.gallery_intro_body }}
      </p>
      
      <!-- Mengulang array 'images' dari data API -->
      <div class="parent">
        <!-- Menggunakan v-for untuk setiap URL gambar di page.images -->
        <!-- :key="imageUrl" atau :key="index" lebih disarankan -->
        <div v-for="(imageUrl, index) in page.images" :key="index" :class="`div${7 + index}`">
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
        
        // Pasangkan data yang diterima langsung ke properti 'page'
        this.page = data; 
        
        // PENTING: Periksa dan parse 'images' jika datang sebagai string JSON (dari DB JSONB)
        // PostgreSQL sering mengembalikan JSONB sebagai objek/array, tapi kadang sebagai string.
        if (typeof this.page.images === 'string' && this.page.images.startsWith('[')) {
          try {
            this.page.images = JSON.parse(this.page.images);
          } catch (parseError) {
            console.error('Gagal mengurai JSON gambar dari DB:', parseError);
            this.page.images = []; // Set ke array kosong jika parsing gagal
          }
        } else if (!Array.isArray(this.page.images)) {
          // Jika bukan string atau array (misalnya NULL), pastikan menjadi array kosong
          this.page.images = []; 
        }
      } catch (error) {
        console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
        // Fallback data jika gagal mengambil dari API
        this.page.gallery_intro_body = 'Gagal memuat galeri.';
        this.page.images = []; // Pastikan tetap array kosong agar tidak error di template
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

<style>
/* Add galeri.css content here */
/* Tambahan untuk tampilan saat tidak ada gambar */
.no-images-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Gaya dasar untuk setiap item gambar di galeri */
.parent {
  display: grid; /* Atau flex, sesuaikan dengan layout galeri Anda */
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* Contoh grid responsif */
  gap: 10px; /* Jarak antar gambar */
}

.parent > div {
  overflow: hidden;
  border-radius: 8px; /* Sudut membulat */
  box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* Bayangan */
}

.parent img {
  width: 100%;
  height: 100%; /* Memastikan gambar mengisi div */
  object-fit: cover; /* Penting agar gambar tidak terdistorsi */
  display: block; /* Menghilangkan spasi ekstra di bawah gambar */
  transition: transform 0.3s ease; /* Efek hover zoom */
}

.parent img:hover {
  transform: scale(1.05); /* Efek zoom saat hover */
}
</style>
