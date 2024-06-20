import { trpc } from '@/lib/trpc'

export const useSnipers = ({
  folderId,
  workspaceId,
  onError,
}: {
  workspaceId?: string
  folderId?: string | 'root'
  onError: (error: Error) => void
}) => {
  const { data, isLoading, refetch } = trpc.sniper.listSnipers.useQuery(
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
    snipers: data?.snipers,
    isLoading,
    refetch,
  }
}
