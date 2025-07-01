import { useNuxtApp } from '#app'

export const useVisitorStats = () => {
  const totalVisitors = ref(0)
  const todayVisitors = ref(0)
  const onlineUsers = ref(0)

  const { $supabase } = useNuxtApp()

  const fetchStats = async () => {
    const { data, error } = await $supabase
      .from('visitor_stats')
      .select('*')

    if (error) {
      console.error('Gagal ambil statistik:', error)
      return
    }

    totalVisitors.value = data?.[0]?.total || 0
    todayVisitors.value = data?.[0]?.today || 0
    onlineUsers.value = data?.[0]?.online || 0
  }

  onMounted(() => {
    fetchStats()
    setInterval(fetchStats, 30000)
  })

  return { totalVisitors, todayVisitors, onlineUsers }
}
