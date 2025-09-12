import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/useToast'

export const useClearEditingStatus = () => {
  const { showToast } = useToast()

  const { mutateAsync: clearEditingStatus, isLoading } =
    trpc.typebot.clearEditingStatus.useMutation({
      onError: (error) => {
        showToast({
          title: 'Error clearing editing status',
          description: error.message,
        })
      },
    })

  const clearEditingStatusForUser = async (
    typebotId: string,
    force: boolean = false
  ) => {
    try {
      await clearEditingStatus({ typebotId, force })
    } catch (error) {
      console.error('Failed to clear editing status:', error)
    }
  }

  return {
    clearEditingStatus: clearEditingStatusForUser,
    isClearing: isLoading,
  }
}
