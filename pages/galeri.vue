<template>
  <main>
    <section class="galeri-section-wrapper"> 
      <h2 class="galeri-title">{{ page.gallery_main_title || 'Galeri Kami' }}</h2> <p class="galeri-description">
        {{ page.gallery_intro_body || 'Memuat deskripsi galeri...' }}
      </p>
      
      <div class="gallery-grid-container"> 
        <div v-for="(imageUrl, index) in page.images" :key="index" class="gallery-item">
          <img :src="imageUrl" :alt="`Galeri ${index + 1}`">
        </div>
      </div>
      <div v-if="!page.images || page.images.length === 0" class="no-images-message">
        Tidak ada gambar untuk ditampilkan.
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

// Gunakan ref untuk membuat objek 'page' reaktif
const page = ref({
  gallery_main_title: 'Galeri Kami', // Tambahkan properti untuk judul utama galeri jika ada di DB
  gallery_intro_body: 'Memuat galeri...',
  images: [] // Inisialisasi sebagai array kosong
});

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
    
    // PENTING: Periksa dan parse 'images' jika datang sebagai string JSON (dari DB JSONB)
    // Backend Anda mengembalikan 'images' sebagai array langsung.
    // Tetapi jika ada kemungkinan dikirim sebagai string JSON, tetap amankan dengan JSON.parse.
    if (typeof page.value.images === 'string' && page.value.images.startsWith('[')) {
      try {
        page.value.images = JSON.parse(page.value.images);
      } catch (parseError) {
        console.error('Gagal mengurai JSON gambar dari DB:', parseError);
        page.value.images = []; 
      }
    } else if (!Array.isArray(page.value.images)) {
      // Jika bukan array dan bukan string JSON, default ke array kosong
      page.value.images = []; 
    }
  } catch (error) {
    console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
    // Fallback data jika gagal mengambil dari API
    page.value.gallery_main_title = 'Galeri Tidak Tersedia';
    page.value.gallery_intro_body = 'Gagal memuat galeri.';
    page.value.images = []; 
  }
}

// Panggil fetchPageData saat komponen dimuat
onMounted(async () => {
  await fetchPageData('galeri');
  // Penting: Jangan ada lagi panggilan manual this.updateStats() atau setInterval di sini.
  // useVisitorStats() sudah mengelola logikanya sendiri secara internal.
});
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
  margin-top: 100px; /* Margin atas untuk judul */
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
  /* Mengatur 3 kolom yang sama, setiap kolom memiliki lebar minimum 100px */
  /* Auto-fit akan menyesuaikan jumlah kolom, minmax(0, 1fr) untuk mengisi ruang */
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); 
  gap: 5px; /* Jarak antar gambar yang sangat rapat */
  max-width: 1200px; /* Batasi lebar maksimum galeri */
  margin: 0 auto 50px auto; /* Pusatkan galeri dan beri margin bawah */
  padding: 0; /* Hapus padding di container grid agar gambar menempel ke tepi */
  box-sizing: border-box;
}

.gallery-item {
  overflow: hidden;
  border-radius: 8px; /* Sudut membulat */
  /* box-shadow: 0 5px 15px rgba(0,0,0,0.1); Hapus bayangan agar terlihat lebih padat */
  background-color: #f0f0f0; /* Latar belakang tipis untuk item */
  display: flex;
  justify-content: center; /* Memusatkan gambar secara horizontal */
  align-items: center; /* Memusatkan gambar secara vertikal */
  position: relative; 
  height: 200px; /* Tinggi item galeri yang seragam */
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Penting agar gambar mengisi area item dan terpotong jika perlu */
  display: block; 
  transition: transform 0.3s ease; /* Efek hover zoom */
  border-radius: 8px; /* Sudut membulat pada gambar itu sendiri */
}

.gallery-item:hover img {
  transform: scale(1.05); /* Efek zoom saat hover */
}

/* Hapus overlay jika tidak diperlukan atau sesuaikan */
.gallery-item:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.1); /* Overlay sangat tipis saat hover */
  opacity: 1;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

/* Tambahan untuk tampilan saat tidak ada gambar */
.no-images-message {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  grid-column: 1 / -1; /* Pastikan pesan tidak ada gambar merentang penuh */
}

/* Media Query untuk mengatur grid pada layar yang lebih besar */
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
  .galeri-title {
    font-size: 2em; /* Sesuaikan ukuran judul di mobile */
    margin-top: 0px;
  }
}
</style>
