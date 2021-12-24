import {
  Block,
  InputStep,
  PublicTypebot,
  Step,
  StepType,
  Typebot,
} from 'bot-engine'
import { sendRequest } from './utils'
import shortId from 'short-uuid'

export const parseTypebotToPublicTypebot = (
  typebot: Typebot
): PublicTypebot => ({
  id: shortId.generate(),
  blocks: typebot.blocks,
  name: typebot.name,
  startBlock: typebot.startBlock,
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  publicId: typebot.publicId,
})

export const createPublishedTypebot = async (
  typebot: Omit<PublicTypebot, 'id'>
) =>
  sendRequest({
    url: `/api/publicTypebots`,
    method: 'POST',
    body: typebot,
  })

export const updatePublishedTypebot = async (
  id: string,
  typebot: Omit<PublicTypebot, 'id'>
) =>
  sendRequest({
    url: `/api/publicTypebots/${id}`,
    method: 'PUT',
    body: typebot,
  })

export const parseSubmissionsColumns = (
  typebot?: PublicTypebot
): {
  Header: string
  accessor: string
}[] =>
  (typebot?.blocks ?? [])
    .filter(blockContainsInput)
    .map((block) => ({ Header: block.title, accessor: block.id }))

const blockContainsInput = (block: Block) => block.steps.some(stepIsInput)

const stepIsInput = (step: Step): step is InputStep =>
  step.type === StepType.TEXT_INPUT
