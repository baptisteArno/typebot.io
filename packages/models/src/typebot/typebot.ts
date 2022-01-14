import { Typebot as TypebotFromPrisma } from 'db'
import { ChoiceItem } from './steps/inputs'
import { Table } from '../utils'
import { Settings } from './settings'
import { Step } from './steps/steps'
import { Theme } from './theme'
import { Variable } from './variable'

export type Typebot = Omit<
  TypebotFromPrisma,
  'blocks' | 'theme' | 'settings' | 'steps' | 'choiceItems' | 'variables'
> & {
  blocks: Table<Block>
  steps: Table<Step>
  choiceItems: Table<ChoiceItem>
  variables: Table<Variable>
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
