<template>
  <div class="py-3">
    <h1>Edit Halaman: {{ page.title ?? 'Tidak Ditemukan' }}</h1>

    <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

    <div class="card shadow-sm mt-4">
      <div class="card-header bg-dark text-white">
        Formulir Edit Halaman
      </div>
      <div class="card-body">
        <form @submit.prevent="updatePage">
          <div class="mb-3">
            <label for="title" class="form-label">Judul Halaman</label>
            <input type="text" class="form-control" id="title" v-model="page.title" required>
            <div v-if="validationErrors.title" class="text-danger mt-1">{{ validationErrors.title[0] }}</div>
          </div>

          <div class="mb-3">
            <label for="slug" class="form-label">Slug (URL)</label>
            <input type="text" class="form-control" id="slug" v-model="page.slug" required>
            <div v-if="validationErrors.slug" class="text-danger mt-1">{{ validationErrors.slug[0] }}</div>
            <small class="form-text text-muted">Contoh: 'beranda', 'tentang', 'kontak'. Slug harus unik.</small>
          </div>

          <div class="mb-3">
            <label for="hero_title" class="form-label">Judul Hero (Untuk Beranda)</label>
            <input type="text" class="form-control" id="hero_title" v-model="page.hero_title">
            <div v-if="validationErrors.hero_title" class="text-danger mt-1">{{ validationErrors.hero_title[0] }}</div>
            <small class="form-text text-muted">Judul utama di bagian atas halaman beranda.</small>
          </div>
          
          <!-- URL Video Hero -->
          <div class="mb-3">
            <label for="hero_video_url" class="form-label">URL Video Hero (MP4/YouTube/Drive)</label>
            <input type="text" class="form-control" id="hero_video_url" v-model="page.hero_video_url">
            <small class="form-text text-muted">Contoh: '/static/assets/beranda.mp4' (untuk MP4), 'https://www.youtube.com/watch?v=ID' (untuk YouTube), 'https://drive.google.com/file/d/ID/view' (untuk Google Drive Video)</small>
            
            <!-- Pratinjau Video Hero -->
            <div v-if="page.hero_video_url" class="hero-media-preview-wrapper mt-3">
                <template v-if="getMediaType(page.hero_video_url) === 'youtube'">
                    <iframe 
                      :src="`https://www.youtube.com/embed/${getYoutubeVideoId(page.hero_video_url)}?autoplay=0&mute=0&controls=1`" 
                      frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowfullscreen 
                      class="hero-media-preview">
                    </iframe>
                </template>
                <template v-else-if="getMediaType(page.hero_video_url) === 'drive'">
                    <iframe 
                      :src="`https://drive.google.com/file/d/${getDriveFileId(page.hero_video_url)}/preview`" 
                      frameborder="0" 
                      allow="autoplay; encrypted-media; gyroscope; picture-in-picture" 
                      allowfullscreen 
                      class="hero-media-preview">
                    </iframe>
                </template>
                <video controls v-else-if="getMediaType(page.hero_video_url) === 'mp4'" :src="page.hero_video_url" class="hero-media-preview"></video>
                <p v-else class="text-muted">Pratinjau tidak tersedia untuk tipe ini atau URL tidak valid.</p>
                <button type="button" @click="removeHeroVideo" class="btn btn-danger btn-sm hero-media-remove-btn mt-2">Hapus Video Hero</button>
            </div>
          </div>

          <!-- URL Gambar Hero -->
          <div class="mb-3">
            <label for="hero_image_url" class="form-label">URL Gambar Hero (File/Eksternal/Drive)</label>
            <input type="text" class="form-control" id="hero_image_url" v-model="page.hero_image_url">
            <small class="form-text text-muted">Contoh: '/static/assets/hero-image.jpg' (Static), 'https://example.com/image.jpg' (Eksternal), 'https://drive.google.com/uc?id=FILE_ID' (Drive)</small>
            
            <!-- Input file untuk upload gambar hero -->
            <input type="file" ref="heroImageInput" @change="handleHeroImageSelect" class="form-control mt-2 mb-2" accept="image/*">
            <button type="button" @click="uploadHeroImage" class="btn btn-info btn-sm">Unggah Gambar Hero Baru</button>
            <span v-if="uploadingHeroImage" class="ms-2 text-muted">Mengunggah...</span>
            <p v-if="heroUploadError" class="text-danger mt-1">{{ heroUploadError }}</p>
            <p v-if="heroUploadSuccessMessage" class="text-success mt-1">{{ heroUploadSuccessMessage }}</p>

            <!-- Pratinjau Gambar Hero Saat Ini dan Tombol Hapus -->
            <div v-if="page.hero_image_url" class="hero-image-preview-wrapper mt-3">
              <img :src="page.hero_image_url" alt="Pratinjau Gambar Hero" class="img-thumbnail hero-image-preview">
              <button type="button" @click="removeHeroImage" class="btn btn-danger btn-sm hero-image-remove-btn">Hapus Gambar Hero</button>
            </div>
          </div>

          <hr>
          <div v-if="page.slug === 'beranda'">
            <h4 class="mb-3">Konten Spesifik Halaman Beranda</h4>
            <div class="mb-3">
              <label for="homepage_about_section_text" class="form-label">Teks Bagian Tentang Kami (Beranda)</label>
              <textarea class="form-control" id="homepage_about_section_text" v-model="page.homepage_about_section_text" rows="5"></textarea>
              <div v-if="validationErrors.homepage_about_section_text" class="text-danger mt-1">{{ validationErrors.homepage_about_section_text[0] }}</div>
              <small class="form-text text-muted">Paragraf utama di bagian "Tentang Kami" pada beranda.</small>
            </div>
            <div class="mb-3">
              <label for="homepage_services_section_text" class="form-label">Teks Bagian Layanan Kami (Beranda)</label>
              <textarea class="form-control" id="homepage_services_section_text" v-model="page.homepage_services_section_text" rows="5"></textarea>
              <div v-if="validationErrors.homepage_services_section_text" class="text-danger mt-1">{{ validationErrors.homepage_services_section_text[0] }}</div>
              <small class="form-text text-muted">Paragraf utama di bagian "Layanan Kami" pada beranda.</small>
            </div>

            <!-- Manajemen Gambar Bawah Beranda -->
            <h5 class="mt-4">Gambar Bagian Bawah Beranda</h5>
            <template v-for="i in 3" :key="`homepage-bottom-image-${i}`">
              <div class="mb-3">
                <label :for="`homepage_bottom_image_${i}_url`" class="form-label">URL Gambar Bawah {{ i }}</label>
                <input type="text" class="form-control" :id="`homepage_bottom_image_${i}_url`" v-model="page[`homepage_bottom_image_${i}_url`]">
                <small class="form-text text-muted">URL gambar untuk bagian bawah beranda.</small>
                
                <input type="file" :ref="el => homepageBottomImageInputs[i-1] = el" @change="event => handleSpecificImageSelect(event, `homepage_bottom_image_${i}_url`, i-1)" class="form-control mt-2 mb-2" accept="image/*">
                <button type="button" @click="uploadSpecificImage(homepageBottomImageInputs[i-1], `homepage_bottom_image_${i}_url`, i-1)" class="btn btn-info btn-sm">Unggah Gambar {{ i }}</button>
                <button type="button" @click="removeSpecificImage(`homepage_bottom_image_${i}_url`, i-1)" class="btn btn-danger btn-sm ms-2">Hapus Gambar {{ i }}</button>
                <span v-if="specificImageUploading[i-1]" class="ms-2 text-muted">Mengunggah...</span>
                <p v-if="specificImageError[i-1]" class="text-danger mt-1">{{ specificImageError[i-1] }}</p>
                <p v-if="specificImageSuccessMessage[i-1]" class="text-success mt-1">{{ specificImageSuccessMessage[i-1] }}</p>

                <!-- Pratinjau Gambar Bawah Beranda -->
                <div v-if="page[`homepage_bottom_image_${i}_url`]" class="hero-image-preview-wrapper mt-3">
                    <img :src="page[`homepage_bottom_image_${i}_url`]" :alt="`Gambar Bawah ${i}`" class="img-thumbnail hero-image-preview">
                </div>
              </div>
            </template>
          </div>

          <hr>
          <div v-if="page.slug === 'tentang'">
            <h4 class="mb-3">Konten Spesifik Halaman Tentang Kami</h4>
            <div class="mb-3">
              <label for="vision_title" class="form-label">Judul Visi</label>
              <input type="text" class="form-control" id="vision_title" v-model="page.vision_title">
              <div v-if="validationErrors.vision_title" class="text-danger mt-1">{{ validationErrors.vision_title[0] }}</div>
            </div>
            <div class="mb-3">
              <label for="vision_body" class="form-label">Isi Visi</label>
              <textarea class="form-control" id="vision_body" v-model="page.vision_body" rows="3"></textarea>
              <div v-if="validationErrors.vision_body" class="text-danger mt-1">{{ validationErrors.vision_body[0] }}</div>
            </div>
            <div class="mb-3">
              <label for="mission_title" class="form-label">Judul Misi</label>
              <input type="text" class="form-control" id="mission_title" v-model="page.mission_title">
              <div v-if="validationErrors.mission_title" class="text-danger mt-1">{{ validationErrors.mission_title[0] }}</div>
            </div>
            <div class="mb-3">
              <label for="mission_body" class="form-label">Isi Misi</label>
              <textarea class="form-control" id="mission_body" v-model="page.mission_body" rows="3"></textarea>
              <div v-if="validationErrors.mission_body" class="text-danger mt-1">{{ validationErrors.mission_body[0] }}</div>
            </div>
            <div class="mb-3">
              <label for="excellence_title" class="form-label">Judul Keunggulan</label>
              <input type="text" class="form-control" id="excellence_title" v-model="page.excellence_title">
              <div v-if="validationErrors.excellence_title" class="text-danger mt-1">{{ validationErrors.excellence_title[0] }}</div>
            </div>
            <!-- Manajemen Gambar Keunggulan -->
            <h5 class="mt-4">Gambar Keunggulan</h5>
            <template v-for="i in 3" :key="`excellence-image-${i}`">
              <div class="mb-3">
                <label :for="`excellence_image_${i}_url`" class="form-label">URL Gambar Keunggulan {{ i }}</label>
                <input type="text" class="form-control" :id="`excellence_image_${i}_url`" v-model="page[`excellence_image_${i}_url`]">
                <small class="form-text text-muted">URL gambar untuk bagian keunggulan.</small>
                
                <input type="file" :ref="el => excellenceImageInputs[i-1] = el" @change="event => handleSpecificImageSelect(event, `excellence_image_${i}_url`, 3 + i-1)" class="form-control mt-2 mb-2" accept="image/*">
                <button type="button" @click="uploadSpecificImage(excellenceImageInputs[i-1], `excellence_image_${i}_url`, 3 + i-1)" class="btn btn-info btn-sm">Unggah Gambar {{ i }}</button>
                <button type="button" @click="removeSpecificImage(`excellence_image_${i}_url`, 3 + i-1)" class="btn btn-danger btn-sm ms-2">Hapus Gambar {{ i }}</button>
                <span v-if="specificImageUploading[3 + i-1]" class="ms-2 text-muted">Mengunggah...</span>
                <p v-if="specificImageError[3 + i-1]" class="text-danger mt-1">{{ specificImageError[3 + i-1] }}</p>
                <p v-if="specificImageSuccessMessage[3 + i-1]" class="text-success mt-1">{{ specificImageSuccessMessage[3 + i-1] }}</p>

                <div v-if="page[`excellence_image_${i}_url`]" class="hero-image-preview-wrapper mt-3">
                    <img :src="page[`excellence_image_${i}_url`]" :alt="`Gambar Keunggulan ${i}`" class="img-thumbnail hero-image-preview">
                </div>
              </div>
            </template>
          </div>

          <hr>
          <div v-if="page.slug === 'layanan'">
            <h4 class="mb-3">Konten Spesifik Halaman Layanan Kami</h4>
            <div class="mb-3">
              <label for="main_intro_body" class="form-label">Paragraf Pembuka Layanan</label>
              <textarea class="form-control" id="main_intro_body" v-model="page.main_intro_body" rows="5"></textarea>
              <div v-if="validationErrors.main_intro_body" class="text-danger mt-1">{{ validationErrors.main_intro_body[0] }}</div>
            </div>
            <template v-for="i in 3" :key="`service-${i}`">
              <h5 class="mt-4">Kartu Layanan {{ i }}</h5>
              <div class="mb-3">
                <label :for="`service_${i}_title`" class="form-label">Judul Kartu Layanan {{ i }}</label>
                <input type="text" class="form-control" :id="`service_${i}_title`" v-model="page[`service_${i}_title`]">
                <div v-if="validationErrors[`service_${i}_title`]" class="text-danger mt-1">{{ validationErrors[`service_${i}_title`][0] }}</div>
              </div>
              <div class="mb-3">
                <label :for="`service_${i}_body`" class="form-label">Deskripsi Kartu Layanan {{ i }}</label>
                <textarea class="form-control" :id="`service_${i}_body`" v-model="page[`service_${i}_body`]" rows="3"></textarea>
                <div v-if="validationErrors[`service_${i}_body`]" class="text-danger mt-1">{{ validationErrors[`service_${i}_body`][0] }}</div>
              </div>
              <div class="mb-3">
                <label :for="`service_${i}_image_url`" class="form-label">URL Gambar Kartu Layanan {{ i }}</label>
                <input type="text" class="form-control" :id="`service_${i}_image_url`" v-model="page[`service_${i}_image_url`]">
                <small class="form-text text-muted">Contoh: '/static/assets/layanan1.jpg'</small>
                
                <input type="file" :ref="el => serviceImageInputs[i-1] = el" @change="event => handleSpecificImageSelect(event, `service_${i}_image_url`, 6 + i-1)" class="form-control mt-2 mb-2" accept="image/*">
                <button type="button" @click="uploadSpecificImage(serviceImageInputs[i-1], `service_${i}_image_url`, 6 + i-1)" class="btn btn-info btn-sm">Unggah Gambar {{ i }}</button>
                <button type="button" @click="removeSpecificImage(`service_${i}_image_url`, 6 + i-1)" class="btn btn-danger btn-sm ms-2">Hapus Gambar {{ i }}</button>
                <span v-if="specificImageUploading[6 + i-1]" class="ms-2 text-muted">Mengunggah...</span>
                <p v-if="specificImageError[6 + i-1]" class="text-danger mt-1">{{ specificImageError[6 + i-1] }}</p>
                <p v-if="specificImageSuccessMessage[6 + i-1]" class="text-success mt-1">{{ specificImageSuccessMessage[6 + i-1] }}</p>

                <div v-if="page[`service_${i}_image_url`]" class="hero-image-preview-wrapper mt-3">
                    <img :src="page[`service_${i}_image_url`]" :alt="`Gambar Layanan ${i}`" class="img-thumbnail hero-image-preview">
                </div>
              </div>
            </template>
          </div>

          <hr>
          <!-- Perbaikan: Bagian Galeri telah dipindahkan ke /admin/gallery -->
          <!-- Hapus bagian ini jika sudah dipindahkan sepenuhnya dan tidak ingin ada duplikasi -->

          <hr>
          <div v-if="page.slug === 'kontak'">
            <h4 class="mb-3">Konten Spesifik Halaman Kontak Kami</h4>
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
          </div>

          <hr>
          <div v-if="page.slug === 'faq'">
            <h4 class="mb-3">Konten Spesifik Halaman FAQ</h4>
            <div class="mb-3">
              <label for="faq_main_title" class="form-label">Judul Utama FAQ</label>
              <input type="text" class="form-control" id="faq_main_title" v-model="page.faq_main_title">
              <div v-if="validationErrors.faq_main_title" class="text-danger mt-1">{{ validationErrors.faq_main_title[0] }}</div>
            </div>
            <template v-for="i in 5" :key="`faq-${i}`">
              <h5 class="mt-4">Item FAQ {{ i }}</h5>
              <div class="mb-3">
                <label :for="`faq_${i}_question`" class="form-label">Pertanyaan {{ i }}</label>
                <input type="text" class="form-control" :id="`faq_${i}_question`" v-model="page[`faq_${i}_question`]">
                <div v-if="validationErrors[`faq_${i}_question`]" class="text-danger mt-1">{{ validationErrors[`faq_${i}_question`][0] }}</div>
              </div>
              <div class="mb-3">
                <label :for="`faq_${i}_answer`" class="form-label">Jawaban {{ i }}</label>
                <textarea class="form-control" :id="`faq_${i}_answer`" v-model="page[`faq_${i}_answer`]" rows="3"></textarea>
                <div v-if="validationErrors[`faq_${i}_answer`]" class="text-danger mt-1">{{ validationErrors[`faq_${i}_answer`][0] }}</div>
              </div>
            </template>
          </div>

          <hr>
          <div class="mb-3">
            <label for="body" class="form-label">Konten Halaman (Utama)</label>
            <textarea class="form-control" id="body" v-model="page.body" rows="10"></textarea>
            <div v-if="validationErrors.body" class="text-danger mt-1">{{ validationErrors.body[0] }}</div>
            <small class="form-text text-muted">Isi utama halaman ini. Anda bisa menggunakan HTML di sini.</small>
          </div>

          <button type="submit" class="btn btn-success mt-3">Simpan Perubahan</button>
          <NuxtLink to="/admin/pages" class="btn btn-secondary mt-3 ms-2">Batal</NuxtLink>
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
  title: 'Edit Halaman'
});

const route = useRoute();
const router = useRouter();
const page = ref({});
const successMessage = ref(null);
const errorMessage = ref(null);
const validationErrors = ref({});
const galleryImageInput = ref(null); 
const uploadingImage = ref(false);
const uploadError = ref(null);
const uploadSuccessMessage = ref(null);
const heroImageInput = ref(null); 
const uploadingHeroImage = ref(false);
const heroUploadError = ref(null);
const heroUploadSuccessMessage = ref(null);


const config = useRuntimeConfig(); 
const API_BASE_URL = config.public.apiBase; 


onMounted(async () => {
  const pageId = route.params.id; 
  if (pageId) {
    await fetchPage(pageId);
  } else {
    errorMessage.value = 'ID/Slug Halaman tidak ditemukan.';
  }
});

async function fetchPage(idOrSlug) {
  try {
    const response = await fetch(`${API_BASE_URL}/pages/${idOrSlug}`); 
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal mengambil data halaman.');
    }
    page.value = await response.json(); 
    
    // Perbaikan: Parse images JSONB dari string jika perlu
    if (typeof page.value.images === 'string' && page.value.images.startsWith('[')) {
      try {
        page.value.images = JSON.parse(page.value.images);
      } catch (e) { // Fixed to use 'e' from this specific catch block
        console.error("Failed to parse images JSON for edit form:", e); 
        page.value.images = []; // Fallback to empty array
      }
    } else if (!Array.isArray(page.value.images)) {
        page.value.images = []; // Ensure it's an array for consistency
    }

  } catch (e) {
    errorMessage.value = e.message;
    console.error('Error fetching page:', e);
  }
}

// Fungsi untuk menentukan tipe media berdasarkan URL
const getMediaType = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('drive.google.com') && url.includes('file/d/')) return 'drive';
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'mp4';
    return 'static'; 
};

// Fungsi helper untuk mendapatkan ID YouTube dari URL
const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2] && match[2].length === 11) ? match[2] : null;
};

// Fungsi helper untuk mendapatkan ID File Google Drive dari URL
const getDriveFileId = (url) => {
    if (!url) return null;
    const regExp = /(https?:\/\/drive\.google\.com\/file\/d\/|https?:\/\/drive\.google\.com\/open\?id=)([^#\&\?\/]+)/;
    const match = url.match(regExp);
    return (match && match[2]) ? match[2] : null;
};

async function updatePage() {
  successMessage.value = null;
  errorMessage.value = null;
  validationErrors.value = {};

  try {
    const pageDataToSend = { ...page.value };

    // Konversi array images kembali menjadi string JSON sebelum dikirim ke backend
    if (Array.isArray(pageDataToSend.images)) {
        pageDataToSend.images = JSON.stringify(pageDataToSend.images);
    } else {
        pageDataToSend.images = '[]'; 
    }
    
    // Inisialisasi atau infer hero_video_source_type dan hero_image_source_type
    // Berdasarkan URL yang ada di input fields
    pageDataToSend.hero_video_source_type = getMediaType(pageDataToSend.hero_video_url) || null;
    pageDataToSend.hero_image_source_type = getMediaType(pageDataToSend.hero_image_url) || 'static'; // Default ke static jika tidak ada URL gambar atau tidak dikenali sebagai video/drive

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
        throw new Error(errorData.message || 'Gagal menyimpan perubahan halaman.');
      }
    } else {
      successMessage.value = 'Halaman berhasil diperbarui!';
      setTimeout(() => {
        router.push({ path: '/admin/pages', query: { success: 'Halaman berhasil diperbarui!' } });
      }, 1000); 
    }
  } catch (e) {
    errorMessage.value = e.message;
    console.error('Error updating page:', e);
  }
}

// === Metode untuk Upload Gambar Galeri (TETAP DI SINI UNTUK GALERI SLUG) ===
// Ini akan muncul jika page.slug === 'galeri' seperti di template
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
      if (!Array.isArray(page.value.images)) {
        page.value.images = [];
      }
      page.value.images.push(imageUrl);
      uploadSuccessMessage.value = 'Gambar berhasil diunggah! Klik Simpan Perubahan untuk menyimpan ke database.';
      galleryImageInput.value.value = '';
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
    page.value.images.splice(index, 1);
    successMessage.value = 'Gambar dihapus dari daftar. Klik Simpan Perubahan untuk menyimpan ke database.';
    setTimeout(() => successMessage.value = null, 3000);
  }
}


// === Metode untuk Upload Gambar Hero ===
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
      // Tipe sumber akan disimpulkan di updatePage
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

function removeHeroImage() {
  if (confirm('Apakah Anda yakin ingin menghapus gambar hero? Ini akan menghapus URL dari database.')) {
    page.value.hero_image_url = null; // Setel ke null atau string kosong
    page.value.hero_image_source_type = 'static'; // Kembali ke tipe default jika dihapus
    successMessage.value = 'Gambar hero dihapus. Klik Simpan Perubahan untuk menyimpan ke database.';
    setTimeout(() => successMessage.value = null, 3000);
  }
}

// === Metode Generik untuk Gambar Spesifik Halaman (Beranda, Tentang, Layanan) ===
const homepageBottomImageInputs = ref([]);
const excellenceImageInputs = ref([]);
const serviceImageInputs = ref([]);

const specificImageUploading = ref(Array(9).fill(false)); 
const specificImageError = ref(Array(9).fill(null));     
const specificImageSuccessMessage = ref(Array(9).fill(null)); 
const specificImageFiles = ref(Array(9).fill(null)); 

function handleSpecificImageSelect(event, propName, index) {
    const file = event.target.files[0];
    if (file) {
        specificImageFiles.value[index] = file;
        specificImageError.value[index] = null;
        specificImageSuccessMessage.value[index] = null;
    }
}

async function uploadSpecificImage(inputRef, propName, index) {
    const file = specificImageFiles.value[index]; 
    if (!file) {
        specificImageError.value[index] = "Pilih gambar untuk diunggah.";
        return;
    }

    specificImageUploading.value[index] = true;
    specificImageError.value[index] = null;
    specificImageSuccessMessage.value[index] = null;

    const formData = new FormData();
    formData.append('image', file); 

    try {
        const response = await fetch(`${API_BASE_URL}/upload-image`, { 
            method: 'POST',
            body: formData 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Gagal mengunggah gambar ${propName}.`);
        }

        const result = await response.json();
        const imageUrl = result.publicUrl; 

        if (imageUrl) {
            page.value[propName] = imageUrl; 
            specificImageSuccessMessage.value[index] = `Gambar berhasil diunggah! Klik Simpan Perubahan.`;
            if (inputRef && inputRef.value) { 
                inputRef.value.value = '';
            }
            specificImageFiles.value[index] = null; 
        } else {
            throw new Error('URL gambar tidak diterima dari server.');
        }

    } catch (e) {
        specificImageError.value[index] = e.message;
        console.error(`Upload ${propName} error:`, e);
    } finally {
        specificImageUploading.value[index] = false;
    }
}

function removeSpecificImage(propName, index) {
    if (confirm(`Apakah Anda yakin ingin menghapus gambar ini? Ini akan menghapus URL dari database.`)) {
        page.value[propName] = null; 
        specificImageSuccessMessage.value[index] = 'Gambar dihapus. Klik Simpan Perubahan untuk menyimpan.';
        setTimeout(() => specificImageSuccessMessage.value[index] = null, 3000);
    }
}
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

/* Gaya untuk pratinjau media hero */
.hero-video-preview-wrapper, .hero-image-preview-wrapper {
  max-width: 300px; /* Batasi lebar pratinjau */
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 15px;
  position: relative;
  background-color: #f0f0f0;
}

.hero-media-preview {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain; /* Jaga aspek rasio */
}

.hero-image-preview {
  max-height: 200px; /* Batasi tinggi pratinjau gambar */
}

.hero-media-remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
  font-size: 0.7em;
  padding: 5px 8px;
}

/* Gaya untuk grid thumbnail gambar */
.image-thumbnail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.image-thumbnail-item {
  width: 100px; /* Lebar thumbnail */
  height: 100px; /* Tinggi thumbnail */
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
}

.image-thumbnail-item img {
  max-width: 100%;
  max-height: 80px; /* Batasi tinggi gambar agar tombol hapus terlihat */
  object-fit: contain; /* Jaga aspek rasio */
  border-radius: 4px;
}

.image-thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.image-thumbnail-item:hover .image-thumbnail-overlay {
  opacity: 1;
}

.image-thumbnail-overlay button {
  font-size: 0.7em;
  padding: 3px 6px;
}
</styLE>