<template>
  <div class="py-3">
    <h1 class="mb-4 admin-title">Manajemen Galeri Website</h1>

    <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

    <div class="card shadow-sm mt-4">
      <div class="card-header bg-dark text-white">
        Pengaturan Konten Galeri
      </div>
      <div class="card-body">
        <form @submit.prevent="saveGallery">
          <div class="mb-3">
            <label for="gallery_intro_body" class="form-label">Paragraf Pembuka Galeri</label>
            <textarea class="form-control" id="gallery_intro_body" v-model="galleryPage.gallery_intro_body" rows="5"></textarea>
            <div v-if="validationErrors.gallery_intro_body" class="text-danger mt-1">{{ validationErrors.gallery_intro_body[0] }}</div>
          </div>
          
          <h4 class="mb-3 mt-5">Manajemen Gambar Galeri</h4>
          <div class="mb-3 d-flex align-items-center">
            <input type="file" ref="galleryImageInput" @change="handleGalleryImageSelect" class="form-control me-2" accept="image/*">
            <button type="button" @click="uploadGalleryImage" class="btn btn-info upload-button">
              <i class="fas fa-upload me-2"></i> Unggah Gambar Baru
            </button>
          </div>
          <p v-if="uploadingImage" class="ms-2 text-primary">Mengunggah gambar, mohon tunggu...</p>
          <p v-if="uploadError" class="text-danger mt-1">{{ uploadError }}</p>
          <p v-if="uploadSuccessMessage" class="text-success mt-1">{{ uploadSuccessMessage }}</p>

          <!-- Grid untuk thumbnail gambar yang sudah diunggah -->
          <div class="mt-4 image-thumbnail-grid">
            <div v-for="(imgUrl, idx) in galleryPage.images" :key="idx" class="image-thumbnail-item">
              <img :src="imgUrl" class="img-thumbnail" :alt="`Galeri ${idx + 1}`">
              <div class="image-thumbnail-overlay">
                <!-- Tombol Hapus -->
                <button type="button" @click="removeGalleryImage(idx)" class="btn btn-danger btn-sm action-button">Hapus</button>
                <!-- Tombol Pindah Atas -->
                <button type="button" @click="moveImageUp(idx)" :disabled="idx === 0" class="btn btn-secondary btn-sm action-button">▲ Pindah Atas</button>
                <!-- Tombol Pindah Bawah -->
                <button type="button" @click="moveImageDown(idx)" :disabled="idx === galleryPage.images.length - 1" class="btn btn-secondary btn-sm action-button">▼ Pindah Bawah</button>
              </div>
              <small class="text-muted image-url-text">{{ truncateUrl(imgUrl) }}</small>
            </div>
            <p v-if="galleryPage.images.length === 0" class="text-muted mt-2 empty-gallery-message">Belum ada gambar di galeri ini.</p>
          </div>

          <button type="submit" class="btn btn-success mt-5 save-button">Simpan Perubahan Galeri</button>
          <NuxtLink to="/admin/dashboard" class="btn btn-secondary mt-5 ms-2 back-button">Kembali ke Dashboard</NuxtLink>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Impor useRouter
import { useRuntimeConfig } from '#app';

definePageMeta({
  layout: 'admin',
  middleware: ['auth-admin'],
  title: 'Manajemen Galeri'
});

const galleryPage = ref({}); 
const successMessage = ref(null);
const errorMessage = ref(null);
const validationErrors = ref({});

const galleryImageInput = ref(null); 
const uploadingImage = ref(false);
const uploadError = ref(null);
const uploadSuccessMessage = ref(null);

const config = useRuntimeConfig(); 
const API_BASE_URL = config.public.apiBase; 
const router = useRouter(); // Inisialisasi useRouter

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
      // Opsional: Muat ulang data galeri setelah sukses menyimpan (untuk konfirmasi visual)
      await fetchGalleryPageData();
      // Hapus query parameter jika ada (misalnya dari redirect setelah tambah)
      router.replace({ query: null }); // Bersihkan query params
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
    const response = await fetch(`${API_BASE_URL}/upload-image`, { 
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

// Helper function to truncate long URLs for display
function truncateUrl(url) {
  const maxLength = 30; // Max length to display
  if (!url) return '';
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

onMounted(fetchGalleryPageData); // Muat data galeri saat komponen dimuat
</script>

<style scoped> /* Menggunakan scoped agar gaya ini hanya berlaku untuk komponen ini */
/* Gaya Umum & Bootstrap-like */
.py-3 { padding-top: 1rem; padding-bottom: 1rem; }
.mb-3 { margin-bottom: 1rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 2rem; } /* Lebih banyak margin untuk judul bagian */
.ms-2 { margin-left: 0.5rem; }
.me-2 { margin-right: 0.5rem; }

.admin-title {
  color: #333;
  font-size: 2.2em;
  font-weight: bold;
}

.alert { padding: 1rem 1rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: 0.25rem; }
.alert-success { color: #0f5132; background-color: #d1e7dd; border-color: #badbcc; }
.alert-danger { color: #842029; background-color: #f8d7da; border-color: #f5c2c7; }

.card { position: relative; display: flex; flex-direction: column; min-width: 0; word-wrap: break-word; background-color: #fff; background-clip: border-box; border: 1px solid rgba(0,0,0,.125); border-radius: 0.25rem; box-shadow: 0 .125rem .25rem rgba(0,0,0,.075); }
.card-header { padding: 0.75rem 1.25rem; margin-bottom: 0; background-color: rgba(0,0,0,.03); border-bottom: 1px solid rgba(0,0,0,.125); }
.card-body { flex: 1 1 auto; padding: 1rem 1rem; }
.bg-dark { background-color: #212529 !important; }
.text-white { color: #fff !important; }

.form-label { margin-bottom: 0.5rem; font-weight: 600; color: #444; }
.form-control { display: block; width: 100%; padding: 0.375rem 0.75rem; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; background-color: #fff; background-clip: padding-box; border: 1px solid #ced4da; appearance: none; border-radius: 0.25rem; transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out; }
.form-control:focus { border-color: #86b7fe; outline: 0; box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25); }
.form-text { margin-top: 0.25rem; font-size: 0.875em; color: #6c757d; }
.text-danger { color: #dc3545 !important; }
.text-success { color: #198754 !important; }
.text-muted { color: #6c757d !important; }
.text-primary { color: #007bff !important; } /* Untuk teks "Mengunggah..." */


.btn { display: inline-block; font-weight: 400; color: #212529; text-align: center; vertical-align: middle; cursor: pointer; user-select: none; background-color: transparent; border: 1px solid transparent; padding: 0.375rem 0.75rem; font-size: 1rem; line-height: 1.5; border-radius: 0.25rem; transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; }
.btn-info { color: #fff; background-color: #0dcaf0; border-color: #0dcaf0; }
.btn-info:hover { background-color: #31d2f2; border-color: #25cff2; }
.btn-success { color: #fff; background-color: #198754; border-color: #198754; }
.btn-success:hover { background-color: #157347; border-color: #146c43; }
.btn-secondary { color: #fff; background-color: #6c757d; border-color: #6c757d; }
.btn-secondary:hover { background-color: #5c636a; border-color: #565e64; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; border-radius: 0.2rem; }

hr {
    margin: 1.5rem 0;
    color: inherit;
    background-color: currentColor;
    border: 0;
    opacity: .25;
    height: 1px;
}

/* Gaya khusus untuk Manajemen Gambar Galeri */
.upload-button {
  min-width: 150px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.image-thumbnail-grid {
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); 
  gap: 15px; 
  padding: 10px;
  background-color: #f0f0f0; 
  border-radius: 8px;
  border: 1px dashed #ccc;
  min-height: 150px; 
  align-items: flex-start; 
  align-content: flex-start; 
}

.image-thumbnail-item {
  width: 120px; 
  height: 120px; 
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15); 
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  text-align: center;
  border: 1px solid #ddd;
}

.image-thumbnail-item img {
  max-width: 100%;
  max-height: 80px; 
  object-fit: contain; 
  border-radius: 4px;
}

.image-thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.7); 
  display: flex;
  flex-direction: column; 
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
  gap: 8px; 
}

.image-thumbnail-item:hover .image-thumbnail-overlay {
  opacity: 1;
}

.action-button {
  width: 90px; 
  font-size: 0.75em;
  padding: 5px 8px;
}

.image-url-text {
  font-size: 0.65em; 
  word-break: break-all; 
  white-space: normal; 
  margin-top: 5px;
  color: #666;
}

.empty-gallery-message {
    font-style: italic;
    color: #888;
    grid-column: 1 / -1; 
    text-align: center;
    padding: 20px 0;
}

/* Responsivitas untuk grid thumbnail */
@media (max-width: 767px) {
  .image-thumbnail-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
  .image-thumbnail-item {
    width: 100px;
    height: 100px;
  }
  .image-thumbnail-item img {
    max-height: 60px;
  }
  .action-button {
    width: 70px;
    font-size: 0.65em;
    padding: 3px 5px;
  }
  .image-url-text {
    font-size: 0.6em;
  }
}
</style>