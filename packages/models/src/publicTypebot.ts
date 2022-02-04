import { Block, Edge, Settings, Step, Theme, Variable } from './typebot'
import { PublicTypebot as PublicTypebotFromPrisma } from 'db'

export type PublicTypebot = Omit<
  PublicTypebotFromPrisma,
  'blocks' | 'theme' | 'settings' | 'variables' | 'edges'
> & {
  blocks: PublicBlock[]
  variables: Variable[]
  edges: Edge[]
  theme: Theme
  settings: Settings
}

export type PublicBlock = Omit<Block, 'steps'> & { steps: PublicStep[] }
export type PublicStep = Omit<Step, 'webhook'> & { webhook?: string }
