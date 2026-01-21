import { Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { ValidateCnpjBlock } from '@typebot.io/schemas/features/blocks/logic/validateCnpj'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { byId } from '@typebot.io/lib'
import { VALIDATION_RESULT_VARIABLES } from '@typebot.io/bot-engine/blocks/logic/validation/constants'

type Props = {
  block: ValidateCnpjBlock
}

export const ValidateCnpjContent = ({ block }: Props) => {
  const { t } = useTranslate()
  const { typebot } = useTypebot()
  const inputVarName =
    typebot?.variables.find(byId(block.options?.inputVariableId))?.name ?? ''

  if (!inputVarName) {
    return (
      <Text color={'gray.500'} fontSize="sm">
        {t('blocks.logic.validateCnpj.configure.label')}
      </Text>
    )
  }

  const resultVarName = VALIDATION_RESULT_VARIABLES.CNPJ

  return (
    <Text color={'gray.500'} fontSize="sm">
      {t('blocks.logic.validateCnpj.label')} {inputVarName} → {resultVarName}
    </Text>
  )
}
