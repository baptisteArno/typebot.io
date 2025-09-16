import { router, publicProcedure } from '@/helpers/server/trpc'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'
import { EventEmitter, on } from 'events'

type EventMap<T> = Record<keyof T, unknown[]>

class IterableEventEmitter<T extends EventMap<T>> extends EventEmitter {
  toIterable<TEventName extends keyof T & string>(
    eventName: TEventName,
    opts?: NonNullable<Parameters<typeof on>[2]>
  ): AsyncIterable<T[TEventName]> {
    return on(this, eventName, opts) as AsyncIterable<T[TEventName]>
  }
}

interface OnlineUsersEvents {
  userJoined: [
    string,
    {
      user: { id: string; name?: string; email?: string }
      count: number
      users: Array<{ id: string; name?: string; email?: string }>
    }
  ]
  userLeft: [
    string,
    {
      user: { id: string; name?: string; email?: string }
      count: number
      users: Array<{ id: string; name?: string; email?: string }>
    }
  ]
}

const onlineUsers = new Map<
  string,
  Set<{ id: string; sessionId: string; name?: string; email?: string }>
>()

const userChangeEmitter = new IterableEventEmitter<OnlineUsersEvents>()

const getUsersData = (typebotId: string) => {
  const users = onlineUsers.get(typebotId)
  if (!users) return null

  const userIds = Array.from(users).map((user) => user.id)
  const uniqueUserIds = [...new Set(userIds)]

  return {
    count: uniqueUserIds.length,
    users: Array.from(users).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    })),
  }
}

const emitUserJoined = (
  typebotId: string,
  user: { id: string; name?: string; email?: string }
) => {
  const usersData = getUsersData(typebotId)
  if (usersData) {
    userChangeEmitter.emit('userJoined', typebotId, {
      user,
      ...usersData,
    })
  }
}

const emitUserLeft = (
  typebotId: string,
  user: { id: string; name?: string; email?: string }
) => {
  const usersData = getUsersData(typebotId)
  if (usersData) {
    userChangeEmitter.emit('userLeft', typebotId, {
      user,
      ...usersData,
    })
  }
}

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
        const sessionId = Math.random().toString(36).substring(2, 15)

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

        const userJoinedListener = (
          eventTypebotId: string,
          data: {
            user: { id: string; name?: string; email?: string }
            count: number
            users: Array<{ id: string; name?: string; email?: string }>
          }
        ) => {
          if (eventTypebotId === typebotId) {
            emit.next({
              count: data.count,
              users: data.users,
            })
          }
        }

        const userLeftListener = (
          eventTypebotId: string,
          data: {
            user: { id: string; name?: string; email?: string }
            count: number
            users: Array<{ id: string; name?: string; email?: string }>
          }
        ) => {
          if (eventTypebotId === typebotId) {
            emit.next({
              count: data.count,
              users: data.users,
            })
          }
        }

        userChangeEmitter.on('userJoined', userJoinedListener)
        userChangeEmitter.on('userLeft', userLeftListener)

        emitUserJoined(typebotId, {
          id: user.id,
          name: user.name,
          email: user.email,
        })

        return () => {
          console.log(
            `User ${user.name} (${user.id}) disconnected from typebot ${typebotId} with session ${sessionId}`
          )

          userChangeEmitter.off('userJoined', userJoinedListener)
          userChangeEmitter.off('userLeft', userLeftListener)

          const users = onlineUsers.get(typebotId)
          if (users) {
            for (const userItem of users) {
              if (userItem.sessionId === sessionId) {
                users.delete(userItem)
                break
              }
            }

            if (users.size === 0) {
              onlineUsers.delete(typebotId)
            }

            emitUserLeft(typebotId, {
              id: user.id,
              name: user.name,
              email: user.email,
            })
          }
        }
      })
    }),
})
