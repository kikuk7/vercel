// composables/useVisitorStats.js
import { ref, onMounted, onUnmounted } from 'vue';
import { useRuntimeConfig } from '#app';
import { v4 as uuidv4 } from 'uuid'; // Pastikan Anda sudah menginstal uuid (npm install uuid)

export function useVisitorStats() {
    const totalVisitors = ref(0);
    const todayVisitors = ref(0);
    const onlineUsers = ref(0);
    const visitorStatsId = ref(null); // ID baris tunggal dari tabel visitor_stats
    let sessionId = null; // ID sesi unik untuk pengguna ini

    const config = useRuntimeConfig();
    const API_BASE_URL = config.public.apiBase;

    let heartbeatInterval = null;

    // Inisialisasi atau ambil session ID dari localStorage
    const getOrCreateSessionId = () => {
        if (typeof window !== 'undefined') {
            let id = localStorage.getItem('user_session_id');
            if (!id) {
                id = uuidv4();
                localStorage.setItem('user_session_id', id);
            }
            return id;
        }
        return null; // Untuk SSR atau jika window tidak tersedia
    };

    // Fungsi untuk mengambil data statistik utama dari backend
    const fetchVisitorStats = async () => {
        try {
            // Endpoint ini sekarang akan MENGHITUNG online_users dari tabel sesi
            const response = await fetch(`${API_BASE_URL}/api/visitor-stats`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            
            totalVisitors.value = data.totalVisitors || 0;
            todayVisitors.value = data.todayVisitors || 0;
            onlineUsers.value = data.onlineUsers || 0;
            visitorStatsId.value = data.id; // ID dari baris visitor_stats tunggal
        } catch (err) {
            console.error('Error fetching visitor stats from backend:', err.message);
            totalVisitors.value = 0;
            todayVisitors.value = 0;
            onlineUsers.value = 0;
        }
    };

    // Fungsi untuk mengirim sinyal heartbeat ke backend
    const sendHeartbeat = async () => {
        if (!sessionId) { // Pastikan session ID sudah ada
            sessionId = getOrCreateSessionId();
            if (!sessionId) return;
        }
        if (!visitorStatsId.value) { // Pastikan visitorStatsId juga sudah ada
            await fetchVisitorStats();
            if (!visitorStatsId.value) return;
        }

        const dataToSend = {
            sessionId: sessionId,
            visitorStatsId: visitorStatsId.value,
            // Opsional: ip_address dan user_agent bisa dikirim dari sini jika diperlukan
            // ipAddress: '...get from req in backend...',
            // userAgent: navigator.userAgent
        };

        try {
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(dataToSend)], {type : 'application/json'});
                navigator.sendBeacon(`${API_BASE_URL}/api/visitor-stats/heartbeat`, blob);
            } else {
                await fetch(`${API_BASE_URL}/api/visitor-stats/heartbeat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSend),
                    keepalive: true
                });
            }
            // console.log('Heartbeat sent for session:', sessionId); // Debugging
        } catch (err) {
            console.error('Error sending heartbeat:', err.message);
        }
    };

    // Fungsi untuk penambahan total_visitors dan today_visitors pada load awal
    const updateStatsOnInitialLoad = async () => {
        if (!visitorStatsId.value) {
            await fetchVisitorStats(); // Dapatkan visitorStatsId
            if (!visitorStatsId.value) return;
        }
        try {
            // Ini hanya untuk menambah total dan today. online_users akan dihitung dari tabel sesi.
            const response = await fetch(`${API_BASE_URL}/api/visitor-stats/increment-counts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorStatsId: visitorStatsId.value }),
                keepalive: true
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            totalVisitors.value = data.totalVisitors;
            todayVisitors.value = data.todayVisitors;
            // onlineUsers.value akan diperbarui oleh fetchVisitorStats yang memanggil /api/visitor-stats
        } catch (err) {
            console.error('Error updating visitor counts on initial load:', err.message);
        }
    };

    onMounted(async () => {
        sessionId = getOrCreateSessionId(); // Inisialisasi session ID
        await fetchVisitorStats(); // Ambil statistik awal (termasuk onlineUsers terbaru)
        await updateStatsOnInitialLoad(); // Tingkatkan total/today visitor
        
        // Kirim heartbeat pertama kali
        sendHeartbeat();
        // Mulai kirim heartbeat setiap 1 menit (sesuaikan interval ini!)
        heartbeatInterval = setInterval(sendHeartbeat, 60 * 1000); // 1 menit
    });

    onUnmounted(() => {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
        }
        // Kirim heartbeat terakhir saat meninggalkan halaman
        sendHeartbeat();
    });

    return {
        totalVisitors,
        todayVisitors,
        onlineUsers
    };
}