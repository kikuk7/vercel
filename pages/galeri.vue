<template>
  <main>
    <section class="galeri">
      <h2>Galeri Kami</h2>
      <p>
        {{ page.gallery_intro_body }}
      </p>
      
      <div class="parent">
        <div class="div7"><img src="/assets/Foto Galeri/DSCF5415.JPG" alt="Galeri 1"></div>
        <div class="div8"><img src="/assets/Foto Galeri/5.jpg" alt="Galeri 2"></div>
        <div class="div9"><img src="/assets/Foto Galeri/DSCF5362.JPG" alt="Galeri 3"></div>
        <div class="div10"><img src="/assets/DSCF5374.JPG" alt="Galeri 4"></div>
        <div class="div11"><img src="/assets/Foto Galeri/DSCF5418.JPG" alt="Galeri 5"></div>
        <div class="div12"><img src="/assets/DSCF5359.JPG" alt="Galeri 6"></div>
        <div class="div13"><img src="/assets/DSCF5365.JPG" alt="Galeri 7"></div>
        <div class="div14"><img src="/assets/DSCF5361.JPG" alt="Galeri 8"></div>
        <div class="div15"><img src="/assets/Foto Galeri/DSCF5421.JPG" alt="Galeri 9"></div>
        <div class="div16"><img src="/assets/DSCF5360.JPG" alt="Galeri 10"></div>
        <div class="div17"><img src="/assets/DSCF5385.JPG" alt="Galeri 11"></div>
        <div class="div18"><img src="/assets/tentang.JPG" alt="Galeri 12"></div>
      
      </div>
      
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats'; // Import the mixin

const API_BASE_URL = 'http://localhost:3001/api'; 

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
    async fetchPageData(slug) {
      try {
        const response = await fetch(`${API_BASE_URL}/pages/${slug}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();
        
        // Pastikan page.images diisi dengan array dari database
        // Jika kolom images di DB adalah JSONB, ia akan langsung menjadi array di sini
        this.page = data; 
        
        // Opsional: Jika data.images datang sebagai string JSON, Anda perlu mem-parse-nya:
        // if (typeof this.page.images === 'string') {
        //   try {
        //     this.page.images = JSON.parse(this.page.images);
        //   } catch (parseError) {
        //     console.error('Failed to parse images JSON from DB:', parseError);
        //     this.page.images = []; // Set ke array kosong jika parsing gagal
        //   }
        // }
      } catch (error) {
        console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
        // Fallback data
        this.page.gallery_intro_body = 'Gagal memuat galeri.';
        this.page.images = []; // Pastikan tetap array kosong agar tidak error di template
      }
    }
  },
  mounted() {
    // Panggil API untuk mendapatkan data halaman 'galeri'
    this.fetchPageData('galeri');
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

/* Pastikan styling untuk div.parent dan div.divX masih relevan atau sesuaikan */
/* Misalnya, jika div.divX tidak lagi perlu index spesifik, Anda bisa ubah */
/* .parent > div { width: ..., height: ..., etc. } */
</style>
