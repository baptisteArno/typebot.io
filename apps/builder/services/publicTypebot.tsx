import { PublicTypebot, Typebot } from 'models'
import shortId from 'short-uuid'
import { HStack, Text } from '@chakra-ui/react'
import { CalendarIcon } from 'assets/icons'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { isInputStep, sendRequest } from 'utils'

export const parseTypebotToPublicTypebot = (
  typebot: Typebot
): PublicTypebot => ({
  id: shortId.generate(),
  blocks: typebot.blocks,
  steps: typebot.steps,
  name: typebot.name,
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  publicId: typebot.publicId,
  choiceItems: typebot.choiceItems,
  variables: typebot.variables,
  edges: typebot.edges,
})

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
  typebot?: PublicTypebot
): {
  Header: JSX.Element
  accessor: string
}[] => {
  if (!typebot) return []
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
    ...typebot.blocks.allIds
      .filter((blockId) => typebot && blockContainsInput(typebot, blockId))
      .map((blockId) => {
        const block = typebot.blocks.byId[blockId]
        const inputStepId = block.stepIds.find((stepId) =>
          isInputStep(typebot.steps.byId[stepId])
        )
        const inputStep = typebot.steps.byId[inputStepId as string]
        return {
          Header: (
            <HStack>
              <StepIcon type={inputStep.type} />
              <Text>{block.title}</Text>
            </HStack>
          ),
          accessor: blockId,
        }
      }),
  ]
}

const blockContainsInput = (
  typebot: PublicTypebot | Typebot,
  blockId: string
) =>
  typebot.blocks.byId[blockId].stepIds.some((stepId) =>
    isInputStep(typebot.steps.byId[stepId])
  )
