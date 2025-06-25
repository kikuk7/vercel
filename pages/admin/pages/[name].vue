<template>
  <div v-if="page">
    <h2>Edit Halaman: {{ page.name }}</h2>
    <textarea v-model="page.content" rows="15" cols="80"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;"></textarea><br>
    <button @click="updatePage" style="padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Simpan Perubahan</button>
    <NuxtLink to="/admin/pages" style="padding: 10px 15px; background-color: #6c757d; color: white; text-decoration: none; border-radius: 4px;">Kembali</NuxtLink>
    <p v-if="message" :style="{ color: message.includes('berhasil') ? 'green' : 'red', marginTop: '15px' }">{{ message }}</p>
  </div>
  <div v-else-if="loading">
    <p>Memuat halaman...</p>
  </div>
  <div v-else>
    <p>Halaman tidak ditemukan atau terjadi kesalahan.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
const config = useRuntimeConfig();

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin',
});

const route = useRoute();
const page = ref(null);
const loading = ref(true);
const message = ref(null);

// Fungsi untuk memuat data halaman
async function fetchPage() {
  loading.value = true;
  message.value = null;
  try {
    const pageName = route.params.name;
    page.value = await $fetch(`<span class="math-inline">\{config\.public\.apiBase\}/pages/</span>{pageName}`);
  } catch (e) {
    console.error('Fetch page error:', e);
    message.value = 'Gagal memuat halaman: ' + e.message;
  } finally {
    loading.value = false;
  }
}

// Memuat halaman saat komponen di mount
onMounted(fetchPage);

// Fungsi untuk mengupdate halaman
async function updatePage() {
  message.value = null;
  try {
    await $fetch(`<span class="math-inline">\{config\.public\.apiBase\}/pages/</span>{page.value.name}`, {
      method: 'PUT',
      body: { content: page.value.content }
    });
    message.value = 'Halaman berhasil diperbarui!';
  } catch (e) {
    message.value = 'Gagal memperbarui halaman: ' + e.message;
    console.error('Update page error:', e);
  }
}
</script>