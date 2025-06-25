import '@google/model-viewer';
// plugins/model-viewer.client.js
import { defineNuxtPlugin } from '#app';
import '@google/model-viewer'; // Impor model-viewer di sini

export default defineNuxtPlugin(() => {
  // Anda bisa menambahkan logika inisialisasi tambahan di sini jika diperlukan,
  // tetapi untuk sekadar mendaftarkan web component, impor di atas sudah cukup.
});