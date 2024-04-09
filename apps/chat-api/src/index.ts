import { Hono } from 'hono'
import { webRuntime } from './runtimes/web'
import { whatsAppRuntime } from './runtimes/whatsapp'
import { prometheus } from '@hono/prometheus'
import { sentry } from '@hono/sentry'
import { env } from '@typebot.io/env'
import prisma from '@typebot.io/lib/prisma'

const app = new Hono()

app.use(
  '*',
  sentry({
    environment: env.NODE_ENV,
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  })
)

const { printMetrics, registerMetrics } = prometheus()
app.use('*', registerMetrics)
app.get('/metrics', async (c) => {
  const honoMetrics = await (await printMetrics(c)).text()
  const prismaMetrics = await prisma.$metrics.prometheus()
  return c.text(`${honoMetrics}\n\n${prismaMetrics}`, 200)
})

app.get('/ping', (c) => c.json({ status: 'ok' }, 200))

app.route('/', webRuntime)

app.route('/', whatsAppRuntime)

export default {
  port: process.env.PORT ?? 3002,
  fetch: app.fetch,
}
