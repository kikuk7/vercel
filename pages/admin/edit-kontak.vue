<template>
  <div style="max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: white;">
    <h2 style="text-align: center; color: #333;">Edit Kontak</h2>
    <form @submit.prevent="saveContact" style="display: flex; flex-direction: column; gap: 15px;">
      <label>
        Hero Overlay Text:
        <input type="text" v-model="form.heroOverlayText" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; width: 100%;" />
      </label>
      <label>
        Telepon:
        <input type="text" v-model="form.phone" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; width: 100%;" />
      </label>
      <label>
        Alamat:
        <textarea v-model="form.address" rows="3" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; width: 100%;"></textarea>
      </label>
      <label>
        Email:
        <input type="email" v-model="form.email" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; width: 100%;" />
      </label>
      <label>
        Link WhatsApp:
        <input type="url" v-model="form.whatsappLink" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; width: 100%;" />
      </label>
      <button type="submit" style="padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Simpan Perubahan</button>
    </form>
    <p v-if="message" style="color: green; text-align: center; margin-top: 15px;">{{ message }}</p>
    <p v-if="error" style="color: red; text-align: center; margin-top: 15px;">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: 'admin', // Pastikan menggunakan layout admin
  middleware: ['auth-admin'] // Lindungi halaman ini
});

const form = ref({
  heroOverlayText: '',
  phone: '',
  address: '',
  email: '',
  whatsappLink: ''
});
const message = ref(null);
const error = ref(null);

onMounted(async () => {
  await fetchContactData();
});

async function fetchContactData() {
  try {
    const response = await fetch('/api/kontak');
    if (!response.ok) throw new Error('Gagal mengambil data kontak');
    const data = await response.json();
    form.value = {
      heroOverlayText: data.heroOverlayText,
      phone: data.contactInfo.phone,
      address: data.contactInfo.address,
      email: data.contactInfo.email,
      whatsappLink: data.contactInfo.whatsappLink
    };
  } catch (e) {
    error.value = e.message;
    console.error('Error fetching contact data:', e);
  }
}

async function saveContact() {
  message.value = null;
  error.value = null;
  try {
    const response = await fetch('/api/kontak', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        heroOverlayText: form.value.heroOverlayText,
        contactInfo: {
          phone: form.value.phone,
          address: form.value.address,
          email: form.value.email,
          whatsappLink: form.value.whatsappLink
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal menyimpan perubahan');
    }

    const result = await response.json();
    message.value = result.message;
  } catch (e) {
    error.value = e.message;
    console.error('Error saving contact data:', e);
  }
}
</script>