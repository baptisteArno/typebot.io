import { BlockIndices, ChoiceInputBlock } from '@typebot.io/schemas'
import React from 'react'
import { Stack, Tag, Text, Wrap } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { ItemNodesList } from '@/features/graph/components/nodes/item/ItemNodesList'
import { useTranslate } from '@tolgee/react'

type Props = {
  block: ChoiceInputBlock
  indices: BlockIndices
}

export const ButtonsBlockNode = ({ block, indices }: Props) => {
  const { typebot } = useTypebot()
  const { t } = useTranslate()
  const dynamicVariableIdName = typebot?.variables.find(
    (variable) => variable.id === block.options?.dynamicVariableId
  )?.name
  const dynamicVariableName = typebot?.variables.find(
    (variable) => variable.id === block.options?.dynamicVariableName
  )?.name
  
  return (
    <Stack w="full">
      {block.options?.dynamicVariableId || block.options?.dynamicVariableName ? (
        <Wrap spacing={1}>
          <Text>{t('blocks.inputs.button.variables.display.label')}</Text>
          {
            dynamicVariableIdName ? (
            <Tag bg="orange.400" color="white">
              {dynamicVariableIdName}
            </Tag>) : null
          }
          {
            dynamicVariableName ?(
            <Tag bg="orange.400" color="white">
              {dynamicVariableName}
            </Tag>) : null
          }
          <Text>{t('blocks.inputs.button.variables.buttons.label')}</Text>
        </Wrap>
      ) : (
        <ItemNodesList block={block} indices={indices} />
      )}
      {block.options?.variableId ? (
        <SetVariableLabel
          variableId={block.options.variableId}
          variables={typebot?.variables}
        />
      ) : null}
    </Stack>
  )
}
