<template>
  <div class="py-3">
    <h1>Edit Informasi Kontak</h1>

    <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

    <div class="card shadow-sm mt-4">
      <div class="card-header bg-dark text-white">
        Formulir Edit Kontak
      </div>
      <div class="card-body">
        <form @submit.prevent="updateContact">
          <!-- Bidang untuk Judul Halaman dan Slug jika Anda ingin mengeditnya dari sini juga -->
          <div class="mb-3">
            <label for="title" class="form-label">Judul Halaman (Kontak)</label>
            <input type="text" class="form-control" id="title" v-model="page.title">
            <div v-if="validationErrors.title" class="text-danger mt-1">{{ validationErrors.title[0] }}</div>
          </div>
          <div class="mb-3">
            <label for="slug" class="form-label">Slug (URL)</label>
            <input type="text" class="form-control" id="slug" v-model="page.slug">
            <div v-if="validationErrors.slug" class="text-danger mt-1">{{ validationErrors.slug[0] }}</div>
          </div>
          
          <div class="mb-3">
            <label for="contact_overlay_text" class="form-label">Teks Overlay Hero</label>
            <input type="text" class="form-control" id="contact_overlay_text" v-model="page.contact_overlay_text">
            <div v-if="validationErrors.contact_overlay_text" class="text-danger mt-1">{{ validationErrors.contact_overlay_text[0] }}</div>
            <small class="form-text text-muted">Teks singkat di atas gambar hero halaman Kontak.</small>
          </div>
          <div class="mb-3">
            <label for="contact_title" class="form-label">Judul Utama Kontak</label>
            <input type="text" class="form-control" id="contact_title" v-model="page.contact_title">
            <div v-if="validationErrors.contact_title" class="text-danger mt-1">{{ validationErrors.contact_title[0] }}</div>
          </div>
          
          <h5 class="mt-4">Info Kontak (Telepon)</h5>
          <div class="mb-3">
            <label for="contact_phone" class="form-label">Nomor Telepon</label>
            <input type="text" class="form-control" id="contact_phone" v-model="page.contact_phone">
            <div v-if="validationErrors.contact_phone" class="text-danger mt-1">{{ validationErrors.contact_phone[0] }}</div>
          </div>
          <h5 class="mt-4">Info Kontak (Lokasi)</h5>
          <div class="mb-3">
            <label for="contact_location_title" class="form-label">Judul Lokasi</label>
            <input type="text" class="form-control" id="contact_location_title" v-model="page.contact_location_title">
            <div v-if="validationErrors.contact_location_title" class="text-danger mt-1">{{ validationErrors.contact_location_title[0] }}</div>
          </div>
          <div class="mb-3">
            <label for="contact_location_body" class="form-label">Alamat Lengkap</label>
            <textarea class="form-control" id="contact_location_body" v-model="page.contact_location_body" rows="3"></textarea>
            <div v-if="validationErrors.contact_location_body" class="text-danger mt-1">{{ validationErrors.contact_location_body[0] }}</div>
          </div>
          <h5 class="mt-4">Info Kontak (Email)</h5>
          <div class="mb-3">
            <label for="contact_email_title" class="form-label">Judul Email</label>
            <input type="text" class="form-control" id="contact_email_title" v-model="page.contact_email_title">
            <div v-if="validationErrors.contact_email_title" class="text-danger mt-1">{{ validationErrors.contact_email_title[0] }}</div>
          </div>
          <div class="mb-3">
            <label for="contact_email_address" class="form-label">Alamat Email</label>
            <input type="email" class="form-control" id="contact_email_address" v-model="page.contact_email_address">
            <div v-if="validationErrors.contact_email_address" class="text-danger mt-1">{{ validationErrors.contact_email_address[0] }}</div>
          </div>
          <div class="mb-3">
            <label for="contact_whatsapp_number" class="form-label">Nomor WhatsApp (untuk Tombol)</label>
            <input type="text" class="form-control" id="contact_whatsapp_number" v-model="page.contact_whatsapp_number">
            <div v-if="validationErrors.contact_whatsapp_number" class="text-danger mt-1">{{ validationErrors.contact_whatsapp_number[0] }}</div>
            <small class="form-text text-muted">Contoh: +6287812345678 (gunakan format internasional).</small>
          </div>
          
          <!-- Tambahan: Input file untuk upload gambar hero (hero_image_url) -->
          <div class="mb-3">
            <label for="hero_image_source_type" class="form-label">Tipe Sumber Gambar Hero</label>
            <select class="form-control" id="hero_image_source_type" v-model="page.hero_image_source_type">
              <option value="static">File Gambar Lokal/Static</option>
              <option value="external">URL Gambar Eksternal (JPG/PNG)</option>
              <option value="drive">Google Drive Gambar URL</option>
              <option value="">Tidak Ada Gambar</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="hero_image_url" class="form-label">URL Gambar Hero</label>
            <input type="text" class="form-control" id="hero_image_url" v-model="page.hero_image_url">
            <small class="form-text text-muted">Contoh: '/static/assets/hero-image.jpg' (untuk Static), 'https://example.com/image.jpg' (untuk Eksternal), 'https://drive.google.com/file/d/FILE_ID/view' (untuk Google Drive Gambar)</small>
            
            <input type="file" ref="heroImageInput" @change="handleHeroImageSelect" class="form-control mt-2 mb-2" accept="image/*">
            <button type="button" @click="uploadHeroImage" class="btn btn-info btn-sm">Unggah Gambar Hero Baru</button>
            <span v-if="uploadingHeroImage" class="ms-2 text-muted">Mengunggah...</span>
            <p v-if="heroUploadError" class="text-danger mt-1">{{ heroUploadError }}</p>
            <p v-if="heroUploadSuccessMessage" class="text-success mt-1">{{ heroUploadSuccessMessage }}</p>
          </div>

          <!-- Konten Halaman Utama (Body) -->
          <hr>
          <div class="mb-3">
            <label for="body" class="form-label">Konten Halaman (Utama)</label>
            <textarea class="form-control" id="body" v-model="page.body" rows="10"></textarea>
            <div v-if="validationErrors.body" class="text-danger mt-1">{{ validationErrors.body[0] }}</div>
            <small class="form-text text-muted">Isi utama halaman ini. Anda bisa menggunakan HTML di sini.</small>
          </div>


          <button type="submit" class="btn btn-success mt-3">Simpan Perubahan Kontak</button>
          <NuxtLink to="/admin/dashboard" class="btn btn-secondary mt-3 ms-2">Kembali ke Dashboard</NuxtLink>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Impor useRouter
import { useRuntimeConfig } from '#app'; 

definePageMeta({
  layout: 'admin',
  middleware: ['auth-admin'],
  title: 'Edit Kontak'
});

const page = ref({}); // Akan menyimpan data halaman 'kontak' dari DB
const successMessage = ref(null);
const errorMessage = ref(null);
const validationErrors = ref({});

// State untuk upload gambar hero
const heroImageInput = ref(null); 
const uploadingHeroImage = ref(false);
const heroUploadError = ref(null);
const heroUploadSuccessMessage = ref(null);

const config = useRuntimeConfig(); 
const API_BASE_URL = config.public.apiBase; 
const router = useRouter(); 

// Fungsi untuk memuat data halaman 'kontak'
async function fetchContactPageData() {
  try {
    const response = await fetch(`${API_BASE_URL}/pages/kontak`); 
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal memuat data kontak.');
    }
    const data = await response.json();
    page.value = data; 
  } catch (e) {
    errorMessage.value = e.message;
    console.error('Error fetching contact page:', e);
  }
}

// Fungsi untuk menyimpan perubahan kontak ke database
async function updateContact() {
  successMessage.value = null;
  errorMessage.value = null;
  validationErrors.value = {};

  try {
    const pageDataToSend = { ...page.value };
    // Pastikan images (dari galeri) dikonversi ke string JSON jika ada
    if (Array.isArray(pageDataToSend.images)) {
        pageDataToSend.images = JSON.stringify(pageDataToSend.images);
    } else {
        pageDataToSend.images = '[]'; 
    }
    
    // Perbaikan: Pastikan hero_video_url dan hero_image_url tidak terpengaruh jika NULL
    if (!pageDataToSend.hero_video_url) pageDataToSend.hero_video_url = null;
    if (!pageDataToSend.hero_image_url) pageDataToSend.hero_image_url = null;
    if (!pageDataToSend.hero_video_source_type) pageDataToSend.hero_video_source_type = 'mp4'; // Default
    if (!pageDataToSend.hero_image_source_type) pageDataToSend.hero_image_source_type = 'static'; // Default

    const response = await fetch(`${API_BASE_URL}/pages/${pageDataToSend.id}`, { 
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
        throw new Error(errorData.message || 'Gagal menyimpan perubahan kontak.');
      }
    } else {
      successMessage.value = 'Informasi Kontak berhasil diperbarui!';
      await fetchContactPageData(); 
      setTimeout(() => successMessage.value = null, 3000); 
    }
  } catch (e) {
    errorMessage.value = e.message;
    console.error('Error updating contact:', e);
  }
}

// === Metode Upload Gambar Hero ===
function handleHeroImageSelect(event) {
  const file = event.target.files[0];
  if (file) {
    heroUploadError.value = null;
    heroUploadSuccessMessage.value = null;
  }
}

async function uploadHeroImage() {
  const file = heroImageInput.value.files[0];
  if (!file) {
    heroUploadError.value = "Pilih gambar untuk diunggah.";
    return;
  }

  uploadingHeroImage.value = true;
  heroUploadError.value = null;
  heroUploadSuccessMessage.value = null;

  const formData = new FormData();
  formData.append('image', file); 

  try {
    const response = await fetch(`${API_BASE_URL}/upload-image`, { 
      method: 'POST',
      body: formData 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal mengunggah gambar hero.');
    }

    const result = await response.json();
    const imageUrl = result.publicUrl; 

    if (imageUrl) {
      page.value.hero_image_url = imageUrl; // Set URL gambar hero langsung
      page.value.hero_image_source_type = 'external'; // Asumsi gambar diunggah ke eksternal
      heroUploadSuccessMessage.value = 'Gambar hero berhasil diunggah! Klik Simpan Perubahan untuk menyimpan.';
      heroImageInput.value.value = ''; // Reset input file
    } else {
      throw new Error('URL gambar hero tidak diterima dari server.');
    }

  } catch (e) {
    heroUploadError.value = e.message;
    console.error('Upload hero image error:', e);
  } finally {
    uploadingHeroImage.value = false;
  }
}

onMounted(fetchContactPageData); 
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
</style>