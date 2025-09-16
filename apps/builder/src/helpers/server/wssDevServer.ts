import { createContext } from './context'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import { WebSocketServer } from 'ws'
import { appRouter } from './routers/appRouter'

const wss = new WebSocketServer({
  port: 3004,
})
const handler = applyWSSHandler({ wss, router: appRouter, createContext })

wss.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`)
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`)
  })
})
console.log('✅ WebSocket Server listening on ws://localhost:3004')

process.on('SIGTERM', () => {
  console.log('SIGTERM')
  handler.broadcastReconnectNotification()
  wss.close()
})
