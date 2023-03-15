import { WorkspaceInvitation } from '@typebot.io/prisma'
import { fetcher } from '@/helpers/fetcher'
import useSWR from 'swr'
import { env } from '@typebot.io/lib'
import { Member } from '../types'

export const useMembers = ({ workspaceId }: { workspaceId?: string }) => {
  const { data, error, mutate } = useSWR<
    { members: Member[]; invitations: WorkspaceInvitation[] },
    Error
  >(workspaceId ? `/api/workspaces/${workspaceId}/members` : null, fetcher, {
    dedupingInterval: env('E2E_TEST') === 'true' ? 0 : undefined,
  })
  return {
    members: data?.members ?? [],
    invitations: data?.invitations ?? [],
    isLoading: !error && !data,
    mutate,
  }
}
