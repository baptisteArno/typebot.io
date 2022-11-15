import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { byId } from 'utils'
import { Plan, Workspace, WorkspaceRole } from 'db'
import { useUser } from '../account/UserProvider'
import { useRouter } from 'next/router'
import { useTypebot } from '../editor/providers/TypebotProvider'
import { useWorkspaces } from './hooks/useWorkspaces'
import { createWorkspaceQuery } from './queries/createWorkspaceQuery'
import { deleteWorkspaceQuery } from './queries/deleteWorkspaceQuery'
import { updateWorkspaceQuery } from './queries/updateWorkspaceQuery'
import { WorkspaceWithMembers } from './types'

const workspaceContext = createContext<{
  workspaces?: WorkspaceWithMembers[]
  isLoading: boolean
  workspace?: WorkspaceWithMembers
  canEdit: boolean
  currentRole?: WorkspaceRole
  switchWorkspace: (workspaceId: string) => void
  createWorkspace: (name?: string) => Promise<void>
  updateWorkspace: (
    workspaceId: string,
    updates: Partial<Workspace>
  ) => Promise<void>
  deleteCurrentWorkspace: () => Promise<void>
  refreshWorkspace: (expectedUpdates: Partial<Workspace>) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

type WorkspaceContextProps = {
  children: ReactNode
}

const getNewWorkspaceName = (
  userFullName: string | undefined,
  existingWorkspaces: Workspace[]
) => {
  const workspaceName = userFullName
    ? `${userFullName}'s workspace`
    : 'My workspace'
  let newName = workspaceName
  let i = 1
  while (existingWorkspaces.find((w) => w.name === newName)) {
    newName = `${workspaceName} (${i})`
    i++
  }
  return newName
}

export const WorkspaceProvider = ({ children }: WorkspaceContextProps) => {
  const { query } = useRouter()
  const { user } = useUser()
  const userId = user?.id
  const { typebot } = useTypebot()
  const { workspaces, isLoading, mutate } = useWorkspaces({ userId })
  const [currentWorkspace, setCurrentWorkspace] =
    useState<WorkspaceWithMembers>()
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string>()

  const canEdit =
    workspaces
      ?.find(byId(currentWorkspace?.id))
      ?.members.find((m) => m.userId === userId)?.role === WorkspaceRole.ADMIN

  const currentRole = currentWorkspace?.members.find(
    (m) => m.userId === userId
  )?.role

  useEffect(() => {
    if (!workspaces || workspaces.length === 0 || currentWorkspace) return
    const lastWorspaceId =
      pendingWorkspaceId ??
      query.workspaceId?.toString() ??
      localStorage.getItem('workspaceId')
    const defaultWorkspace = lastWorspaceId
      ? workspaces.find(byId(lastWorspaceId))
      : workspaces.find((w) =>
          w.members.some(
            (m) => m.userId === userId && m.role === WorkspaceRole.ADMIN
          )
        )
    setCurrentWorkspace(defaultWorkspace ?? workspaces[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces?.length])

  useEffect(() => {
    if (!currentWorkspace?.id) return
    localStorage.setItem('workspaceId', currentWorkspace.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace?.id])

  useEffect(() => {
    if (!currentWorkspace) return setPendingWorkspaceId(typebot?.workspaceId)
    if (!typebot?.workspaceId || typebot.workspaceId === currentWorkspace.id)
      return
    switchWorkspace(typebot.workspaceId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot?.workspaceId])

  const switchWorkspace = (workspaceId: string) => {
    const newWorkspace = workspaces?.find(byId(workspaceId))
    if (!newWorkspace) return
    setCurrentWorkspace(newWorkspace)
  }

  const createWorkspace = async (userFullName?: string) => {
    if (!workspaces) return
    const newWorkspaceName = getNewWorkspaceName(userFullName, workspaces)
    const { data, error } = await createWorkspaceQuery({
      name: newWorkspaceName,
      plan: Plan.FREE,
    })
    if (error || !data) return
    const { workspace } = data
    const newWorkspace = {
      ...workspace,
      members: [
        {
          role: WorkspaceRole.ADMIN,
          userId: userId as string,
          workspaceId: workspace.id as string,
        },
      ],
    }
    mutate({
      workspaces: [...workspaces, newWorkspace],
    })
    setCurrentWorkspace(newWorkspace)
  }

  const updateWorkspace = async (
    workspaceId: string,
    updates: Partial<Workspace>
  ) => {
    const { data } = await updateWorkspaceQuery({ id: workspaceId, ...updates })
    if (!data || !currentWorkspace) return
    setCurrentWorkspace({ ...currentWorkspace, ...updates })
    mutate({
      workspaces: (workspaces ?? []).map((w) =>
        w.id === workspaceId ? { ...data.workspace, members: w.members } : w
      ),
    })
  }

  const deleteCurrentWorkspace = async () => {
    if (!currentWorkspace || !workspaces || workspaces.length < 2) return
    const { data } = await deleteWorkspaceQuery(currentWorkspace.id)
    if (!data || !currentWorkspace) return
    const newWorkspaces = (workspaces ?? []).filter((w) =>
      w.id === currentWorkspace.id
        ? { ...data.workspace, members: w.members }
        : w
    )
    setCurrentWorkspace(newWorkspaces[0])
    mutate({
      workspaces: newWorkspaces,
    })
  }

  const refreshWorkspace = (expectedUpdates: Partial<Workspace>) => {
    if (!currentWorkspace) return
    const updatedWorkspace = { ...currentWorkspace, ...expectedUpdates }
    mutate({
      workspaces: (workspaces ?? []).map((w) =>
        w.id === currentWorkspace.id ? updatedWorkspace : w
      ),
    })
    setCurrentWorkspace(updatedWorkspace)
  }

  return (
    <workspaceContext.Provider
      value={{
        workspaces,
        workspace: currentWorkspace,
        isLoading,
        canEdit,
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
