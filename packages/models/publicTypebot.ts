import { Group, Edge, Settings, Theme, Variable } from './typebot'
import { PublicTypebot as PublicTypebotFromPrisma } from 'db'

export type PublicTypebot = Omit<
  PublicTypebotFromPrisma,
  | 'groups'
  | 'theme'
  | 'settings'
  | 'variables'
  | 'edges'
  | 'createdAt'
  | 'updatedAt'
> & {
  groups: Group[]
  variables: Variable[]
  edges: Edge[]
  theme: Theme
  settings: Settings
  createdAt: string
  updatedAt: string
}
