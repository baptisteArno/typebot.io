import { WorkspaceWithMembers } from 'contexts/WorkspaceContext'
import { Plan, Workspace } from 'model'
import useSWR from 'swr'
import { isNotDefined, sendRequest } from 'utils'
import { fetcher } from '../utils'

export const useWorkspaces = ({ userId }: { userId?: string }) => {
  const { data, error, mutate } = useSWR<
    {
      workspaces: WorkspaceWithMembers[]
    },
    Error
  >(userId ? `/embed/builder/api/workspaces` : null, fetcher)
  return {
    workspaces: data?.workspaces,
    isLoading: !error && !data,
    mutate,
  }
}

export const createNewWorkspace = async (
  body: Omit<Workspace, 'id' | 'icon' | 'createdAt' | 'stripeId'>
) =>
  sendRequest<{
    workspace: Workspace
  }>({
    url: `/embed/builder/api/workspaces`,
    method: 'POST',
    body,
  })

export const updateWorkspace = async (updates: Partial<Workspace>) =>
  sendRequest<{
    workspace: Workspace
  }>({
    url: `/embed/builder/api/workspaces/${updates.id}`,
    method: 'PATCH',
    body: updates,
  })

export const deleteWorkspace = (workspaceId: string) =>
  sendRequest<{
    workspace: Workspace
  }>({
    url: `/embed/builder/api/workspaces/${workspaceId}`,
    method: 'DELETE',
  })

export const planToReadable = (plan?: Plan) => {
  if (!plan) return
  switch (plan) {
    case Plan.FREE:
      return 'Free'
    case Plan.LIFETIME:
      return 'Lifetime'
    case Plan.OFFERED:
      return 'Offered'
    case Plan.PRO:
      return 'Pro'
    case Plan.TEAM:
      return 'Team'
  }
}

export const isFreePlan = (workspace?: Pick<Workspace, 'plan'>) =>
  isNotDefined(workspace) || workspace?.plan === Plan.FREE
