import { router, publicProcedure } from '@/helpers/server/trpc'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'

const onlineUsers = new Map<
  string,
  Set<{ id: string; sessionId: string; name?: string; email?: string }>
>()

const BROADCAST_INTERVAL_MS = 5000

export const onlineUsersRouter = router({
  subscribe: publicProcedure
    .input(
      z.object({
        typebotId: z.string(),
        user: z.object({
          id: z.string(),
          name: z.string().optional(),
          email: z.string().optional(),
        }),
      })
    )
    .subscription(({ input }) => {
      return observable<{
        count: number
        users: Array<{ id: string; name?: string; email?: string }>
      }>((emit) => {
        const { typebotId, user } = input
        const sessionId = Math.random().toString(36).substring(2, 15) // Gerar ID único para sessão

        if (!onlineUsers.has(typebotId)) {
          onlineUsers.set(typebotId, new Set())
        }
        const typebotUsers = onlineUsers.get(typebotId)!
        typebotUsers.add({
          id: user.id,
          email: user.email,
          name: user.name,
          sessionId,
        })

        const broadcastUpdate = async () => {
          const users = onlineUsers.get(typebotId)
          if (users) {
            const userIds = Array.from(users).map((user) => user.id)
            const uniqueUserIds = [...new Set(userIds)]

            emit.next({
              count: uniqueUserIds.length,
              users: Array.from(users),
            })
          }
        }

        broadcastUpdate()

        const interval = setInterval(broadcastUpdate, BROADCAST_INTERVAL_MS)

        return () => {
          const users = onlineUsers.get(typebotId)
          if (users) {
            for (const user of users) {
              if (user.sessionId === sessionId) {
                users.delete(user)
                break
              }
            }
            if (users.size === 0) {
              onlineUsers.delete(typebotId)
            }
          }
          clearInterval(interval)
        }
      })
    }),
})
