<template>
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-image-wrapper">
          <img :src="page.hero_image_url" :alt="page.title" class="hero-image-fallback" />
        </div>
      </div>
    </section>

    <section class="container">
      <div class="content card">
        <h2 class="section-title">{{ page.title }}</h2>
        <p>
          {{ page.main_intro_body }}
        </p>
      </div>

      <div class="service-grid">
        <div class="service-card">
          <img :src="page.service_1_image_url" :alt="page.service_1_title" />
          <h3>{{ page.service_1_title }}</h3>
          <p>{{ page.service_1_body }}</p>
        </div>

        <div class="service-card">
          <img :src="page.service_2_image_url" :alt="page.service_2_title" />
          <h3>{{ page.service_2_title }}</h3>
          <p>{{ page.service_2_body }}</p>
        </div>

        <div class="service-card">
          <img :src="page.service_3_image_url" :alt="page.service_3_title" />
          <h3>{{ page.service_3_title }}</h3>
          <p>{{ page.service_3_body }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import visitorStats from '~/mixins/visitorStats'; 
import { useRuntimeConfig } from '#app'; 

export default {
  name: 'LayananPage',
  mixins: [visitorStats], 
  data() {
    return {
      // Inisialisasi properti 'page' dengan nilai default yang sesuai
      // Penting: Pastikan semua properti yang akan digunakan di template ada di sini,
      // terutama yang diambil dari database seperti URL gambar.
      // Memberikan string kosong atau nilai default yang masuk akal.
      page: {
        title: 'Memuat Layanan...',
        hero_image_url: '/placeholder-hero.jpg', // Berikan URL placeholder jika tidak ada gambar
        main_intro_body: 'Memuat konten layanan...',
        
        service_1_title: 'Memuat Layanan 1...',
        service_1_body: 'Memuat deskripsi Layanan 1...',
        service_1_image_url: '/placeholder-service1.jpg', // URL placeholder
        
        service_2_title: 'Memuat Layanan 2...',
        service_2_body: 'Memuat deskripsi Layanan 2...',
        service_2_image_url: '/placeholder-service2.jpg', // URL placeholder
        
        service_3_title: 'Memuat Layanan 3...',
        service_3_body: 'Memuat deskripsi Layanan 3...',
        service_3_image_url: '/placeholder-service3.jpg' // URL placeholder
      }
    };
  },
  async mounted() { 
    const config = useRuntimeConfig(); 
    const API_BASE_URL = config.public.apiBase; 

    await this.fetchPageData('layanan', API_BASE_URL); 
    this.updateStats(); 
    this.intervalId = setInterval(this.updateStats, 30000); 
  },
  beforeUnmount() { // Ganti beforeDestroy menjadi beforeUnmount untuk Vue 3
    clearInterval(this.intervalId); 
  },
  methods: {
    async fetchPageData(slug, apiBaseUrl) { 
      try {
        const response = await fetch(`${apiBaseUrl}/pages/${slug}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}: ${errorData.message || 'Unknown error'}`);
        }
        const data = await response.json();
        
        // Memastikan semua properti yang diharapkan ada, bahkan jika API mengembalikannya sebagai null
        // Atau jika API tidak mengembalikan properti tersebut sama sekali (akan diisi dengan nilai default)
        this.page = {
          title: data.title || 'Layanan Kami',
          hero_image_url: data.hero_image_url || '/placeholder-hero.jpg',
          main_intro_body: data.main_intro_body || 'Terjadi kesalahan saat memuat konten layanan.',

          service_1_title: data.service_1_title || 'Judul Layanan 1 Belum Diisi',
          service_1_body: data.service_1_body || 'Deskripsi Layanan 1 Belum Diisi.',
          service_1_image_url: data.service_1_image_url || '/placeholder-service1.jpg',

          service_2_title: data.service_2_title || 'Judul Layanan 2 Belum Diisi',
          service_2_body: data.service_2_body || 'Deskripsi Layanan 2 Belum Diisi.',
          service_2_image_url: data.service_2_image_url || '/placeholder-service2.jpg',

          service_3_title: data.service_3_title || 'Judul Layanan 3 Belum Diisi',
          service_3_body: data.service_3_body || 'Deskripsi Layanan 3 Belum Diisi.',
          service_3_image_url: data.service_3_image_url || '/placeholder-service3.jpg',

          // Tambahkan properti lain yang mungkin ada dari API
          ...data 
        };

      } catch (error) {
        console.error(`Gagal mengambil data halaman '${slug}' dari API:`, error);
        // Fallback data jika terjadi error
        this.page.title = 'Layanan Tidak Tersedia';
        this.page.main_intro_body = 'Terjadi kesalahan saat memuat layanan. Silakan coba lagi nanti.';
        
        // Perbaikan sintaks: menggunakan '=' untuk assignment
        this.page.service_1_title = 'Error Memuat';
        this.page.service_1_body = 'Data tidak dapat dimuat.';
        this.page.service_1_image_url = '/error-placeholder.jpg'; // Gambar error

        this.page.service_2_title = 'Error Memuat';
        this.page.service_2_body = 'Data tidak dapat dimuat.';
        this.page.service_2_image_url = '/error-placeholder.jpg';

        this.page.service_3_title = 'Error Memuat';
        this.page.service_3_body = 'Data tidak dapat dimuat.';
        this.page.service_3_image_url = '/error-placeholder.jpg';
      }
    }
  }
}
</script>
<style scoped>
/* Tambahan untuk hero-image-fallback agar gambar hero tampil baik */
.hero-image-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Gaya untuk service-card images agar konsisten */
.service-card img {
  width: 100%;
  height: 150px; 
  object-fit: cover; 
  border-radius: 8px; 
  margin-bottom: 15px; 
}

/* Gaya halaman Layanan */
.hero {
  width: 100%;
  height: 300px; /* Tinggi hero section */
  overflow: hidden;
  position: relative;
  background-color: #f0f0f0; /* Warna fallback jika gambar tidak ada */
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image-wrapper {
  width: 100%;
  height: 100%;
}

.hero-image-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Pastikan gambar mengisi ruang */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.content.card {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.section-title {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 2.2em;
  font-weight: 700;
}

.content.card p {
  line-height: 1.8;
  color: #555;
  font-size: 1.1em;
  text-align: justify;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.service-card {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

.service-card img {
  width: 100%;
  height: 180px; /* Tinggi gambar kartu layanan */
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}

.service-card p {
  font-size: 0.95em;
  color: #666;
  line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero {
    height: 200px;
  }

  .section-title {
    font-size: 1.8em;
  }

  .content.card {
    padding: 20px;
  }

  .service-grid {
    grid-template-columns: 1fr; /* Stack cards on smaller screens */
  }
}
</style>