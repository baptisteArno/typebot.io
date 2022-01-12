import { PublicTypebot as PublicTypebotFromPrisma } from 'db'
import { Block, ChoiceItem, Settings, Step, Theme } from './typebot'
import { Table } from './utils'

export type PublicTypebot = Omit<
  PublicTypebotFromPrisma,
  'blocks' | 'startBlock' | 'theme' | 'settings' | 'steps'
> & {
  blocks: Table<Block>
  steps: Table<Step>
  choiceItems: Table<ChoiceItem>
  theme: Theme
  settings: Settings
}
