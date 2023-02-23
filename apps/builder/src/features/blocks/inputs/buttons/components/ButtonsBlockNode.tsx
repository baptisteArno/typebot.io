import { BlockIndices, ChoiceInputBlock, Variable } from 'models'
import React from 'react'
import { ItemNodesList } from '@/features/graph/components/Nodes/ItemNode'
import {
  HStack,
  Stack,
  Tag,
  Text,
  useColorModeValue,
  Wrap,
} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'

type Props = {
  block: ChoiceInputBlock
  indices: BlockIndices
}

export const ButtonsBlockNode = ({ block, indices }: Props) => {
  const { typebot } = useTypebot()
  const dynamicVariableName = typebot?.variables.find(
    (variable) => variable.id === block.options.dynamicVariableId
  )?.name

  return (
    <Stack w="full">
      {block.options.variableId ? (
        <CollectVariableLabel
          variableId={block.options.variableId}
          variables={typebot?.variables}
        />
      ) : null}
      {block.options.dynamicVariableId ? (
        <Wrap spacing={1}>
          <Text>Display</Text>
          <Tag bg="orange.400" color="white">
            {dynamicVariableName}
          </Tag>
          <Text>buttons</Text>
        </Wrap>
      ) : (
        <ItemNodesList block={block} indices={indices} />
      )}
    </Stack>
  )
}

const CollectVariableLabel = ({
  variableId,
  variables,
}: {
  variableId: string
  variables?: Variable[]
}) => {
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const variableName = variables?.find(
    (variable) => variable.id === variableId
  )?.name

  if (!variableName) return null
  return (
    <HStack fontStyle="italic" spacing={1}>
      <Text fontSize="sm" color={textColor}>
        Collects
      </Text>
      <Tag bg="orange.400" color="white" size="sm">
        {variableName}
      </Tag>
    </HStack>
  )
}
