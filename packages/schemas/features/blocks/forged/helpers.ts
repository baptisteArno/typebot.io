import { forgedBlocks } from '@typebot.io/forge-repository/definitions'
import { ForgedBlock } from '@typebot.io/forge-repository/types'
import { Block } from '../schema'
import { claudiaBlockSchema } from '../../../../forge/blocks/claudia/schemas'
import { z } from '../../../zod'
import { answerTicket } from '../../../../forge/blocks/claudia/actions/answer_ticket'

export const isForgedBlock = (block: Block): block is ForgedBlock =>
  block.type in forgedBlocks
export const isForgedBlockType = (
  type: Block['type']
): type is ForgedBlock['type'] => type in forgedBlocks

export const isClaudiaBlock = (block: Block): block is ClaudiaBlock =>
  block.type === 'claudia'

export const isClaudiaAnswerTicketBlock = (block: Block): boolean => {
  return isClaudiaBlock(block) && block.options?.action === answerTicket.name
}

export type ClaudiaBlock = z.infer<typeof claudiaBlockSchema>
