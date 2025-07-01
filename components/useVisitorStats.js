// components/useVisitorStats.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useVisitorStats() {
  const totalVisitors = ref(0)
  const todayVisitors = ref(0)
  const onlineUsers = ref(1) // default static

  const todayKey = 'visited-' + new Date().toISOString().slice(0, 10)
  let visitorId = null
  let intervalId = null

  const updateStats = async () => {
    if (!visitorId) {
      visitorId = sessionStorage.getItem('visitor-id')
      if (!visitorId) {
        visitorId = crypto.randomUUID()
        sessionStorage.setItem('visitor-id', visitorId)
      }
    }

    try {
      const res = await fetch('/api/visitor-stats')
      const stats = await res.json()

      const now = new Date()
      const nowISO = now.toISOString()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString()

      if (!localStorage.getItem(todayKey)) {
        stats.total_visits += 1
        stats.today_visits += 1
        localStorage.setItem(todayKey, 'true')
      }

      stats.visitors = stats.visitors.filter(v => v.timestamp > fiveMinutesAgo)
      const existing = stats.visitors.find(v => v.id === visitorId)
      if (existing) {
        existing.timestamp = nowISO
      } else {
        stats.visitors.push({ id: visitorId, timestamp: nowISO })
      }

      await fetch('/api/visitor-stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      })

      totalVisitors.value = stats.total_visits
      todayVisitors.value = stats.today_visits
      onlineUsers.value = stats.visitors.length
    } catch (err) {
      console.error('Gagal update visitor stats:', err)
      totalVisitors.value = 'Gagal'
      todayVisitors.value = 'Gagal'
      onlineUsers.value = 'Gagal'
    }
  }

  onMounted(() => {
    updateStats()
    intervalId = setInterval(updateStats, 30000)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return {
    totalVisitors,
    todayVisitors,
    onlineUsers,
    updateStats
  }
}