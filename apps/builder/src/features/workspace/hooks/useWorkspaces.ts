import { fetcher } from '@/utils/helpers'
import useSWR from 'swr'
import { WorkspaceWithMembers } from '../types'

export const useWorkspaces = ({ userId }: { userId?: string }) => {
  const { data, error, mutate } = useSWR<
    {
      workspaces: WorkspaceWithMembers[]
    },
    Error
  >(userId ? `/api/workspaces` : null, fetcher)
  return {
    workspaces: data?.workspaces,
    isLoading: !error && !data,
    mutate,
  }
}
