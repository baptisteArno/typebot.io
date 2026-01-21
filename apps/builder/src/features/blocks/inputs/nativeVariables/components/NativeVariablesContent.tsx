import { useTranslate } from '@tolgee/react'
import { Text } from '@chakra-ui/react'
import {
  NativeVariablesBlock,
  nativeVariableTypes,
} from '@typebot.io/schemas/features/blocks/inputs/nativeVariables'

type Props = {
  block: NativeVariablesBlock
}

export const NativeVariablesContent = ({ block }: Props) => {
  const { t } = useTranslate()
  const nativeType = nativeVariableTypes.find(
    (type) => type.value === block.options?.nativeType
  )

  if (!nativeType) {
    return (
      <Text color={'gray.500'} fontSize="sm">
        {t('blocks.inputs.nativeVariables.configure.label')}
      </Text>
    )
  }

  return (
    <Text color={'gray.500'} fontSize="sm">
      {nativeType.value}
    </Text>
  )
}
