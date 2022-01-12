import { Typebot as TypebotFromPrisma } from 'db'
import { ChoiceItem } from './steps/inputs'
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
  choiceItems: Table<ChoiceItem>
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
