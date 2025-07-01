// composables/useVisitorStats.js
import { ref, onMounted, onUnmounted } from 'vue';
import { useRuntimeConfig } from '#app';

export function useVisitorStats() {
  const totalVisitors = ref(0);
  const todayVisitors = ref(0);
  const onlineUsers = ref(0);
  const visitorStatsId = ref(null); // ID unik baris statistik dari backend

  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBase; // URL base backend dari nuxt.config.ts

  // Fungsi untuk mengambil data statistik dari backend
  const fetchVisitorStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/visitor-stats`); // Panggil endpoint backend
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      totalVisitors.value = data.totalVisitors || 0;
      todayVisitors.value = data.todayVisitors || 0;
      onlineUsers.value = data.onlineUsers || 0;
      visitorStatsId.value = data.id; // Simpan ID baris statistik
    } catch (err) {
      console.error('Error fetching visitor stats from backend:', err.message);
      totalVisitors.value = 0;
      todayVisitors.value = 0;
      onlineUsers.value = 0;
    }
  };

  // Fungsi untuk memperbarui statistik melalui backend
  const updateStats = async (type) => {
    // Jika ID statistik belum ada, coba ambil dulu.
    // Ini penting jika 'increment_all' dipanggil sebelum fetchVisitorStats selesai.
    if (!visitorStatsId.value) {
      console.warn('Visitor stats ID not available, trying to fetch first...');
      await fetchVisitorStats();
      if (!visitorStatsId.value) {
        console.error('Could not get visitor stats ID, update failed.');
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/visitor-stats/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Kirim tipe update dan ID baris statistik ke backend
        body: JSON.stringify({ type, visitorStatsId: visitorStatsId.value }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // Perbarui nilai lokal dengan data terbaru dari backend
      totalVisitors.value = data.totalVisitors;
      todayVisitors.value = data.todayVisitors;
      onlineUsers.value = data.onlineUsers;

    } catch (err) {
      console.error('Error updating visitor stats via backend:', err.message);
    }
  };

  // Lifecycle hook: Saat komponen yang menggunakan composable ini dimuat
  onMounted(async () => {
    await fetchVisitorStats(); // Ambil statistik awal
    await updateStats('increment_all'); // Beri tahu backend untuk menambah total, today, dan online
  });

  // Lifecycle hook: Saat komponen tidak lagi dimuat (pengguna meninggalkan halaman/menutup tab)
  onUnmounted(async () => {
    await updateStats('decrement_online'); // Beri tahu backend untuk mengurangi online users
  });

  // Mengembalikan ref agar bisa diakses di komponen Vue
  return {
    totalVisitors,
    todayVisitors,
    onlineUsers
  };
}