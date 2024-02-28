import { Typebot as TypebotFromPrisma } from 'db'
import { Settings } from './settings'
import { Step } from './steps/steps'
import { Theme } from './theme'
import { Variable } from './variable'

export type Typebot = Omit<
  TypebotFromPrisma,
  | 'blocks'
  | 'theme'
  | 'settings'
  | 'variables'
  | 'edges'
  | 'createdAt'
  | 'updatedAt'
> & {
  blocks: Block[]
  variables: Variable[]
  edges: Edge[]
  theme: Theme
  settings: Settings
  createdAt: string
  updatedAt: string
}

export type Block = {
  id: string
  title: string
  graphCoordinates: {
    x: number
    y: number
  }
  steps: Step[]
  hasConnection: boolean
}

export type Source = {
  blockId: string
  stepId: string
  itemId?: string
}
export type Target = { blockId: string; stepId?: string }
export type Edge = {
  id: string
  from: Source
  to: Target
}
