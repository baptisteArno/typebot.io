import { PublicTypebot as PublicTypebotFromPrisma } from 'db'
import { Block, Settings, StartBlock, Theme } from '.'

export type PublicTypebot = Omit<
  PublicTypebotFromPrisma,
  'blocks' | 'startBlock' | 'theme' | 'settings'
> & {
  blocks: Block[]
  startBlock: StartBlock
  theme: Theme
  settings: Settings
}
