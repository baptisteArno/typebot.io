import { Typebot as TypebotFromPrisma } from 'db'
import { Table } from '../utils'
import { Settings } from './settings'
import { Step } from './steps/steps'
import { Theme } from './theme'

export type Typebot = Omit<
  TypebotFromPrisma,
  'blocks' | 'theme' | 'settings' | 'steps'
> & {
  blocks: Table<Block>
  steps: Table<Step>
  theme: Theme
  settings: Settings
}

export type Block = {
  id: string
  title: string
  graphCoordinates: {
    x: number
    y: number
  }
  stepIds: string[]
}
