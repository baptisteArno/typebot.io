import {
  Block,
  InputStep,
  PublicBlock,
  PublicStep,
  PublicTypebot,
  Step,
  Typebot,
} from 'models'
import shortId from 'short-uuid'
import { HStack, Text } from '@chakra-ui/react'
import { CalendarIcon } from 'assets/icons'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { isInputStep, sendRequest } from 'utils'
import { isDefined } from '@udecode/plate-common'

export const parseTypebotToPublicTypebot = (
  typebot: Typebot
): PublicTypebot => ({
  ...typebot,
  id: shortId.generate(),
  typebotId: typebot.id,
  blocks: parseBlocksToPublicBlocks(typebot.blocks),
})

const parseBlocksToPublicBlocks = (blocks: Block[]): PublicBlock[] =>
  blocks.map((b) => ({
    ...b,
    steps: b.steps.map(
      (s) =>
        ('webhook' in s && isDefined(s.webhook)
          ? { ...s, webhook: s.webhook.id }
          : s) as PublicStep
    ),
  }))

export const createPublishedTypebot = async (
  typebot: Omit<PublicTypebot, 'id'>
) =>
  sendRequest<PublicTypebot>({
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
  typebot: PublicTypebot
): {
  Header: JSX.Element
  accessor: string
}[] => {
  return [
    {
      Header: (
        <HStack>
          <CalendarIcon />
          <Text>Submitted at</Text>
        </HStack>
      ),
      accessor: 'createdAt',
    },
    ...typebot.blocks
      .filter(
        (block) => typebot && block.steps.some((step) => isInputStep(step))
      )
      .map((block) => {
        const inputStep = block.steps.find((step) =>
          isInputStep(step)
        ) as InputStep
        return {
          Header: (
            <HStack>
              <StepIcon type={inputStep.type} />
              <Text>{block.title}</Text>
            </HStack>
          ),
          accessor: block.id,
        }
      }),
  ]
}
