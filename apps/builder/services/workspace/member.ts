import { MemberInWorkspace, WorkspaceInvitation } from 'db'
import { fetcher } from 'services/utils'
import useSWR from 'swr'
import { isEmpty, sendRequest } from 'utils'

export type Member = MemberInWorkspace & {
  name: string | null
  image: string | null
  email: string | null
}

export const useMembers = ({ workspaceId }: { workspaceId?: string }) => {
  const { data, error, mutate } = useSWR<
    { members: Member[]; invitations: WorkspaceInvitation[] },
    Error
  >(workspaceId ? `/api/workspaces/${workspaceId}/members` : null, fetcher, {
    dedupingInterval: isEmpty(process.env.NEXT_PUBLIC_E2E_TEST) ? undefined : 0,
  })
  return {
    members: data?.members,
    invitations: data?.invitations,
    isLoading: !error && !data,
    mutate,
  }
}

export const updateMember = (
  workspaceId: string,
  member: Partial<MemberInWorkspace>
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/workspaces/${workspaceId}/members/${member.userId}`,
    body: member,
  })

export const deleteMember = (workspaceId: string, userId: string) =>
  sendRequest({
    method: 'DELETE',
    url: `/api/workspaces/${workspaceId}/members/${userId}`,
  })
