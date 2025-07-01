// composables/useVisitorStats.js
import { ref, onMounted, onUnmounted } from 'vue';
import { useRuntimeConfig } from '#app';

export function useVisitorStats() {
    const totalVisitors = ref(0);
    const todayVisitors = ref(0);
    const onlineUsers = ref(0);
    const visitorStatsId = ref(null);

    const config = useRuntimeConfig();
    const API_BASE_URL = config.public.apiBase;

    let heartbeatInterval = null; // Untuk menyimpan ID interval heartbeat

    const fetchVisitorStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/visitor-stats`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            
            totalVisitors.value = data.totalVisitors || 0;
            todayVisitors.value = data.todayVisitors || 0;
            onlineUsers.value = data.onlineUsers || 0;
            visitorStatsId.value = data.id;
        } catch (err) {
            console.error('Error fetching visitor stats from backend:', err.message);
            totalVisitors.value = 0;
            todayVisitors.value = 0;
            onlineUsers.value = 0;
        }
    };

    // Fungsi untuk mengirim sinyal heartbeat ke backend
    const sendHeartbeat = async () => {
        // Coba ambil ID jika belum ada, terutama untuk heartbeat awal
        if (!visitorStatsId.value) {
            await fetchVisitorStats();
            if (!visitorStatsId.value) {
                console.warn('Visitor stats ID not available for heartbeat. Skipping.');
                return;
            }
        }

        try {
            // Menggunakan sendBeacon untuk keandalan lebih baik saat user akan meninggalkan halaman
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify({ visitorStatsId: visitorStatsId.value })], {type : 'application/json'});
                navigator.sendBeacon(`${API_BASE_URL}/api/visitor-stats/heartbeat`, blob);
            } else {
                // Fallback untuk fetch jika sendBeacon tidak tersedia
                await fetch(`${API_BASE_URL}/api/visitor-stats/heartbeat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ visitorStatsId: visitorStatsId.value }),
                    keepalive: true // Penting untuk memastikan request terkirim saat tab ditutup
                });
            }
            // console.log('Heartbeat sent.'); // Debugging: aktifkan jika perlu
        } catch (err) {
            console.error('Error sending heartbeat:', err.message);
        }
    };

    // Fungsi updateStats yang lama akan disederhanakan/dihapus karena heartbeat akan menangani onlineUsers
    // Namun, kita tetap butuh untuk increment total/today saat kunjungan pertama.
    const updateStatsOnInitialLoad = async () => {
        if (!visitorStatsId.value) {
            await fetchVisitorStats();
            if (!visitorStatsId.value) {
                console.error('Could not get visitor stats ID for initial load, update failed.');
                return;
            }
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/visitor-stats/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'increment_all', visitorStatsId: visitorStatsId.value }),
                keepalive: true // Agar request awal terkirim
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            totalVisitors.value = data.totalVisitors;
            todayVisitors.value = data.todayVisitors;
            onlineUsers.value = data.onlineUsers;
        } catch (err) {
            console.error('Error updating visitor stats on initial load:', err.message);
        }
    };


    onMounted(async () => {
        await fetchVisitorStats(); // Ambil statistik awal & ID
        await updateStatsOnInitialLoad(); // Increment total/today/online pada kunjungan awal

        // Mulai kirim heartbeat setiap 1 menit (sesuaikan interval ini!)
        // Lebih cepat dari timeout backend, misalnya timeout 3 menit, heartbeat 1 menit.
        heartbeatInterval = setInterval(sendHeartbeat, 60 * 1000); // 1 menit
    });

    onUnmounted(() => {
        // Hapus interval heartbeat saat komponen tidak lagi aktif
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
        }
        // Kirim heartbeat terakhir saat meninggalkan halaman untuk memperbarui timestamp online
        sendHeartbeat(); // Mengirim signal terakhir
    });

    return {
        totalVisitors,
        todayVisitors,
        onlineUsers
    };
}