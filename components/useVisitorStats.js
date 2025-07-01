import { useRuntimeConfig } from '#imports'
import { ref, onMounted } from 'vue'

export const useVisitorStats = () => {
  const totalVisitors = ref(0)
  const todayVisitors = ref(0)
  const onlineUsers = ref(0)

  const config = useRuntimeConfig()

  const fetchStats = async () => {
    try {
      const res = await fetch(`${config.public.apiBase}/visitor-stats`)
      const data = await res.json()

      totalVisitors.value = data.total || 0
      todayVisitors.value = data.today || 0
      onlineUsers.value = data.online || 0
    } catch (err) {
      console.error('Gagal memuat statistik pengunjung:', err)
    }
  }

  onMounted(() => {
    fetchStats()
    setInterval(fetchStats, 30000)
  })

  return {
    totalVisitors,
    todayVisitors,
    onlineUsers
  }
}
