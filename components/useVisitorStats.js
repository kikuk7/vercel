import { ref, onMounted, onUnmounted } from 'vue';

export function useVisitorStats() {
  const totalVisitors = ref(0);
  const todayVisitors = ref(0);
  const onlineUsers = ref(0);

  const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY;
  const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
  const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
  const todayKey = 'visited-' + new Date().toISOString().slice(0, 10);

  let visitorId = null;
  let intervalId = null;

  async function updateStats() {
    if (!visitorId) {
      visitorId = sessionStorage.getItem('visitor-id');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        sessionStorage.setItem('visitor-id', visitorId);
      }
    }

    try {
      const res = await fetch(API_URL, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const json = await res.json();
      const stats = json.record || {
        total_visits: 0,
        today_visits: 0,
        visitors: []
      };

      const now = new Date();
      const nowISO = now.toISOString();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

      if (!localStorage.getItem(todayKey)) {
        stats.total_visits += 1;
        stats.today_visits += 1;
        localStorage.setItem(todayKey, 'true');
      }

      stats.visitors = stats.visitors.filter(v => v.timestamp > fiveMinutesAgo);
      const existing = stats.visitors.find(v => v.id === visitorId);
      if (existing) {
        existing.timestamp = nowISO;
      } else {
        stats.visitors.push({ id: visitorId, timestamp: nowISO });
      }

      totalVisitors.value = stats.total_visits;
      todayVisitors.value = stats.today_visits;
      onlineUsers.value = stats.visitors.length;

      await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'X-Master-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stats)
      });

    } catch (error) {
      console.error('Gagal update statistik:', error);
    }
  }

  onMounted(() => {
    updateStats();
    intervalId = setInterval(updateStats, 30000); // Refresh tiap 30 detik
  });

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
  });

  return {
    totalVisitors,
    todayVisitors,
    onlineUsers
  };
}
