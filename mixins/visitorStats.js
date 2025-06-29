// ~/mixins/visitorStats.js

const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080/api'; // Menggunakan runtimeConfig
const STATS_API_ENDPOINT = `${API_BASE_URL}/visitor-stats`; // Contoh endpoint baru untuk stats jika ada

export default {
  data() {
    return {
      onlineUsers: 0,
      todayVisitors: 0,
      totalVisitors: 0,
      intervalId: null
    };
  },
  methods: {
    async updateStats() {
      // PENTING: Implementasi ini adalah placeholder.
      // Anda perlu membuat endpoint API backend nyata (/api/visitor-stats)
      // yang mengambil data dari tabel visitor_stats di PostgreSQL.

      try {
        // Contoh: Mengambil data dari backend API Anda (JIKA ANDA MEMILIKI ENDPOINT INI)
        // const response = await fetch(STATS_API_ENDPOINT);
        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const data = await response.json();
        // this.onlineUsers = data.onlineUsers;
        // this.todayVisitors = data.todayVisitors;
        // this.totalVisitors = data.totalVisitors;

        // UNTUK SAAT INI, KITA HANYA MENGHAPUS LOGIKA JSONBIN DAN MENGISI DENGAN NILAI DEFAULT
        // ATAU MENGGUNAKAN LOGIKA YANG LEBIH SEDERHANA UNTUK MENCEGAH ERROR.
        
        // Logika sementara atau nilai placeholder untuk mencegah error
        this.onlineUsers = Math.floor(Math.random() * 5) + 1; // Contoh: 1-5 pengguna online
        this.todayVisitors = Math.floor(Math.random() * 50) + 10; // Contoh: 10-60 pengunjung hari ini
        this.totalVisitors = Math.floor(Math.random() * 500) + 100; // Contoh: 100-600 total pengunjung

        // Jika Anda ingin statistik yang PERSISTEN, Anda harus membuat API backend baru
        // dan tabel `visitor_stats` di PostgreSQL untuk mengelolanya.
        // Bagian JSONbin di sini telah dihapus.
      } catch (error) {
        console.error("Error updating visitor stats:", error);
        // Fallback nilai jika gagal mengambil stats
        this.onlineUsers = 'N/A';
        this.todayVisitors = 'N/A';
        this.totalVisitors = 'N/A';
      }
    }
  },
  mounted() {
    // Panggil updateStats saat komponen dimuat
    this.updateStats(); 
    // Set up interval untuk update stats secara berkala
    this.intervalId = setInterval(this.updateStats, 30000); // Setiap 30 detik
  },
  beforeDestroy() {
    // Bersihkan interval saat komponen dihancurkan
    clearInterval(this.intervalId); 
  }
}

app.get('/api/visitor-stats', async (req, res) => {
    try {
        const onlineUsersResult = await pool.query("SELECT COUNT(DISTINCT ip_address) FROM visitors WHERE last_active > NOW() - INTERVAL '5 minutes'");
        const todayVisitorsResult = await pool.query("SELECT COUNT(DISTINCT ip_address) FROM visitors WHERE visit_date = CURRENT_DATE");
        const totalVisitorsResult = await pool.query("SELECT COUNT(DISTINCT ip_address) FROM visitors");

        console.log('Online Users Result:', onlineUsersResult.rows); // Tambahkan ini
        console.log('Today Visitors Result:', todayVisitorsResult.rows); // Tambahkan ini
        console.log('Total Visitors Result:', totalVisitorsResult.rows); // Tambahkan ini

        const online = parseInt(onlineUsersResult.rows[0].count) || 0;
        const today = parseInt(todayVisitorsResult.rows[0].count) || 0;
        const total = parseInt(totalVisitorsResult.rows[0].count) || 0;

        res.json({
            onlineUsers: online,
            todayVisitors: today,
            totalVisitors: total
        });
    } catch (err) {
        console.error('Kesalahan saat mengambil statistik pengunjung:', err);
        res.status(500).json({ message: 'Gagal mengambil statistik pengunjung.' });
    }
});