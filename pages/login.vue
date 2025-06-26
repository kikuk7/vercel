<template>
  <div class="login-container">
    <h2 class="login-title">Admin Login</h2>
    <form @submit.prevent="login" class="login-form">
      <input type="text" v-model="username" placeholder="Username" required class="login-input" />
      <input type="password" v-model="password" placeholder="Password" required class="login-input" />
      <button type="submit" class="login-button">Login</button>
    </form>
    <p v-if="error" class="login-error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRuntimeConfig } from '#app'; // Impor useRuntimeConfig

definePageMeta({
  layout: 'guest', // Menggunakan layout guest tanpa header/footer
  middleware: ['redirect-if-authenticated'] // Redirect jika sudah login
});

const username = ref('');
const password = ref('');
const error = ref(null);
const router = useRouter();

// Ambil runtime config, meskipun belum digunakan untuk login hardcode
const config = useRuntimeConfig();
const API_BASE_URL = config.public.apiBase; // Akses properti 'public.apiBase'

async function login() {
  error.value = null;
  // Kredensial hardcode untuk demo
  if (username.value === 'admin' && password.value === 'password') {
    if (process.client) {
      localStorage.setItem('admin_logged_in', 'true');
    }
    router.push('/admin/dashboard');
  } else {
    error.value = 'Username atau password salah.';
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
  font-size: 1.8em;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  transition: border-color 0.2s ease;
}

.login-input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.login-button {
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.login-button:hover {
  background-color: #0056b3;
}

.login-error {
  color: red;
  text-align: center;
  margin-top: 20px;
  font-size: 0.9em;
}
</style>
