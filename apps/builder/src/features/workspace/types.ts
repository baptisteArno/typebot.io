import { MemberInWorkspace } from '@sniper.io/prisma'

export type Member = MemberInWorkspace & {
  name: string | null
  image: string | null
  email: string | null
}
