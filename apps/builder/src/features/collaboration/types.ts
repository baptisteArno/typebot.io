import { CollaboratorsOnSnipers } from '@sniper.io/prisma'

export type Collaborator = CollaboratorsOnSnipers & {
  user: {
    name: string | null
    image: string | null
    email: string | null
  }
}
