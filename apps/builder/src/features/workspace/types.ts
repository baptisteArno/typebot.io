import { MemberInWorkspace, Workspace } from 'db'

export type Member = MemberInWorkspace & {
  name: string | null
  image: string | null
  email: string | null
}

export type WorkspaceWithMembers = Workspace & { members: MemberInWorkspace[] }
