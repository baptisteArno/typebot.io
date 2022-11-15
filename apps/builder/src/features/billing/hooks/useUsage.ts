import { fetcher } from '@/utils/helpers'
import useSWR from 'swr'
import { env } from 'utils'

export const useUsage = (workspaceId?: string) => {
  const { data, error } = useSWR<
    { totalChatsUsed: number; totalStorageUsed: number },
    Error
  >(workspaceId ? `/api/workspaces/${workspaceId}/usage` : null, fetcher, {
    dedupingInterval: env('E2E_TEST') === 'true' ? 0 : undefined,
  })
  return {
    data,
    isLoading: !error && !data,
  }
}
