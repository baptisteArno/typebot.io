import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Flex, Stack, Text, Tooltip } from '@chakra-ui/react'
import { useForgedBlock } from '../hooks/useForgedBlock'
import { ForgedBlock } from '@typebot.io/forge-repository/types'
import { BlockIndices } from '@typebot.io/schemas'
import { useMemo } from 'react'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { ThunderIcon } from '@/components/icons'

type Props = {
  block: ForgedBlock
  indices: BlockIndices
}
export const ForgedBlockNodeContent = ({ block, indices }: Props) => {
  const { blockDef, actionDef } = useForgedBlock(
    block.type,
    block.options?.action
  )
  const { typebot } = useTypebot()

  const isStreamingNextBlock = useMemo(() => {
    if (!actionDef?.run?.stream?.getStreamVariableId) return false
    const variable = typebot?.variables.find(
      (variable) =>
        variable.id ===
        actionDef.run!.stream!.getStreamVariableId(block.options)
    )
    if (!variable) return false
    const nextBlock =
      typebot?.groups[indices.groupIndex]?.blocks[indices.blockIndex + 1]
    return (
      nextBlock?.type === BubbleBlockType.TEXT &&
      nextBlock.content?.richText?.length === 1 &&
      nextBlock.content.richText[0].type === 'p' &&
      nextBlock.content.richText[0].children.length === 1 &&
      nextBlock.content.richText[0].children[0].text === `{{${variable.name}}}`
    )
  }, [
    actionDef?.run,
    block.options,
    indices.blockIndex,
    indices.groupIndex,
    typebot?.groups,
    typebot?.variables,
  ])

  const setVariableIds = actionDef?.getSetVariableIds?.(block.options) ?? []

  const isConfigured =
    block.options?.action && (!blockDef?.auth || block.options.credentialsId)
  return (
    <Stack>
      <Text color={isConfigured ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {isConfigured ? block.options.action : 'Configure...'}
      </Text>
      {typebot &&
        isConfigured &&
        setVariableIds.map((variableId, idx) => (
          <SetVariableLabel
            key={variableId + idx}
            variables={typebot.variables}
            variableId={variableId}
          />
        ))}
      {isStreamingNextBlock && (
        <Tooltip label="Text bubble content will be streamed">
          <Flex
            rounded="full"
            p="1"
            bgColor="gray.100"
            color="purple.500"
            borderWidth={1}
            pos="absolute"
            bottom="-15px"
            left="118px"
            zIndex={10}
          >
            <ThunderIcon fontSize="sm" />
          </Flex>
        </Tooltip>
      )}
    </Stack>
  )
}
