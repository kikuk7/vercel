// middleware/auth-admin.js
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) { // Pastikan ini hanya berjalan di sisi klien
    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';

    // Jika rute yang dituju adalah halaman admin (diawali /admin) dan pengguna belum login
    if (to.path.startsWith('/admin') && to.path !== '/login' && !isLoggedIn) {
      return navigateTo('/login'); // Arahkan kembali ke halaman login
    }
  }
});