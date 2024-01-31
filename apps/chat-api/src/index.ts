import { Elysia } from 'elysia'
import { apiRuntime } from './runtimes/api/app'
import { whatsAppRuntime } from './runtimes/whatsapp/app'

new Elysia()
  .use(apiRuntime)
  .use(whatsAppRuntime)
  .listen(process.env.PORT ?? 3002)

console.log(`Chat API is running on port ${process.env.PORT ?? 3002}`)
