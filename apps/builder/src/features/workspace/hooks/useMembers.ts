import { WorkspaceInvitation } from '@typebot.io/prisma'
import { fetcher } from '@/helpers/fetcher'
import useSWR from 'swr'
import { env } from '@typebot.io/env'
import { Member } from '../types'

export const useMembers = ({ workspaceId }: { workspaceId?: string }) => {
  const { data, error, mutate } = useSWR<
    { members: Member[]; invitations: WorkspaceInvitation[] },
    Error
  >(workspaceId ? `/api/workspaces/${workspaceId}/members` : null, fetcher, {
    dedupingInterval: env.NEXT_PUBLIC_E2E_TEST ? 0 : undefined,
  })
  return {
    members: data?.members ?? [],
    invitations: data?.invitations ?? [],
    isLoading: !error && !data,
    mutate,
  }
}
