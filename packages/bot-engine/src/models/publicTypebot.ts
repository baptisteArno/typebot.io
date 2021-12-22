import { PublicTypebot as PublicTypebotFromPrisma } from 'db'
import { Block, StartBlock } from '.'

export type PublicTypebot = Omit<
  PublicTypebotFromPrisma,
  'blocks' | 'startBlock'
> & {
  blocks: Block[]
  startBlock: StartBlock
}
