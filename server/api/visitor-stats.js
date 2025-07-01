// server/api/visitor-stats.js
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const filePath = path.resolve('data/visitor-stats.json')
  let data = {
    total_visits: 0,
    today_visits: 0,
    visitors: []
  }

  try {
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, 'utf-8')
      data = JSON.parse(file)
    }
  } catch (err) {
    console.error('Error reading visitor-stats.json:', err)
  }

  const now = new Date()
  const nowISO = now.toISOString()
  const todayKey = now.toISOString().slice(0, 10)
  const fiveMinutesAgo = new Date(now.getTime() - 1 * 60 * 1000).toISOString() // 1 menit

  const visitorId = getCookie(event, 'visitor-id') || crypto.randomUUID()
  setCookie(event, 'visitor-id', visitorId)

  const isTodayNew = !data.visitors.find(v => v.id === visitorId && v.timestamp.startsWith(todayKey))
  const isNew = !data.visitors.find(v => v.id === visitorId)

  if (isNew) data.total_visits += 1
  if (isTodayNew) data.today_visits += 1

  data.visitors = data.visitors.filter(v => v.timestamp > fiveMinutesAgo)

  const existing = data.visitors.find(v => v.id === visitorId)
  if (existing) {
    existing.timestamp = nowISO
  } else {
    data.visitors.push({ id: visitorId, timestamp: nowISO })
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')

  return {
    total_visits: data.total_visits,
    today_visits: data.today_visits,
    online_users: data.visitors.length
  }
})
