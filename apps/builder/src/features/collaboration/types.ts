import { CollaboratorsOnTypebots } from 'db'

export type Collaborator = CollaboratorsOnTypebots & {
  user: {
    name: string | null
    image: string | null
    email: string | null
  }
}
