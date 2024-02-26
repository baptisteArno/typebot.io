import { Hono } from 'hono'
import { webRuntime } from './runtimes/web'
import { whatsAppRuntime } from './runtimes/whatsapp'

const app = new Hono()

app.get('/ping', (c) => c.json({ status: 'ok' }, 200))
app.route('/', webRuntime)
app.route('/', whatsAppRuntime)

export default {
  port: process.env.PORT ?? 3002,
  fetch: app.fetch,
}
