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
      // Opsional: Muat ulang data galeri setelah sukses menyimpan (untuk konfirmasi visual)
      await fetchGalleryPageData();
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


onMounted(fetchGalleryPageData); // Muat data galeri saat komponen dimuat
</script>

<style scoped>
/* Gaya Bootstrap-like */
.py-3 { padding-top: 1rem; padding-bottom: 1rem; }
.mb-3 { margin-bottom: 1rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.ms-2 { margin-left: 0.5rem; }
.alert { padding: 1rem 1rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: 0.25rem; }
.alert-success { color: #0f5132; background-color: #d1e7dd; border-color: #badbcc; }
.alert-danger { color: #842029; background-color: #f8d7da; border-color: #f5c2c7; }
.card { position: relative; display: flex; flex-direction: column; min-width: 0; word-wrap: break-word; background-color: #fff; background-clip: border-box; border: 1px solid rgba(0,0,0,.125); border-radius: 0.25rem; box-shadow: 0 .125rem .25rem rgba(0,0,0,.075); }
.card-header { padding: 0.75rem 1.25rem; margin-bottom: 0; background-color: rgba(0,0,0,.03); border-bottom: 1px solid rgba(0,0,0,.125); }
.card-body { flex: 1 1 auto; padding: 1rem 1rem; }
.bg-dark { background-color: #212529 !important; }
.text-white { color: #fff !important; }
.form-label { margin-bottom: 0.5rem; }
.form-control { display: block; width: 100%; padding: 0.375rem 0.75rem; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; background-color: #fff; background-clip: padding-box; border: 1px solid #ced4da; appearance: none; border-radius: 0.25rem; transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out; }
.form-control:focus { border-color: #86b7fe; outline: 0; box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25); }
.form-text { margin-top: 0.25rem; font-size: 0.875em; color: #6c757d; }
.btn-success { background-color: #198754; border-color: #198754; color: white; }
.btn-secondary { background-color: #6c757d; border-color: #6c757d; color: white; }
hr {
    margin: 1rem 0;
    color: inherit;
    background-color: currentColor;
    border: 0;
    opacity: .25;
    height: 1px;
}

/* Gaya khusus untuk grid thumbnail gambar */
.image-thumbnail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.image-thumbnail-item {
  width: 120px; /* Lebar thumbnail yang sedikit lebih besar */
  height: 120px; /* Tinggi thumbnail */
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  text-align: center;
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
  background-color: rgba(0,0,0,0.6); /* Lebih gelap sedikit untuk kontras tombol */
  display: flex;
  flex-direction: column; /* Tumpuk tombol secara vertikal */
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
  gap: 5px; /* Jarak antar tombol */
}

.image-thumbnail-item:hover .image-thumbnail-overlay {
  opacity: 1;
}

.image-thumbnail-overlay button {
  font-size: 0.7em;
  padding: 3px 6px;
  width: 80px; /* Lebar tombol agar konsisten */
}
</style>
