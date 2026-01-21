import React from 'react'
import { useTranslate } from '@tolgee/react'
import { Text, HStack, Tag } from '@chakra-ui/react'
import { NativeVariablesBlock } from '@typebot.io/schemas'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'

type Props = {
  block: NativeVariablesBlock
}

export const NativeVariablesNode = ({ block }: Props) => {
  const { t } = useTranslate()
  const { typebot } = useTypebot()

  const selectedVariable = typebot?.variables.find(
    (variable) => variable.id === block.options?.variableId
  )

  const nativeType = block.options?.nativeType

  return (
    <HStack>
      <Text fontSize="sm" fontWeight="medium" color="gray.600">
        {t('blocks.inputs.nativeVariables.native.label')}
      </Text>
      {nativeType && (
        <Tag size="sm" colorScheme="orange">
          {nativeType}
        </Tag>
      )}
      {selectedVariable && (
        <SetVariableLabel variableId={selectedVariable.id} />
      )}
    </HStack>
  )
}
