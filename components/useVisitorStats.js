// composables/useVisitorStats.js
import { ref, onMounted, onUnmounted } from 'vue';
import { useNuxtApp } from '#app'; // Menggunakan useNuxtApp untuk mengakses plugin

export function useVisitorStats() {
  // Ref reaktif untuk menyimpan data statistik
  const totalVisitors = ref(0);
  const todayVisitors = ref(0);
  const onlineUsers = ref(0);

  // Variabel untuk menyimpan fungsi unsubscribe dari real-time listener Supabase
  let unsubscribe = null;

  // Fungsi untuk mengambil data statistik pengunjung dari Supabase
  const fetchVisitorStats = async () => {
    const { $supabase } = useNuxtApp(); // Mengakses instance Supabase dari plugin
    if (!$supabase) {
      console.error('Supabase client not available in useVisitorStats.');
      return;
    }

    try {
      // Mengambil data statistik terbaru dari tabel 'visitor_stats'
      // Asumsi: Anda memiliki satu baris data untuk statistik global atau mengambil yang terbaru
      const { data, error } = await $supabase
        .from('visitor_stats') // Ganti dengan nama tabel Supabase Anda (misal: 'website_stats')
        .select('total_visitors, today_visitors, online_users, id') // Sertakan 'id' untuk update
        .order('last_updated', { ascending: false }) // Ambil baris yang paling baru diperbarui
        .limit(1)
        .single(); // Digunakan jika Anda mengharapkan hanya satu baris

      // Penanganan error jika data tidak ditemukan (PGRST116) atau error lainnya
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Memperbarui ref dengan data yang diambil
        totalVisitors.value = data.total_visitors || 0;
        todayVisitors.value = data.today_visitors || 0;
        onlineUsers.value = data.online_users || 0;
        // Simpan ID baris untuk update nanti (penting jika Anda punya ID tunggal)
        // Atau Anda bisa update berdasarkan tanggal jika Anda membuat entri harian
        visitorStatsId.value = data.id;
      } else {
        // Jika belum ada data statistik, inisialisasi data baru
        console.log('No visitor stats found, initializing...');
        await initializeVisitorStats($supabase);
        // Setelah diinisialisasi, coba ambil lagi data yang baru dibuat
        await fetchVisitorStats();
      }

    } catch (err) {
      console.error('Error fetching visitor stats:', err.message);
      // Mengatur nilai default jika terjadi error
      totalVisitors.value = 0;
      todayVisitors.value = 0;
      onlineUsers.value = 0;
    }
  };

  // ID baris statistik (jika Anda memiliki satu baris untuk statistik global)
  const visitorStatsId = ref(null);

  // Fungsi untuk menginisialisasi baris data statistik jika belum ada
  const initializeVisitorStats = async ($supabase) => {
    try {
      const { data, error } = await $supabase
        .from('visitor_stats')
        .insert({
          date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
          total_visitors: 0,
          today_visitors: 0,
          online_users: 0,
          last_updated: new Date().toISOString()
        })
        .select('id') // Ambil ID dari baris yang baru dibuat
        .single();

      if (error) throw error;
      console.log('Visitor stats initialized successfully.', data);
      visitorStatsId.value = data.id; // Simpan ID baris yang baru dibuat
    } catch (err) {
      console.error('Error initializing visitor stats:', err.message);
    }
  };

  // Fungsi untuk memperbarui statistik (misalnya saat pengguna masuk/keluar atau halaman dimuat)
  // CATATAN PENTING: Untuk aplikasi produksi, fungsi update ini SEBAIKNYA dilakukan di
  // Supabase Edge Function atau API backend Anda sendiri untuk alasan keamanan
  // agar kunci API Supabase tidak langsung diekspos untuk operasi tulis dari sisi klien.
  const updateStats = async ($supabase, type) => {
    if (!visitorStatsId.value) {
      console.warn('Visitor stats ID not available for update. Trying to fetch first.');
      await fetchVisitorStats(); // Coba ambil ID jika belum ada
      if (!visitorStatsId.value) return; // Jika masih tidak ada, berhenti
    }

    try {
      // Ambil nilai saat ini untuk menghindari race condition
      const { data: currentStats, error: fetchError } = await $supabase
        .from('visitor_stats')
        .select('total_visitors, today_visitors, online_users')
        .eq('id', visitorStatsId.value)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      let newTotal = currentStats ? currentStats.total_visitors : 0;
      let newToday = currentStats ? currentStats.today_visitors : 0;
      let newOnline = currentStats ? currentStats.online_users : 0;

      // Logika untuk reset harian todayVisitors (ini bisa lebih kompleks)
      const today = new Date().toISOString().split('T')[0];
      const lastUpdatedDate = currentStats ? new Date(currentStats.last_updated).toISOString().split('T')[0] : '';

      if (lastUpdatedDate !== today) {
        newToday = 0; // Reset todayVisitors jika hari sudah berganti
      }

      if (type === 'page_load') {
        newTotal++;
        newToday++; // Asumsi kunjungan baru untuk hari ini
        newOnline++;
      } else if (type === 'page_unload') { // Saat pengguna meninggalkan halaman
        newOnline = Math.max(0, newOnline - 1); // Pastikan tidak negatif
      }

      const { error: updateError } = await $supabase
        .from('visitor_stats')
        .update({
          total_visitors: newTotal,
          today_visitors: newToday,
          online_users: newOnline,
          last_updated: new Date().toISOString()
        })
        .eq('id', visitorStatsId.value); // Update baris spesifik berdasarkan ID

      if (updateError) throw updateError;

      // Perbarui nilai ref lokal setelah berhasil diupdate di DB
      totalVisitors.value = newTotal;
      todayVisitors.value = newToday;
      onlineUsers.value = newOnline;

    } catch (err) {
      console.error('Error updating visitor stats:', err.message);
    }
  };

  // Mengatur Realtime Listener untuk mendengarkan perubahan di tabel visitor_stats
  const setupRealtimeListener = ($supabase) => {
    // Jika sudah ada listener sebelumnya, berhenti dulu
    if (unsubscribe) {
      unsubscribe.unsubscribe();
    }

    unsubscribe = $supabase
      .channel('visitor_stats_channel') // Nama channel harus unik
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_stats' }, payload => {
        console.log('Realtime change received for visitor stats!', payload);
        if (payload.new) {
          // Perbarui ref lokal dengan data terbaru dari perubahan real-time
          totalVisitors.value = payload.new.total_visitors || 0;
          todayVisitors.value = payload.new.today_visitors || 0;
          onlineUsers.value = payload.new.online_users || 0;
        }
      })
      .subscribe(); // Mulai mendengarkan perubahan
  };

  // Lifecycle hook: Saat komponen dimuat
  onMounted(async () => {
    await fetchVisitorStats(); // Ambil statistik awal
    const { $supabase } = useNuxtApp();
    if ($supabase) {
      // Update statistik saat halaman dimuat (misalnya, menambah online user)
      await updateStats($supabase, 'page_load');
      // Set up realtime listener
      setupRealtimeListener($supabase);
    }
  });

  // Lifecycle hook: Saat komponen tidak lagi dimuat (misalnya, berpindah halaman/menutup tab)
  onUnmounted(async () => {
    const { $supabase } = useNuxtApp();
    if ($supabase) {
      // Kurangi jumlah online user saat meninggalkan halaman
      await updateStats($supabase, 'page_unload');
      // Berhenti mendengarkan perubahan real-time untuk menghindari memory leak
      if (unsubscribe) {
        unsubscribe.unsubscribe();
      }
    }
  });

  // Mengembalikan ref agar bisa diakses di komponen yang menggunakan composable ini
  return {
    totalVisitors,
    todayVisitors,
    onlineUsers
  };
}