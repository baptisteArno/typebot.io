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
import { HStack, Text } from '@chakra-ui/react'
import { CalendarIcon } from 'assets/icons'
import { StepIcon } from 'components/board/StepTypesList/StepIcon'

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
  Header: JSX.Element
  accessor: string
}[] => [
  {
    Header: (
      <HStack>
        <CalendarIcon />
        <Text>Submitted at</Text>
      </HStack>
    ),
    accessor: 'createdAt',
  },
  ...(typebot?.blocks ?? []).filter(blockContainsInput).map((block) => ({
    Header: (
      <HStack>
        <StepIcon
          type={
            block.steps.find((step) => step.target)?.type ?? StepType.TEXT_INPUT
          }
        />
        <Text>{block.title}</Text>
      </HStack>
    ),
    accessor: block.id,
  })),
]

const blockContainsInput = (block: Block) => block.steps.some(stepIsInput)

const stepIsInput = (step: Step): step is InputStep =>
  step.type === StepType.TEXT_INPUT
