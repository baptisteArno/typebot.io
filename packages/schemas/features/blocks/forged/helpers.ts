import { forgedBlocks } from '@typebot.io/forge-repository/definitions'
import { ForgedBlock } from '@typebot.io/forge-repository/types'
import { Block } from '../schema'

export const isForgedBlock = (block: Block): block is ForgedBlock =>
  block.type in forgedBlocks
export const isForgedBlockType = (
  type: Block['type']
): type is ForgedBlock['type'] => type in forgedBlocks
