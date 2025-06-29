// server.js

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid'); // Impor v4 dari uuid

const app = express();
const port = process.env.PORT || 8080; 

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey); 

const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET; 

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

const allowedOrigins = [
  'http://localhost:3000', 
  'https://cvalams-gjegff8f8-rizqis-projects-607b9812.vercel.app' // GANTI INI DENGAN URL PUBLIK VERCEL ANDA YANG SEBENARNYA!
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.error('CORS: Origin not allowed:', origin); 
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true 
}));

app.use(express.json()); 

// GET semua halaman
app.get('/api/pages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pages ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pages:', err);
    res.status(500).json({ message: 'Gagal mengambil halaman.' });
  }
});

// GET halaman berdasarkan ID atau Slug
app.get('/api/pages/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params; 
  let query;
  let values;

  const numericId = parseInt(idOrSlug);

  if (!isNaN(numericId)) {
    query = `SELECT * FROM pages WHERE id = $1`;
    values = [numericId];
  } else {
    query = `SELECT * FROM pages WHERE slug = $1`;
    values = [idOrSlug];
  }

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Halaman tidak ditemukan.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching page by ID/Slug:', err);
    res.status(500).json({ message: 'Gagal mengambil halaman.' });
  }
});

// Endpoint untuk mengunggah gambar
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
    }

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`; 
    
    const { data, error } = await supabase.storage
      .from(supabaseStorageBucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false 
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ message: 'Gagal mengunggah file ke Supabase Storage.', error: error.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from(supabaseStorageBucket)
      .getPublicUrl(fileName);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Gagal mendapatkan URL publik setelah upload.');
    }

    res.status(200).json({ publicUrl: publicUrlData.publicUrl });

  } catch (err) {
    console.error('Upload endpoint error:', err);
    res.status(500).json({ message: 'Kesalahan server saat mengunggah gambar.', error: err.message });
  }
});


// PUT (Update) halaman berdasarkan ID
app.put('/api/pages/:id', async (req, res) => {
  const { id } = req.params; 
  const numericId = parseInt(id); 

  if (isNaN(numericId)) {
      return res.status(400).json({ message: 'ID halaman tidak valid.' });
  }

  const {
    title, slug, hero_title, hero_video_url, hero_image_url,
    homepage_about_section_text, homepage_services_section_text,
    vision_title, vision_body, mission_title, mission_body, excellence_title,
    gallery_intro_body, contact_overlay_text, contact_title, contact_phone,
    contact_location_title, contact_location_body, contact_email_title,
    contact_email_address, contact_whatsapp_number, main_intro_body,
    service_1_title, service_1_body, service_2_title, service_2_body,
    service_3_title, service_3_body, faq_main_title, body,
    faq_1_question, faq_1_answer, faq_2_question, faq_2_answer, faq_3_question, faq_3_answer,
    faq_4_question, faq_4_answer, faq_5_question, faq_5_answer, images,
    hero_video_source_type, hero_image_source_type,
    // KOLOM BARU UNTUK GAMBAR LAINNYA
    homepage_bottom_image_1_url, homepage_bottom_image_2_url, homepage_bottom_image_3_url,
    excellence_image_1_url, excellence_image_2_url, excellence_image_3_url
  } = req.body;

  try {
    // Total Kolom di database Anda (44 + 6 baru = 50)
    // Pastikan updateQuery memiliki 41 + 6 = 47 placeholders untuk data, + 1 id = 48 total values
    // Kueri Anda menggunakan $1 sampai $43 (41 kolom data + 2 kolom hero_source) + $44 (id)
    // Sekarang akan ada 41 + 2 + 6 = 49 data yang di set + 1 id = 50
    const updateQuery = `
      UPDATE pages
      SET
        title = $1, slug = $2, hero_title = $3, hero_video_url = $4, hero_image_url = $5,
        homepage_about_section_text = $6, homepage_services_section_text = $7,
        vision_title = $8, vision_body = $9, mission_title = $10, mission_body = $11,
        excellence_title = $12, gallery_intro_body = $13, contact_overlay_text = $14,
        contact_title = $15, contact_phone = $16, contact_location_title = $17,
        contact_location_body = $18, contact_email_title = $19, contact_email_address = $20,
        contact_whatsapp_number = $21, main_intro_body = $22,
        service_1_title = $23, service_1_body = $24, service_2_title = $25, service_2_body = $26,
        service_3_title = $27, service_3_body = $28, faq_main_title = $29, body = $30,
        faq_1_question = $31, faq_1_answer = $32, faq_2_question = $33, faq_2_answer = $34, faq_3_question = $35, faq_3_answer = $36,
        faq_4_question = $37, faq_4_answer = $38, faq_5_question = $39, faq_5_answer = $40,
        images = $41, 
        hero_video_source_type = $42, hero_image_source_type = $43,
        homepage_bottom_image_1_url = $44, homepage_bottom_image_2_url = $45, homepage_bottom_image_3_url = $46, -- KOLOM BARU
        excellence_image_1_url = $47, excellence_image_2_url = $48, excellence_image_3_url = $49, -- KOLOM BARU
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $50 -- Ini akan menerima nilai 'id' yang sudah di-parse ke integer
      RETURNING *;
    `;
    
    const values = [
      title, slug, hero_title, hero_video_url, hero_image_url,
      homepage_about_section_text, homepage_services_section_text,
      vision_title, vision_body, mission_title, mission_body, excellence_title,
      gallery_intro_body, contact_overlay_text, contact_title, contact_phone,
      contact_location_title, contact_location_body, contact_email_title,
      contact_email_address, contact_whatsapp_number, main_intro_body,
      service_1_title, service_1_body, service_2_title, service_2_body,
      service_3_title, service_3_body, faq_main_title, body,
      faq_1_question, faq_1_answer, faq_2_question, faq_2_answer, faq_3_question, faq_3_answer,
      faq_4_question, faq_4_answer, faq_5_question, faq_5_answer, images, 
      hero_video_source_type, hero_image_source_type,
      homepage_bottom_image_1_url, homepage_bottom_image_2_url, homepage_bottom_image_3_url,
      excellence_image_1_url, excellence_image_2_url, excellence_image_3_url,
      numericId 
    ];

    const result = await pool.query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Halaman tidak ditemukan.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating page:', err);
    if (err.code === '23505' && err.constraint === 'pages_slug_key') {
      return res.status(422).json({ message: 'Slug sudah digunakan.', errors: { slug: ['Slug ini sudah ada.'] });
    }
    res.status(500).json({ message: 'Gagal menyimpan perubahan halaman.' });
  }
});

// POST (Create) halaman baru
app.post('/api/pages', async (req, res) => {
  const { 
    title, slug, hero_title, hero_video_url, hero_image_url,
    homepage_about_section_text, homepage_services_section_text,
    vision_title, vision_body, mission_title, mission_body, excellence_title,
    gallery_intro_body, contact_overlay_text, contact_title, contact_phone,
    contact_location_title, contact_location_body, contact_email_title,
    contact_email_address, contact_whatsapp_number, main_intro_body,
    service_1_title, service_1_body, service_2_title, service_2_body,
    service_3_title, service_3_body, faq_main_title, body,
    faq_1_question, faq_1_answer, faq_2_question, faq_2_answer, faq_3_question, faq_3_answer,
    faq_4_question, faq_4_answer, faq_5_question, faq_5_answer, images,
    hero_video_source_type, hero_image_source_type,
    // KOLOM BARU UNTUK GAMBAR LAINNYA
    homepage_bottom_image_1_url, homepage_bottom_image_2_url, homepage_bottom_image_3_url,
    excellence_image_1_url, excellence_image_2_url, excellence_image_3_url
  } = req.body;

  try {
    if (!title || !slug) {
        return res.status(400).json({ message: 'Judul dan Slug wajib diisi.' });
    }

    // Pastikan daftar kolom di INSERT query sesuai dengan total kolom di database
    const insertQuery = `
      INSERT INTO pages (
        title, slug, hero_title, hero_video_url, hero_image_url,
        homepage_about_section_text, homepage_services_section_text,
        vision_title, vision_body, mission_title, mission_body, excellence_title,
        gallery_intro_body, contact_overlay_text, contact_title, contact_phone,
        contact_location_title, contact_location_body, contact_email_title,
        contact_email_address, contact_whatsapp_number, main_intro_body,
        service_1_title, service_1_body, service_2_title, service_2_body,
        service_3_title, service_3_body, faq_main_title, body,
        faq_1_question, faq_1_answer, faq_2_question, faq_2_answer, faq_3_question, faq_3_answer,
        faq_4_question, faq_4_answer, faq_5_question, faq_5_answer, images,
        hero_video_source_type, hero_image_source_type, 
        homepage_bottom_image_1_url, homepage_bottom_image_2_url, homepage_bottom_image_3_url,
        excellence_image_1_url, excellence_image_2_url, excellence_image_3_url,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `; 

    const insertValues = [
      title, slug, hero_title, hero_video_url, hero_image_url,
      homepage_about_section_text, homepage_services_section_text,
      vision_title, vision_body, mission_title, mission_body, excellence_title,
      gallery_intro_body, contact_overlay_text, contact_title, contact_phone,
      contact_location_title, contact_location_body, contact_email_title,
      contact_email_address, contact_whatsapp_number, main_intro_body,
      service_1_title, service_1_body, service_2_title, service_2_body,
      service_3_title, service_3_body, faq_main_title, body,
      faq_1_question, faq_1_answer, faq_2_question, faq_2_answer, faq_3_question, faq_3_answer,
      faq_4_question, faq_4_answer, faq_5_question, faq_5_answer, images,
      hero_video_source_type, hero_image_source_type,
      homepage_bottom_image_1_url, homepage_bottom_image_2_url, homepage_bottom_image_3_url,
      excellence_image_1_url, excellence_image_2_url, excellence_image_3_url
    ];

    const result = await pool.query(insertQuery, insertValues);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating page:', err);
    if (err.code === '23505' && err.constraint === 'pages_slug_key') {
      return res.status(422).json({ message: 'Slug sudah digunakan.', errors: { slug: ['Slug ini sudah ada.'] });
    }
    res.status(500).json({ message: 'Gagal membuat halaman baru.' });
  }
});


// DELETE halaman
app.delete('/api/pages/:id', async (req, res) => {
  const { id } = req.params;
  const numericId = parseInt(id); 

  if (isNaN(numericId)) {
      return res.status(400).json({ message: 'ID halaman tidak valid.' });
  }

  try {
    const result = await pool.query('DELETE FROM pages WHERE id = $1 RETURNING *', [numericId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Halaman tidak ditemukan.' });
    }
    res.json({ message: 'Halaman berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleting page:', err);
    res.status(500).json({ message: 'Gagal menghapus halaman.' });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Backend API berjalan di http://localhost:${port}`);
});
```

Tentu, saya memahami Anda ingin menambahkan fungsionalitas manajemen gambar yang visual dan interaktif (menampilkan thumbnail, menghapus, memindahkan) ke halaman edit umum (`pages/admin/pages/[id]/edit.vue`) untuk halaman-halaman seperti Beranda, Tentang Kami, Layanan Kami, dan Kontak. Anda ingin ini serupa dengan yang sudah ada di halaman manajemen galeri (`/admin/gallery`).

### **Perbaikan pada `pages/admin/pages/[id]/edit.vue`:**

Saya akan menambahkan bagian manajemen gambar dengan input file, tombol unggah, pratinjau thumbnail, dan tombol hapus/pindah untuk gambar-gambar spesifik halaman ini. Bagian ini akan muncul di blok `v-if` yang relevan untuk setiap slug halaman (beranda, tentang, layanan).

**Penting Sebelum Memulai:**

* **Pastikan Anda telah menambahkan kolom-kolom baru di database Supabase Anda** seperti yang kita diskusikan:
    * `homepage_bottom_image_1_url`, `homepage_bottom_image_2_url`, `homepage_bottom_image_3_url`
    * `excellence_image_1_url`, `excellence_image_2_url`, `excellence_image_3_url`
    * `service_1_image_url`, `service_2_image_url`, `service_3_image_url` (pastikan ini sudah ada).
* **Pastikan `server.js` Anda sudah diperbarui** untuk menerima dan menyimpan kolom-kolom baru ini di rute `PUT` dan `POST`.

**Ganti seluruh isi file `D:\cvsumberalam\CVSUMBERALAM\pages\admin\pages\[id]\edit.vue` Anda dengan kode berikut:**


```vue
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
            <small class="form-text text-muted">Contoh: '/static/assets/beranda.mp4' (MP4), 'https://youtube.com/watch?v=ID' (YouTube), 'https://drive.google.com/file/d/ID/view' (Drive)</small>
            
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
                
                <input type="file" :ref="el => homepageBottomImageInputs[i-1] = el" @change="event => handleSpecificImageSelect(event, `homepage_bottom_image_${i}_url`)" class="form-control mt-2 mb-2" accept="image/*">
                <button type="button" @click="uploadSpecificImage(i-1, `homepage_bottom_image_${i}_url`)" class="btn btn-info btn-sm">Unggah Gambar {{ i }}</button>
                <button type="button" @click="removeSpecificImage(`homepage_bottom_image_${i}_url`)" class="btn btn-danger btn-sm ms-2">Hapus Gambar {{ i }}</button>
                <span v-if="specificImageUploading[i-1]" class="ms-2 text-muted">Mengunggah...</span>
                <p v-if="specificImageError[i-1]" class="text-danger mt-1">{{ specificImageError[i-1] }}</p>
                <p v-if="specificImageSuccessMessage[i-1]" class="text-success mt-1">{{ specificImageSuccessMessage[i-1] }}</p>

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
                
                <input type="file" :ref="el => excellenceImageInputs[i-1] = el" @change="event => handleSpecificImageSelect(event, `excellence_image_${i}_url`)" class="form-control mt-2 mb-2" accept="image/*">
                <button type="button" @click="uploadSpecificImage(i-1, `excellence_image_${i}_url`)" class="btn btn-info btn-sm">Unggah Gambar {{ i }}</button>
                <button type="button" @click="removeSpecificImage(`excellence_image_${i}_url`)" class="btn btn-danger btn-sm ms-2">Hapus Gambar {{ i }}</button>
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
                
                <input type="file" :ref="el => serviceImageInputs[i-1] = el" @change="event => handleSpecificImageSelect(event, `service_${i}_image_url`)" class="form-control mt-2 mb-2" accept="image/*">
                <button type="button" @click="uploadSpecificImage(6 + i-1, `service_${i}_image_url`)" class="btn btn-info btn-sm">Unggah Gambar {{ i }}</button>
                <button type="button" @click="removeSpecificImage(`service_${i}_image_url`)" class="btn btn-danger btn-sm ms-2">Hapus Gambar {{ i }}</button>
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

// Ref untuk input file gambar hero
const heroImageInput = ref(null); 
const uploadingHeroImage = ref(false);
const heroUploadError = ref(null);
const heroUploadSuccessMessage = ref(null);

// Ref dan state untuk gambar-gambar spesifik lainnya
const homepageBottomImageInputs = ref([]);
const excellenceImageInputs = ref([]);
const serviceImageInputs = ref([]);

const specificImageUploading = ref([]); // Array boolean untuk status upload
const specificImageError = ref([]);     // Array untuk pesan error
const specificImageSuccessMessage = ref([]); // Array untuk pesan sukses


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
    
    // Perbaikan: Parse images JSONB dari string jika perlu (untuk galeri)
    if (typeof page.value.images === 'string' && page.value.images.startsWith('[')) {
      try {
        page.value.images = JSON.parse(page.value.images);
      } catch (e) { 
        console.error("Failed to parse images JSON for edit form:", e); 
        page.value.images = []; 
      }
    } else if (!Array.isArray(page.value.images)) {
        page.value.images = []; 
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
    return 'static'; // Default to static for local/direct image files
};

// Fungsi helper untuk mendapatkan ID YouTube dari URL
const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/||watch\?v=|\&v=)([^#\&\?]*).*/;
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

/* Gaya untuk grid thumbnail galeri */
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
</style>
```

Tentu, saya memahami Anda ingin memodifikasi halaman edit umum (`pages/admin/pages/[id]/edit.vue`) agar halaman-halaman seperti Beranda, Tentang Kami, Layanan Kami, dan Kontak juga memiliki fungsionalitas untuk **mengunggah, melihat pratinjau, dan menghapus gambar** yang spesifik untuk halaman tersebut. Anda ingin ini serupa dengan tampilan galeri yang sudah ada.

### **Perbaikan pada `pages/admin/pages/[id]/edit.vue` (Manajemen Gambar untuk Halaman Lainnya)**

Saya akan menambahkan bagian manajemen gambar dengan input file, tombol unggah, pratinjau thumbnail, dan tombol hapus/pindah untuk gambar-gambar spesifik halaman ini. Bagian ini akan muncul di blok `v-if` yang relevan untuk setiap slug halaman (beranda, tentang, layanan, kontak).

**Penting Sebelum Memulai:**

* **Pastikan Anda telah menambahkan kolom-kolom baru di database Supabase Anda** seperti yang kita diskusikan:
    * `homepage_bottom_image_1_url`, `homepage_bottom_image_2_url`, `homepage_bottom_image_3_url`
    * `excellence_image_1_url`, `excellence_image_2_url`, `excellence_image_3_url`
    * `service_1_image_url`, `service_2_image_url`, `service_3_image_url` (ini sudah ada di `edit.vue` sebelumnya, jadi pastikan sudah ada di DB).
* **Pastikan `server.js` Anda sudah diperbarui** untuk menerima dan menyimpan kolom-kolom baru ini di rute `PUT` dan `POST`.

**Ganti seluruh isi file `D:\cvsumberalam\CVSUMBERALAM\pages\admin\pages\[id]\edit.vue` Anda dengan kode berikut:**


```vue
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
            <small class="form-text text-muted">Contoh: '/static/assets/beranda.mp4' (MP4), 'https://youtube.com/watch?v=ID' (YouTube), 'https://drive.google.com/file/d/ID/view' (Drive)</small>
            
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
          <!-- Bagian Galeri telah dipindahkan ke /admin/gallery -->
          <!-- Bagian ini sudah dihapus di sini karena ada halaman manajemen galeri terpisah -->

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
// Ref untuk input file untuk galeri dan hero
const galleryImageInput = ref(null); 
const heroImageInput = ref(null); 

// State untuk upload gambar (gabungan untuk semua upload spesifik)
const uploadingImage = ref(false); // Global status for any upload
const uploadError = ref(null); // Global error for any upload
const uploadSuccessMessage = ref(null); // Global success for any upload

// Ini adalah array ref untuk mereferensikan input file gambar bawah beranda, keunggulan, dan layanan
const homepageBottomImageInputs = ref([]);
const excellenceImageInputs = ref([]);
const serviceImageInputs = ref([]);

// Array untuk menyimpan status dan pesan spesifik per gambar
// Indeks: 0-2 untuk homepage_bottom, 3-5 untuk excellence, 6-8 untuk service images
const specificImageUploading = ref(Array(9).fill(false)); 
const specificImageError = ref(Array(9).fill(null));     
const specificImageSuccessMessage = ref(Array(9).fill(null)); 


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
    
    // Perbaikan: Parse images JSONB dari string jika perlu (untuk galeri)
    if (typeof page.value.images === 'string' && page.value.images.startsWith('[')) {
      try {
        page.value.images = JSON.parse(page.value.images);
      } catch (e) { 
        console.error("Failed to parse images JSON for edit form:", e); 
        page.value.images = []; 
      }
    } else if (!Array.isArray(page.value.images)) {
        page.value.images = []; 
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
// Ini akan digunakan oleh homepage_bottom_image_X_url, excellence_image_X_url, service_X_image_url
const specificImageFiles = ref(Array(9).fill(null)); // 0-2 homepage_bottom, 3-5 excellence, 6-8 service
function handleSpecificImageSelect(event, propName, index) {
    const file = event.target.files[0];
    if (file) {
        specificImageFiles.value[index] = file;
        specificImageError.value[index] = null;
        specificImageSuccessMessage.value[index] = null;
    }
}

async function uploadSpecificImage(inputRef, propName, index) {
    const file = specificImageFiles.value[index]; // Ambil file dari array ref lokal
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
            page.value[propName] = imageUrl; // Set URL gambar spesifik langsung
            specificImageSuccessMessage.value[index] = `Gambar berhasil diunggah! Klik Simpan Perubahan.`;
            // Reset input file setelah upload sukses
            if (inputRef && inputRef.value) { // Akses elemen DOM input
                inputRef.value.value = '';
            }
            specificImageFiles.value[index] = null; // Bersihkan file dari state lokal
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
        page.value[propName] = null; // Setel ke null atau string kosong
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

/* Gaya untuk grid thumbnail galeri */
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
</style>