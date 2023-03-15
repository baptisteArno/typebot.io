import { CollaboratorsOnTypebots } from '@typebot.io/prisma'

export type Collaborator = CollaboratorsOnTypebots & {
  user: {
    name: string | null
    image: string | null
    email: string | null
  }
}
