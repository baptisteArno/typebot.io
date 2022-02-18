import { Block, PublicBlock, PublicStep, PublicTypebot, Typebot } from 'models'
import shortId from 'short-uuid'
import { HStack, Text } from '@chakra-ui/react'
import { CalendarIcon, CodeIcon } from 'assets/icons'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { byId, isInputStep, sendRequest } from 'utils'
import { isDefined } from '@udecode/plate-common'

export const parseTypebotToPublicTypebot = (
  typebot: Typebot
): PublicTypebot => ({
  id: shortId.generate(),
  typebotId: typebot.id,
  blocks: parseBlocksToPublicBlocks(typebot.blocks),
  edges: typebot.edges,
  name: typebot.name,
  publicId: typebot.publicId,
  settings: typebot.settings,
  theme: typebot.theme,
  variables: typebot.variables,
  customDomain: typebot.customDomain,
})

export const parseBlocksToPublicBlocks = (blocks: Block[]): PublicBlock[] =>
  blocks.map((b) => ({
    ...b,
    steps: b.steps.map(
      (s) =>
        ('webhook' in s && isDefined(s.webhook)
          ? { ...s, webhook: s.webhook.id }
          : s) as PublicStep
    ),
  }))

export const createPublishedTypebot = async (typebot: PublicTypebot) =>
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

type HeaderCell = {
  Header: JSX.Element
  accessor: string
}
export const parseSubmissionsColumns = (
  typebot: PublicTypebot
): HeaderCell[] => {
  const parsedBlocks = parseBlocksHeaders(typebot)
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
    ...parsedBlocks,
    ...parseVariablesHeaders(typebot, parsedBlocks),
  ]
}

const parseBlocksHeaders = (typebot: PublicTypebot) =>
  typebot.blocks
    .filter((block) => typebot && block.steps.some((step) => isInputStep(step)))
    .reduce<HeaderCell[]>((headers, block) => {
      const inputStep = block.steps.find((step) => isInputStep(step))
      if (
        !inputStep ||
        !isInputStep(inputStep) ||
        headers.find((h) => h.accessor === inputStep.options.variableId)
      )
        return headers
      const matchedVariableName =
        inputStep.options.variableId &&
        typebot.variables.find(byId(inputStep.options.variableId))?.name
      return [
        ...headers,
        {
          Header: (
            <HStack
              minW={
                'isLong' in inputStep.options && inputStep.options.isLong
                  ? '400px'
                  : '150px'
              }
              maxW="500px"
            >
              <StepIcon type={inputStep.type} />
              <Text>{matchedVariableName ?? block.title}</Text>
            </HStack>
          ),
          accessor: inputStep.options.variableId ?? block.id,
        },
      ]
    }, [])

const parseVariablesHeaders = (
  typebot: PublicTypebot,
  parsedBlocks: {
    Header: JSX.Element
    accessor: string
  }[]
) =>
  typebot.variables.reduce<HeaderCell[]>((headers, v) => {
    if (parsedBlocks.find((b) => b.accessor === v.id)) return headers
    return [
      ...headers,
      {
        Header: (
          <HStack minW={'150px'} maxW="500px">
            <CodeIcon />
            <Text>{v.name}</Text>
          </HStack>
        ),
        accessor: v.id,
      },
    ]
  }, [])
