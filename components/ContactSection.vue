<template>
  <section class="contact-section">
    <div class="container contact-grid">
      <div class="kontak-info">
        <h3>Kontak</h3>
        <p class="contact-item">
          <img src="/static/assets/icon/email 1.png" alt="Email" class="contact-icon">
          {{ page.contact_email_address }}
        </p>
        <p class="contact-item">
          <img src="/static/assets/icon/telepon.png" alt="Telepon" class="contact-icon">
          {{ page.contact_phone }}
        </p>
        <p class="contact-item">
          <img src="/static/assets/icon/WA.png" alt="WhatsApp" class="contact-icon">
          {{ page.contact_whatsapp_number }}
        </p>
      </div>

      <div class="lokasi-info">
        <h3>{{ page.contact_location_title }}</h3>
        <p>{{ page.contact_location_body }}</p>
        <a v-if="page.contact_whatsapp_number && page.contact_whatsapp_number !== 'Error Memuat'"
           :href="`https://wa.me/${page.contact_whatsapp_number}`"
           :class="['btn-primary', 'contact-section-btn', { 'hidden-on-specific-pages': shouldHideButton }]">
          <img src="/static/assets/icon/WA.png" alt="WA Icon" class="btn-icon-img"> hubungi kami
        </a>
      </div>

      <div class="pengunjung-info">
        <h3>Pengunjung</h3>
        <p class="visitor-item">
          <img src="/static/assets/icon/person.png" alt="Online" class="visitor-icon">
          Pengguna Online: <span>{{ onlineUsers }}</span>
        </p>
        <p class="visitor-item">
          <img src="/static/assets/icon/person.png" alt="Today" class="visitor-icon">
          Pengunjung Hari Ini: <span>{{ todayVisitors }}</span>
        </p>
        <p class="visitor-item">
          <img src="/static/assets/icon/person.png" alt="Total" class="visitor-icon">
          Total Pengunjung: <span>{{ totalVisitors }}</span>
        </p>
      </div>
    </div>

    <div class="map">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18..."
        width="100%" height="250" style="border:0; border-radius: 12px;" allowfullscreen="" loading="lazy">
      </iframe>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRuntimeConfig } from '#app'
import { createClient } from '@supabase/supabase-js'

// === Konfigurasi Supabase ===
const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)

// === Variabel Statistik ===
const totalVisitors = ref(0)
const todayVisitors = ref(0)
const onlineUsers = ref(0)

// === Route & Data Halaman ===
const route = useRoute()
const API_BASE_URL = config.public.apiBase

const page = ref({
  contact_email_address: 'Memuat...',
  contact_phone: 'Memuat...',
  contact_whatsapp_number: 'Memuat...',
  contact_location_title: 'Memuat...',
  contact_location_body: 'Memuat...'
})

const shouldHideButton = computed(() => {
  return ['/produk', '/kontak'].includes(route.path)
})

// === Fungsi Statistik Pengunjung ===
async function updateVisitorStatsSupabase() {
  try {
    const now = new Date()
    const nowISO = now.toISOString()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    const todayDate = now.toISOString().split('T')[0]

    const visitorId = sessionStorage.getItem('visitor-id') || crypto.randomUUID()
    sessionStorage.setItem('visitor-id', visitorId)

    // Catat kunjungan
    await supabase.from('visitor_stats').insert({
      id: visitorId,
      visited_at: nowISO,
      user_agent: navigator.userAgent
    })

    // Total visitors
    const { count: total } = await supabase
      .from('visitor_stats')
      .select('id', { count: 'exact', head: true })

    totalVisitors.value = total || 0

    // Hari ini
    const { count: today } = await supabase
      .from('visitor_stats')
      .select('id', { count: 'exact', head: true })
      .gte('visited_at', `${todayDate}T00:00:00Z`)

    todayVisitors.value = today || 0

    // Online (aktif 5 menit terakhir)
    const { count: online } = await supabase
      .from('visitor_stats')
      .select('id', { count: 'exact', head: true })
      .gte('visited_at', fiveMinutesAgo)

    onlineUsers.value = online || 0
  } catch (error) {
    console.error('❌ Gagal memuat statistik pengunjung:', error)
  }
}

// === Data Halaman Kontak ===
async function fetchContactPageData() {
  try {
    const response = await fetch(`${API_BASE_URL}/pages/kontak`)
    if (!response.ok) throw new Error('HTTP error ' + response.status)
    page.value = await response.json()
  } catch (error) {
    console.error('Gagal mengambil data halaman kontak:', error)
    page.value.contact_email_address = 'Error Memuat'
    page.value.contact_phone = 'Error Memuat'
    page.value.contact_whatsapp_number = ''
    page.value.contact_location_title = 'Error Memuat'
    page.value.contact_location_body = 'Error Memuat'
  }
}

// === Lifecycle ===
onMounted(() => {
  fetchContactPageData()
  updateVisitorStatsSupabase()
  setInterval(updateVisitorStatsSupabase, 30000)
})
</script>

<style scoped>
.hidden-on-specific-pages {
  display: none !important;
}
</style>
