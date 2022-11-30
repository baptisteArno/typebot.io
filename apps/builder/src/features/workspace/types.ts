import { MemberInWorkspace } from 'db'

export type Member = MemberInWorkspace & {
  name: string | null
  image: string | null
  email: string | null
}
