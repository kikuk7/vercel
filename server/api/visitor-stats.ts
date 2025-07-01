import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const filePath = join(process.cwd(), 'data/visitor-stats.json')

export default defineEventHandler(async (event) => {
  if (event.req.method === 'GET') {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    return data
  }

  if (event.req.method === 'PUT') {
    const body = await readBody(event)
    writeFileSync(filePath, JSON.stringify(body, null, 2))
    return { status: 'success' }
  }
})
