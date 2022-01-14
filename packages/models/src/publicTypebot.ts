import { PublicTypebot as PublicTypebotFromPrisma } from 'db'
import { Block, ChoiceItem, Settings, Step, Theme } from './typebot'
import { Variable } from './typebot/variable'
import { Table } from './utils'

export type PublicTypebot = Omit<
  PublicTypebotFromPrisma,
  | 'blocks'
  | 'startBlock'
  | 'theme'
  | 'settings'
  | 'steps'
  | 'choiceItems'
  | 'variables'
> & {
  blocks: Table<Block>
  steps: Table<Step>
  choiceItems: Table<ChoiceItem>
  variables: Table<Variable>
  theme: Theme
  settings: Settings
}
