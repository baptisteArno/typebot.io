import { chakra, Text } from '@chakra-ui/react'
import { WaitBlock } from '@typebot.io/schemas'
import React, { useMemo } from 'react'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: WaitBlock['options']
}

// Matches {{ variableName }} capturing the inner content trimmed.
const VARIABLE_REGEX = /^\{\{\s*(.*?)\s*\}\}$/

export const WaitNodeContent = ({ options }: Props) => {
  const secondsToWaitFor = options?.secondsToWaitFor?.trim()

  const { isVariable, variableName } = useMemo(() => {
    if (!secondsToWaitFor) return { isVariable: false, variableName: '' }
    const match = secondsToWaitFor.match(VARIABLE_REGEX)
    if (match) {
      const extractedName = match[1]?.trim() ?? ''
      if (extractedName.length > 0) {
        return { isVariable: true, variableName: extractedName }
      }
    }
    return { isVariable: false, variableName: '' }
  }, [secondsToWaitFor])

  const { t } = useTranslate()

  // Unconfigured state
  if (!secondsToWaitFor) {
    return (
      <Text color="gray.500" noOfLines={1}>
        {t('blocks.logic.wait.configure.label')}
      </Text>
    )
  }

  // Variable-based wait
  if (isVariable) {
    return (
      <Text noOfLines={1}>
        {t('blocks.logic.wait.prefix')}{' '}
        <chakra.span
          bgColor="orange.400"
          color="white"
          rounded="md"
          py="0.5"
          px="1"
        >
          {variableName}
        </chakra.span>{' '}
        {t('blocks.logic.wait.seconds')}
      </Text>
    )
  }

  // Static seconds value
  return (
    <Text noOfLines={1}>
      {t('blocks.logic.wait.prefix')} {secondsToWaitFor}{' '}
      {t('blocks.logic.wait.seconds')}
    </Text>
  )
}
