// middleware/redirect-if-authenticated.js
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) { // Pastikan ini hanya berjalan di sisi klien
    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    if (isLoggedIn && to.path === '/login') {
      return navigateTo('/admin/dashboard'); // Arahkan ke dashboard jika sudah login dan mencoba ke halaman login
    }
  }
});