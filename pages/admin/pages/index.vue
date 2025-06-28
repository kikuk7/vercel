<template>
  <div class="py-3">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Manajemen Halaman Website</h1>
      <NuxtLink to="/admin/pages/create" class="btn btn-primary"><i class="fas fa-plus me-2"></i> Tambah Halaman Baru</NuxtLink>
    </div>

    <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

    <div class="card shadow-sm">
      <div class="card-header bg-dark text-white">
        Daftar Halaman
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Judul Halaman</th>
                <th>URL (Slug)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pages.length === 0 && !loading">
                <td colspan="4" class="text-center text-muted">
                  <p class="mt-3">Belum ada halaman yang terdaftar di database.</p>
                  <p>Anda bisa menambahkannya dengan tombol "Tambah Halaman Baru".</p>
                </td>
              </tr>
              <tr v-if="loading">
                  <td colspan="4" class="text-center text-muted">Memuat halaman...</td>
              </tr>
              <tr v-for="(page, index) in pages" :key="page.id">
                <td>{{ index + 1 }}</td>
                <td>{{ page.title }}</td>
                <td>/{{ page.slug }}</td>
                <td>
                  <NuxtLink :to="`/admin/pages/${page.id}/edit`" class="btn btn-info btn-sm me-2">Edit</NuxtLink>
                  <button @click="deletePageConfirm(page.id)" class="btn btn-danger btn-sm">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Impor useRoute dan useRouter

definePageMeta({
  layout: 'admin',
  middleware: ['auth-admin'],
  title: 'Manajemen Halaman'
});

const pages = ref([]);
const successMessage = ref(null);
const errorMessage = ref(null);
const loading = ref(true); // Tambahkan state loading
const route = useRoute(); // Inisialisasi useRoute
const router = useRouter(); // Inisialisasi useRouter

// Fetch all pages
async function fetchPages() {
  loading.value = true; // Set loading true saat memulai fetch
  try {
    const response = await fetch('/api/pages');
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil daftar halaman.');
    }
    pages.value = await response.json();
  } catch (e) {
    errorMessage.value = e.message;
    console.error('Error fetching pages:', e);
  } finally {
    loading.value = false; // Set loading false setelah selesai (baik sukses/gagal)
  }
}

// Delete a page with confirmation
async function deletePageConfirm(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus halaman ini? Kontennya akan hilang dari website!')) {
    return;
  }
  try {
    const response = await fetch(`/api/pages/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal menghapus halaman.');
    }
    successMessage.value = 'Halaman berhasil dihapus!';
    await fetchPages(); // Refresh the list
    setTimeout(() => successMessage.value = null, 3000);
  } catch (e) {
    errorMessage.value = e.message;
    console.error('Error deleting page:', e);
    setTimeout(() => errorMessage.value = null, 3000);
  }
}

onMounted(async () => {
  await fetchPages();
  // Tangani pesan dari query parameter (setelah redirect dari create/edit)
  if (route.query.success) {
    successMessage.value = route.query.success;
    setTimeout(() => successMessage.value = null, 3000);
    // Hapus query parameter agar tidak muncul lagi saat refresh
    router.replace({ query: { ...route.query, success: undefined } });
  }
  if (route.query.error) {
    errorMessage.value = route.query.error;
    setTimeout(() => errorMessage.value = null, 3000);
    router.replace({ query: { ...route.query, error: undefined } });
  }
});
</script>

<style scoped>
/* Gaya yang meniru Bootstrap untuk daftar halaman */
.py-3 { padding-top: 1rem; padding-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.me-2 { margin-right: 0.5rem; }
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }

.btn-primary { background-color: #0d6efd; border-color: #0d6efd; color: white; }
.btn-info { background-color: #0dcaf0; border-color: #0dcaf0; color: white; }
.btn-danger { background-color: #dc3545; border-color: #dc3545; color: white; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; border-radius: 0.2rem; }

.alert { padding: 1rem 1rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: 0.25rem; }
.alert-success { color: #0f5132; background-color: #d1e7dd; border-color: #badbcc; }
.alert-danger { color: #842029; background-color: #f8d7da; border-color: #f5c2c7; }

.card { position: relative; display: flex; flex-direction: column; min-width: 0; word-wrap: break-word; background-color: #fff; background-clip: border-box; border: 1px solid rgba(0,0,0,.125); border-radius: 0.25rem; box-shadow: 0 .125rem .25rem rgba(0,0,0,.075); }
.card-header { padding: 0.5rem 1rem; margin-bottom: 0; background-color: rgba(0,0,0,.03); border-bottom: 1px solid rgba(0,0,0,.125); }
.card-body { flex: 1 1 auto; padding: 1rem 1rem; }
.bg-dark { background-color: #212529 !important; }
.text-white { color: #fff !important; }

.table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.table { width: 100%; margin-bottom: 1rem; color: #212529; vertical-align: top; border-color: #dee2e6; }
.table > :not(caption)>*>* { padding: 0.5rem 0.5rem; background-color: var(--bs-table-bg); border-bottom-width: 1px; box-shadow: inset 0 0 0 9999px var(--bs-table-accent-bg); }
.table-striped > tbody > tr:nth-of-type(odd) > * { --bs-table-accent-bg: #f2f2f2; }
.table-hover > tbody > tr:hover > * { --bs-table-accent-bg: rgba(0,0,0,.075); }
.text-center { text-align: center !important; }
.text-muted { color: #6c757d !important; }
</style>