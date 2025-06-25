<template>
  <div class="py-3">
    <h1>Tambah Halaman Baru</h1>

    <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

    <div class="card shadow-sm mt-4">
      <div class="card-header bg-dark text-white">
        Formulir Tambah Halaman
      </div>
      <div class="card-body">
        <form @submit.prevent="createPage">
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
          <div class="mb-3">
            <label for="body" class="form-label">Konten Utama Halaman (Bisa HTML)</label>
            <textarea class="form-control" id="body" v-model="page.body" rows="10"></textarea>
            <div v-if="validationErrors.body" class="text-danger mt-1">{{ validationErrors.body[0] }}</div>
            <small class="form-text text-muted">Isi utama halaman ini. Anda bisa menggunakan HTML di sini.</small>
          </div>

          <button type="submit" class="btn btn-success mt-3">Simpan Halaman</button>
          <NuxtLink to="/admin/pages" class="btn btn-secondary mt-3 ms-2">Batal</NuxtLink>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({
  layout: 'admin',
  middleware: ['auth-admin'],
  title: 'Tambah Halaman'
});

const router = useRouter();
const page = ref({
  title: '',
  slug: '',
  hero_title: '',
  hero_video_url: '',
  hero_image_url: '',
  homepage_about_section_text: '',
  homepage_services_section_text: '',
  body: '',
  contact_overlay_text: '', contact_title: '', contact_phone: '',
  contact_location_title: '', contact_location_body: '',
  contact_email_title: '', contact_email_address: '', contact_whatsapp_number: '',
  vision_title: '', vision_body: '', mission_title: '', mission_body: '', excellence_title: '',
  main_intro_body: '', service_1_title: '', service_1_body: '',
  service_2_title: '', service_2_body: '', service_3_title: '', service_3_body: '',
  gallery_intro_body: '',
  faq_main_title: '', faq_1_question: '', faq_1_answer: '',
  faq_2_question: '', faq_2_answer: '', faq_3_question: '', faq_3_answer: '',
  faq_4_question: '', faq_4_answer: '', faq_5_question: '', faq_5_answer: '',
});
const successMessage = ref(null);
const errorMessage = ref(null);
const validationErrors = ref({});

async function createPage() {
  successMessage.value = null;
  errorMessage.value = null;
  validationErrors.value = {};

  try {
    const response = await fetch('/api/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(page.value)
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 422 && errorData.errors) {
        validationErrors.value = errorData.errors;
        errorMessage.value = "Ada kesalahan validasi. Silakan periksa formulir Anda.";
      } else {
        throw new Error(errorData.message || 'Gagal menambahkan halaman.');
      }
    } else {
      successMessage.value = 'Halaman berhasil ditambahkan!';
      // Redirect kembali ke daftar halaman setelah berhasil
      router.push({ path: '/admin/pages', query: { success: 'Halaman berhasil ditambahkan!' } });
    }
  } catch (e) {
    errorMessage.value = e.message;
    console.error('Error creating page:', e);
  }
}
</script>

<style scoped>
/* Gaya yang sama dengan edit.vue untuk konsistensi */
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