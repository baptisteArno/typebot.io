import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { byId } from '@typebot.io/lib'
import { WorkspaceRole } from '@typebot.io/prisma'
import { useRouter } from 'next/router'
import { trpc } from '@/lib/trpc'
import { Workspace } from '@typebot.io/schemas'
import { useToast } from '@/hooks/useToast'
import { useUser } from '../account/hooks/useUser'
import { useTypebot } from '../editor/providers/TypebotProvider'
import { setWorkspaceIdInLocalStorage } from './helpers/setWorkspaceIdInLocalStorage'
import { parseNewName } from './helpers/parseNewName'

const workspaceContext = createContext<{
  workspaces: Pick<Workspace, 'id' | 'name' | 'icon' | 'plan'>[]
  workspace?: Workspace
  currentRole?: WorkspaceRole
  switchWorkspace: (workspaceId: string) => void
  createWorkspace: (name?: string) => Promise<void>
  updateWorkspace: (updates: { icon?: string; name?: string }) => void
  deleteCurrentWorkspace: () => Promise<void>
  refreshWorkspace: () => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

type WorkspaceContextProps = {
  typebotId?: string
  children: ReactNode
}

export const WorkspaceProvider = ({
  typebotId,
  children,
}: WorkspaceContextProps) => {
  const { query } = useRouter()
  const { user } = useUser()
  const userId = user?.id
  const [workspaceId, setWorkspaceId] = useState<string | undefined>()

  const { typebot } = useTypebot()

  const trpcContext = trpc.useContext()

  const { data: workspacesData } = trpc.workspace.listWorkspaces.useQuery(
    undefined,
    {
      enabled: !!user,
    }
  )
  const workspaces = useMemo(
    () => workspacesData?.workspaces ?? [],
    [workspacesData?.workspaces]
  )

  const { data: workspaceData } = trpc.workspace.getWorkspace.useQuery(
    { workspaceId: workspaceId as string },
    { enabled: !!workspaceId }
  )

  const { data: membersData } = trpc.workspace.listMembersInWorkspace.useQuery(
    { workspaceId: workspaceId as string },
    { enabled: !!workspaceId }
  )

  const workspace = workspaceData?.workspace
  const members = membersData?.members

  const { showToast } = useToast()

  const createWorkspaceMutation = trpc.workspace.createWorkspace.useMutation({
    onError: (error) => showToast({ description: error.message }),
    onSuccess: async () => {
      trpcContext.workspace.listWorkspaces.invalidate()
    },
  })

  const updateWorkspaceMutation = trpc.workspace.updateWorkspace.useMutation({
    onError: (error) => showToast({ description: error.message }),
    onSuccess: async () => {
      trpcContext.workspace.getWorkspace.invalidate()
    },
  })

  const deleteWorkspaceMutation = trpc.workspace.deleteWorkspace.useMutation({
    onError: (error) => showToast({ description: error.message }),
    onSuccess: async () => {
      trpcContext.workspace.listWorkspaces.invalidate()
      setWorkspaceId(undefined)
    },
  })

  const currentRole = members?.find(
    (member) =>
      member.user.email === user?.email && member.workspaceId === workspaceId
  )?.role

  useEffect(() => {
    if (
      !workspaces ||
      workspaces.length === 0 ||
      workspaceId ||
      (typebotId && !typebot?.workspaceId)
    )
      return
    const lastWorspaceId =
      typebot?.workspaceId ??
      query.workspaceId?.toString() ??
      localStorage.getItem('workspaceId')

    const defaultWorkspaceId = lastWorspaceId
      ? workspaces.find(byId(lastWorspaceId))?.id
      : members?.find((member) => member.role === WorkspaceRole.ADMIN)
          ?.workspaceId

    const newWorkspaceId = defaultWorkspaceId ?? workspaces[0].id
    setWorkspaceIdInLocalStorage(newWorkspaceId)
    setWorkspaceId(newWorkspaceId)
  }, [
    members,
    query.workspaceId,
    typebot?.workspaceId,
    typebotId,
    userId,
    workspaceId,
    workspaces,
  ])

  const switchWorkspace = (workspaceId: string) => {
    setWorkspaceId(workspaceId)
    setWorkspaceIdInLocalStorage(workspaceId)
  }

  const createWorkspace = async (userFullName?: string) => {
    if (!workspaces) return
    const name = parseNewName(userFullName, workspaces)
    const { workspace } = await createWorkspaceMutation.mutateAsync({ name })
    setWorkspaceId(workspace.id)
  }

  const updateWorkspace = (updates: { icon?: string; name?: string }) => {
    if (!workspaceId) return
    updateWorkspaceMutation.mutate({
      workspaceId,
      ...updates,
    })
  }

  const deleteCurrentWorkspace = async () => {
    if (!workspaceId || !workspaces || workspaces.length < 2) return
    await deleteWorkspaceMutation.mutateAsync({ workspaceId })
  }

  const refreshWorkspace = () => {
    trpcContext.workspace.getWorkspace.invalidate()
    trpcContext.billing.getSubscription.invalidate()
  }

  return (
    <workspaceContext.Provider
      value={{
        workspaces,
        workspace,
        currentRole,
        switchWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteCurrentWorkspace,
        refreshWorkspace,
      }}
    >
      {children}
    </workspaceContext.Provider>
  )
}

export const useWorkspace = () => useContext(workspaceContext)
