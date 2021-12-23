import { PublicTypebot as PublicTypebotFromPrisma } from 'db'
import { Block, StartBlock, Theme } from '.'

export type PublicTypebot = Omit<
  PublicTypebotFromPrisma,
  'blocks' | 'startBlock' | 'theme'
> & {
  blocks: Block[]
  startBlock: StartBlock
  theme: Theme
}
