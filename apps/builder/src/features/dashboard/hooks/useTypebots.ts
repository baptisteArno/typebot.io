import { trpc } from '@/lib/trpc'

export const useTypebots = ({
  folderId,
  workspaceId,
  onError,
}: {
  workspaceId?: string
  folderId?: string | 'root'
  onError: (error: Error) => void
}) => {
  const { data, isLoading, refetch } = trpc.typebot.listTypebots.useQuery(
    {
      workspaceId: workspaceId as string,
      folderId,
    },
    {
      enabled: !!workspaceId,
      onError: (error) => {
        onError(new Error(error.message))
      },
    }
  )
  return {
    typebots: data?.typebots,
    isLoading,
    refetch,
  }
}
