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
          
          <div class="mb-3">
            <label for="hero_video_url" class="form-label">URL Video Hero (MP4)</label>
            <input type="text" class="form-control" id="hero_video_url" v-model="page.hero_video_url">
            <small class="form-text text-muted">Contoh: '/static/assets/beranda.mp4'</small>
          </div>

          <div class="mb-3">
            <label for="hero_image_url" class="form-label">URL Gambar Hero (Fallback jika tidak ada video)</label>
            <input type="text" class="form-control" id="hero_image_url" v-model="page.hero_image_url">
            <small class="form-text text-muted">Contoh: '/static/assets/hero-image.jpg'</small>
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
              <!-- Untuk gambar layanan (jika ada kolom di DB) -->
              <div class="mb-3">
                <label :for="`service_${i}_image_url`" class="form-label">URL Gambar Kartu Layanan {{ i }}</label>
                <input type="text" class="form-control" :id="`service_${i}_image_url`" v-model="page[`service_${i}_image_url`]">
                <small class="form-text text-muted">Contoh: '/static/assets/layanan1.jpg'</small>
                <div v-if="validationErrors[`service_${i}_image_url`]" class="text-danger mt-1">{{ validationErrors[`service_${i}_image_url`][0] }}</div>
              </div>
            </template>
          </div>

          <hr>
          <div v-if="page.slug === 'galeri'">
            <h4 class="mb-3">Konten Spesifik Halaman Galeri</h4>
            <div class="mb-3">
              <label for="gallery_intro_body" class="form-label">Paragraf Pembuka Galeri</label>
              <textarea class="form-control" id="gallery_intro_body" v-model="page.gallery_intro_body" rows="5"></textarea>
              <div v-if="validationErrors.gallery_intro_body" class="text-danger mt-1">{{ validationErrors.gallery_intro_body[0] }}</div>
            </div>
            <!-- Form untuk images (JSON Array) -->
            <div class="mb-3">
                <label for="images" class="form-label">URL Gambar Galeri (JSON Array)</label>
                <textarea class="form-control" id="images" v-model="page.images" rows="5" placeholder='["/path/to/img1.jpg", "/path/to/img2.jpg"]'></textarea>
                <small class="form-text text-muted">Masukkan URL gambar sebagai JSON array. Contoh: ["/assets/galeri/img1.jpg", "/assets/galeri/img2.jpg"]</small>
                <div v-if="validationErrors.images" class="text-danger mt-1">{{ validationErrors.images[0] }}</div>
            </div>
            </div>

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
  } catch (e) {
    errorMessage.value = e.message;
    console.error('Error fetching page:', e);
  }
}

async function updatePage() {
  successMessage.value = null;
  errorMessage.value = null;
  validationErrors.value = {};

  try {
    const response = await fetch(`${API_BASE_URL}/pages/${page.value.id}`, { 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(page.value)
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