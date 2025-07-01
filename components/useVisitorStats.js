// composables/useVisitorStats.js
import { ref, onMounted, onUnmounted } from 'vue';
import { useRuntimeConfig } from '#app'; // Kita perlu useRuntimeConfig untuk apiBase

export function useVisitorStats() {
  const totalVisitors = ref(0);
  const todayVisitors = ref(0);
  const onlineUsers = ref(0);
  const visitorStatsId = ref(null); // Untuk menyimpan ID baris statistik dari backend

  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBase;

  const fetchVisitorStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/visitor-stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      totalVisitors.value = data.totalVisitors || 0;
      todayVisitors.value = data.todayVisitors || 0;
      onlineUsers.value = data.onlineUsers || 0;
      visitorStatsId.value = data.id; // Simpan ID yang dikirim dari backend

    } catch (err) {
      console.error('Error fetching visitor stats from backend:', err.message);
      totalVisitors.value = 0;
      todayVisitors.value = 0;
      onlineUsers.value = 0;
    }
  };

  const updateStats = async (type) => {
    if (!visitorStatsId.value) {
      console.warn('Visitor stats ID not available, cannot update. Trying to fetch first...');
      await fetchVisitorStats(); // Coba ambil ID jika belum ada
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
        body: JSON.stringify({ type, visitorStatsId: visitorStatsId.value }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      totalVisitors.value = data.totalVisitors;
      todayVisitors.value = data.todayVisitors;
      onlineUsers.value = data.onlineUsers;

    } catch (err) {
      console.error('Error updating visitor stats via backend:', err.message);
    }
  };

  onMounted(async () => {
    await fetchVisitorStats(); // Ambil statistik awal
    await updateStats('increment_all'); // Beri tahu backend untuk menambah
  });

  onUnmounted(async () => {
    await updateStats('decrement_online'); // Beri tahu backend untuk mengurangi
  });

  return {
    totalVisitors,
    todayVisitors,
    onlineUsers
  };
}