<template>
  <div class="py-3">
    <h1 class="mb-4">Manajemen Galeri Website</h1>

    <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

    <div class="card shadow-sm mt-4">
      <div class="card-header bg-dark text-white">
        Pengaturan Galeri
      </div>
      <div class="card-body">
        <form @submit.prevent="saveGallery">
          <div class="mb-3">
            <label for="gallery_intro_body" class="form-label">Paragraf Pembuka Galeri</label>
            <textarea class="form-control" id="gallery_intro_body" v-model="galleryPage.gallery_intro_body" rows="5"></textarea>
            <div v-if="validationErrors.gallery_intro_body" class="text-danger mt-1">{{ validationErrors.gallery_intro_body[0] }}</div>
          </div>
          
          <!-- Bagian untuk Upload dan Kelola Gambar Galeri -->
          <div class="mb-3">
            <label class="form-label">Manajemen Gambar Galeri</label>
            <input type="file" ref="galleryImageInput" @change="handleGalleryImageSelect" class="form-control mb-2" accept="image/*">
            <button type="button" @click="uploadGalleryImage" class="btn btn-info btn-sm">Unggah Gambar Baru</button>
            <span v-if="uploadingImage" class="ms-2 text-muted">Mengunggah...</span>
            <p v-if="uploadError" class="text-danger mt-1">{{ uploadError }}</p>
            <p v-if="uploadSuccessMessage" class="text-success mt-1">{{ uploadSuccessMessage }}</p>

            <div class="mt-3 image-thumbnail-grid">
              <div v-for="(imgUrl, idx) in galleryPage.images" :key="idx" class="image-thumbnail-item card">
                <img :src="imgUrl" class="img-thumbnail" :alt="`Galeri ${idx + 1}`">
                <div class="image-thumbnail-overlay">
                  <!-- Tombol Hapus -->
                  <button type="button" @click="removeGalleryImage(idx)" class="btn btn-danger btn-sm me-1">Hapus</button>
                  <!-- Tombol Pindah Atas -->
                  <button type="button" @click="moveImageUp(idx)" :disabled="idx === 0" class="btn btn-secondary btn-sm me-1">▲</button>
                  <!-- Tombol Pindah Bawah -->
                  <button type="button" @click="moveImageDown(idx)" :disabled="idx === galleryPage.images.length - 1" class="btn btn-secondary btn-sm">▼</button>
                </div>
                <small class="text-muted text-truncate w-100 mt-1">{{ imgUrl }}</small>
              </div>
              <p v-if="galleryPage.images.length === 0" class="text-muted mt-2">Belum ada gambar di galeri ini.</p>
            </div>
          </div>

          <button type="submit" class="btn btn-success mt-3">Simpan Perubahan Galeri</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRuntimeConfig } from '#app';

definePageMeta({
  layout: 'admin',
  middleware: ['auth-admin'],
  title: 'Manajemen Galeri'
});

const galleryPage = ref({}); // Akan menyimpan data halaman 'galeri' dari DB
const successMessage = ref(null);
const errorMessage = ref(null);
const validationErrors = ref({});

// State untuk upload gambar
const galleryImageInput = ref(null); 
const uploadingImage = ref(false);
const uploadError = ref(null);
const uploadSuccessMessage = ref(null);

const config = useRuntimeConfig(); 
const API_BASE_URL = config.public.apiBase; 

// Fungsi untuk memuat data halaman 'galeri'
async function fetchGalleryPageData() {
  try {
    const response = await fetch(`${API_BASE_URL}/pages/galeri`); 
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal memuat data galeri.');
    }
    const data = await response.json();
    galleryPage.value = data; 
    
    // Pastikan images di-parse dari string JSONB jika perlu
    if (typeof galleryPage.value.images === 'string' && galleryPage.value.images.startsWith('[')) {
      try {
        galleryPage.value.images = JSON.parse(galleryPage.value.images);
      } catch (e) {
        console.error("Gagal mengurai JSON gambar galeri:", e);
        galleryPage.value.images = []; 
      }
    } else if (!Array.isArray(galleryPage.value.images)) {
      galleryPage.value.images = []; 
    }

  } catch (e) {
    errorMessage.value = e.message;
    console.error('Error fetching gallery page:', e);
  }
}

// Fungsi untuk menyimpan perubahan galeri ke database
async function saveGallery() {
  successMessage.value = null;
  errorMessage.value = null;
  validationErrors.value = {};

  try {
    const pageDataToSend = { ...galleryPage.value };
    // Pastikan images dikonversi kembali ke string JSON sebelum dikirim ke backend
    if (Array.isArray(pageDataToSend.images)) {
        pageDataToSend.images = JSON.stringify(pageDataToSend.images);
    } else {
        pageDataToSend.images = '[]'; 
    }

    const response = await fetch(`${API_BASE_URL}/pages/${pageDataToSend.id}`, { // Menggunakan ID halaman 'galeri'
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pageDataToSend) 
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 422 && errorData.errors) { 
        validationErrors.value = errorData.errors;
        errorMessage.value = errorData.message || "Ada kesalahan validasi. Silakan periksa formulir Anda.";
      } else {
        throw new Error(errorData.message || 'Gagal menyimpan perubahan galeri.');
      }
    } else {
      successMessage.value = 'Galeri berhasil diperbarui!';
      await fetchGalleryPageData(); // Muat ulang data galeri setelah sukses menyimpan
      setTimeout(() => successMessage.value = null, 3000); 
    }
  } catch (e) {
    errorMessage.value = e.message;
    console.error('Error updating gallery:', e);
  }
}

// === Metode Upload Gambar ===
function handleGalleryImageSelect(event) {
  const file = event.target.files[0];
  if (file) {
    uploadError.value = null;
    uploadSuccessMessage.value = null;
  }
}

async function uploadGalleryImage() {
  const file = galleryImageInput.value.files[0];
  if (!file) {
    uploadError.value = "Pilih gambar untuk diunggah.";
    return;
  }

  uploadingImage.value = true;
  uploadError.value = null;
  uploadSuccessMessage.value = null;

  const formData = new FormData();
  formData.append('image', file); 

  try {
    const response = await fetch(`${API_BASE_URL}/upload-image`, { // Endpoint upload baru
      method: 'POST',
      body: formData 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal mengunggah gambar.');
    }

    const result = await response.json();
    const imageUrl = result.publicUrl; 

    if (imageUrl) {
      if (!Array.isArray(galleryPage.value.images)) {
        galleryPage.value.images = [];
      }
      galleryPage.value.images.push(imageUrl);
      uploadSuccessMessage.value = 'Gambar berhasil diunggah! Klik Simpan Perubahan untuk menyimpan ke database.';
      galleryImageInput.value.value = ''; // Reset input file
    } else {
      throw new Error('URL gambar tidak diterima dari server.');
    }

  } catch (e) {
    uploadError.value = e.message;
    console.error('Upload image error:', e);
  } finally {
    uploadingImage.value = false;
  }
}

function removeGalleryImage(index) {
  if (confirm('Apakah Anda yakin ingin menghapus gambar ini dari galeri?')) {
    galleryPage.value.images.splice(index, 1);
    successMessage.value = 'Gambar dihapus dari daftar. Klik Simpan Perubahan untuk menyimpan ke database.';
    setTimeout(() => successMessage.value = null, 3000);
  }
}

function moveImageUp(index) {
  if (index > 0) {
    const images = [...galleryPage.value.images];
    const [removed] = images.splice(index, 1);
    images.splice(index - 1, 0, removed);
    galleryPage.value.images = images;
    successMessage.value = 'Urutan gambar diubah. Klik Simpan Perubahan untuk menyimpan.';
    setTimeout(() => successMessage.value = null, 2000);
  }
}

function moveImageDown(index) {
  if (index < galleryPage.value.images.length - 1) {
    const images = [...galleryPage.value.images];
    const [removed] = images.splice(index, 1);
    images.splice(index + 1, 0, removed);
    galleryPage.value.images = images;
    successMessage.value = 'Urutan gambar diubah. Klik Simpan Perubahan untuk menyimpan.';
    setTimeout(() => successMessage.value = null, 2000);
  }
}


onMounted(fetchGalleryPageData); // Muat data galeri saat komponen dimuat
</script>

<style scoped> /* Menggunakan scoped agar gaya ini hanya berlaku untuk komponen ini */
.galeri {
  padding: 20px;
  text-align: center;
}

.galeri h2 {
  margin-bottom: 10px;
  font-size: 2em;
  color: #333;
}

.galeri p {
  margin-bottom: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  color: #555;
  line-height: 1.6;
}

/* Gaya untuk grid gambar galeri */
.gallery-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsif, min 280px, memenuhinya */
  gap: 15px; /* Jarak antar gambar */
  max-width: 1200px; /* Batasi lebar maksimum galeri */
  margin: 0 auto 50px auto; /* Pusatkan galeri dan beri margin bawah */
  padding: 0 15px; /* Padding samping untuk layar kecil */
}

.gallery-item {
  overflow: hidden;
  border-radius: 10px; /* Sudut membulat */
  box-shadow: 0 5px 15px rgba(0,0,0,0.1); /* Bayangan yang lebih menonjol */
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* Untuk efek hover overlay */
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