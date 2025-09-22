import { trpc } from '@/lib/trpc'

type UseTypebotHistoryOptions = {
  typebotId?: string
  limit?: number
  cursor?: string
  excludeContent?: boolean
  historyId?: string
  enabled?: boolean
}

export const useTypebotHistory = ({
  typebotId,
  limit = 20,
  cursor,
  excludeContent = false,
  historyId,
  enabled = true,
}: UseTypebotHistoryOptions) => {
  return trpc.typebot.getTypebotHistory.useQuery(
    {
      typebotId: typebotId!,
      limit,
      cursor,
      excludeContent,
      historyId,
    },
    {
      enabled: !!typebotId && enabled,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    }
  )
}

export const useTypebotHistoryInfinite = (typebotId?: string) => {
  return trpc.typebot.getTypebotHistory.useInfiniteQuery(
    {
      typebotId: typebotId!,
      limit: 10,
    },
    {
      enabled: !!typebotId,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  )
}
