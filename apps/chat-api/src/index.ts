import { Hono } from 'hono'
import { webRuntime } from './runtimes/web'
import { whatsAppRuntime } from './runtimes/whatsapp'
import { prometheus } from '@hono/prometheus'

const app = new Hono()

const { printMetrics, registerMetrics } = prometheus()
app.use('*', registerMetrics)
app.get('/metrics', printMetrics)

app.get('/ping', (c) => c.json({ status: 'ok' }, 200))
app.route('/', webRuntime)
app.route('/', whatsAppRuntime)

export default {
  port: process.env.PORT ?? 3002,
  fetch: app.fetch,
}
