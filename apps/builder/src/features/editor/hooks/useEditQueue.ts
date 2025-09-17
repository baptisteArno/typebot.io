import { ValidationError } from '../../typebot/constants/errorTypes'
import { useState, useCallback, useEffect } from 'react'
import { trpc } from '@/lib/trpc'

export type { ValidationError }

export interface TypebotEditQueueItem {
  id: string
  userId: string
  typebotId: string
  joinedAt: Date
  lastActivityAt: Date
  user: {
    name: string | null
    email: string | null
  }
}

export const useEditQueue = (typebotId?: string) => {
  const [isLoading, setIsLoading] = useState(false)
  const [joinQueuePending, setJoinQueuePending] = useState(false)

  const utils = trpc.useContext()

  const { data: queueItems, refetch: refetchQueueItems } =
    trpc.typebotEditQueue.listByTypebotId.useQuery(
      { typebotId: typebotId ?? '' },
      {
        enabled: Boolean(typebotId),
        refetchInterval: 5000,
        onError: (error) => {
          console.error('Error fetching edit queue:', error)
        },
      }
    )

  const joinQueueMutation = trpc.typebotEditQueue.join.useMutation({
    onSuccess: () => {
      if (typebotId) {
        utils.typebotEditQueue.listByTypebotId.invalidate({ typebotId })
      }
      setJoinQueuePending(false)
    },
    onError: () => {
      setJoinQueuePending(false)
    },
  })

  const leaveQueueMutation = trpc.typebotEditQueue.leave.useMutation({
    onSuccess: () => {
      if (typebotId) {
        utils.typebotEditQueue.listByTypebotId.invalidate({ typebotId })
      }
    },
  })

  const updateActivityMutation =
    trpc.typebotEditQueue.updateActivity.useMutation({
      onError: (error) => {
        console.error(
          "Erro while updating user's LastActivity on edit queue:",
          error
        )
      },
    })

  const cleanupInactiveUsersMutation =
    trpc.typebotEditQueue.cleanupInactiveUsers.useMutation({
      onSuccess: (data) => {
        if (typebotId && data.removedCount > 0) {
          utils.typebotEditQueue.listByTypebotId.invalidate({ typebotId })
        }
      },
      onError: (error) => {
        console.error(
          'Error while cleaning up inactive editQueue users:',
          error
        )
      },
    })

  const isInQueue = useCallback(
    (userId: string): boolean => {
      if (!queueItems || queueItems.length === 0) return false
      return queueItems.some((item) => item.userId === userId)
    },
    [queueItems]
  )

  const joinQueue = useCallback(
    async (userId: string) => {
      if (!typebotId || joinQueuePending) return false
      if (isInQueue(userId)) return true

      setJoinQueuePending(true)
      setIsLoading(true)

      try {
        await joinQueueMutation.mutateAsync({ typebotId })
        return true
      } catch (error) {
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [joinQueueMutation, typebotId, isInQueue, joinQueuePending]
  )

  const updateActivity = useCallback(async () => {
    if (!typebotId) return false

    try {
      await updateActivityMutation.mutateAsync({ typebotId })
      return true
    } catch (error) {
      return false
    }
  }, [updateActivityMutation, typebotId])

  const cleanupInactiveUsers = useCallback(
    async (inactivityThresholdMinutes = 10) => {
      if (!typebotId) return false

      try {
        await cleanupInactiveUsersMutation.mutateAsync({
          typebotId,
          inactivityThresholdMinutes,
        })
        return true
      } catch (error) {
        return false
      }
    },
    [cleanupInactiveUsersMutation, typebotId]
  )

  const isFirstInQueue = useCallback(
    (userId: string): boolean => {
      if (!queueItems || queueItems.length === 0) return false
      return queueItems[0].userId === userId
    },
    [queueItems]
  )

  const getPositionInQueue = useCallback(
    (userId: string): number | null => {
      if (!queueItems || queueItems.length === 0) return null

      const sortedQueue = [...queueItems].sort(
        (a, b) =>
          new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
      )

      const userIndex = sortedQueue.findIndex((item) => item.userId === userId)
      return userIndex !== -1 ? userIndex + 1 : null
    },
    [queueItems]
  )

  const currentEditor = queueItems ? queueItems[0] : null

  useEffect(() => {
    if (!typebotId) return

    const heartbeatInterval = setInterval(() => {
      updateActivity().catch(console.error)
    }, 10000)

    const cleanupInterval = setInterval(() => {
      cleanupInactiveUsers(10).catch(console.error)
    }, 120000)

    return () => {
      clearInterval(heartbeatInterval)
      clearInterval(cleanupInterval)
    }
  }, [typebotId, cleanupInactiveUsers, updateActivity])

  const leaveQueue = useCallback(
    async (userId: string) => {
      if (!typebotId) return false
      if (!isInQueue(userId)) return true

      try {
        await leaveQueueMutation.mutateAsync({ typebotId })
        return true
      } catch (error) {
        return false
      }
    },
    [leaveQueueMutation, typebotId, isInQueue]
  )

  return {
    queueItems,
    isLoading,
    refreshQueue: refetchQueueItems,
    joinQueue,
    leaveQueue,
    updateActivity,
    cleanupInactiveUsers,
    isFirstInQueue,
    isInQueue,
    getPositionInQueue,
    currentEditor: currentEditor,
  }
}
