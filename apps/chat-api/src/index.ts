import { Hono } from 'hono'
import { webRuntime } from './runtimes/web'
import { whatsAppRuntime } from './runtimes/whatsapp'
import { prometheus } from '@hono/prometheus'
import { sentry } from '@hono/sentry'
import { env } from '@typebot.io/env'

const app = new Hono()

app.use(
  '*',
  sentry({
    environment: env.NODE_ENV,
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA + '-chat-api',
  })
)

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
