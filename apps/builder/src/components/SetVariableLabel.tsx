import { useColorModeValue, HStack, Tag, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { Variable } from '@typebot.io/schemas'

export const SetVariableLabel = ({
  variableId,
  variables,
}: {
  variableId: string
  variables?: Variable[]
}) => {
  const { t } = useTranslate()
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const variableName = variables?.find(
    (variable) => variable.id === variableId
  )?.name

  if (!variableName) return null
  return (
    <HStack fontStyle="italic" spacing={1}>
      <Text fontSize="sm" color={textColor}>
        {t('variables.set')}
      </Text>
      <Tag bg="orange.400" color="white" size="sm">
        {variableName}
      </Tag>
    </HStack>
  )
}
