import React from 'react'
import { useTranslate } from '@tolgee/react'
import { Stack, Text, Select } from '@chakra-ui/react'
import {
  NativeVariablesOptions,
  nativeVariableTypes,
} from '@typebot.io/schemas/features/blocks/inputs/nativeVariables'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { createId } from '@paralleldrive/cuid2'

type Props = {
  options: NativeVariablesOptions | undefined
  onOptionsChange: (options: NativeVariablesOptions) => void
}

export const NativeVariablesSettings = ({
  options,
  onOptionsChange,
}: Props) => {
  const { t } = useTranslate()
  const { typebot, createVariable } = useTypebot()
  const variables = typebot?.variables ?? []

  const handleNativeTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nativeType = event.target.value as
      | 'helpdeskId'
      | 'cloudChatId'
      | 'activeIntent'
      | 'channelType'
      | 'createdAt'
      | 'lastUserMessages'
      | 'messages'

    if (!nativeType) {
      onOptionsChange({
        ...options,
        nativeType: undefined,
        variableId: undefined,
      })
      return
    }

    let variableId: string | undefined
    const existingVariable = variables.find((v) => v.name === nativeType)

    if (existingVariable) {
      variableId = existingVariable.id
    } else {
      variableId = 'v' + createId()
      createVariable({
        id: variableId,
        name: nativeType,
        isSessionVariable: true,
      })
    }

    onOptionsChange({
      ...options,
      nativeType,
      variableId,
    })
  }

  return (
    <Stack spacing={4}>
      <Text fontWeight="semibold">
        {t('blocks.inputs.nativeVariables.settings.title')}
      </Text>

      <Stack>
        <Text fontSize="sm">
          {t('blocks.inputs.nativeVariables.settings.typeLabel')}
        </Text>
        <Select
          value={options?.nativeType || 'helpdeskId'}
          onChange={handleNativeTypeChange}
          placeholder={t(
            'blocks.inputs.nativeVariables.settings.selectTypePlaceholder'
          )}
        >
          {nativeVariableTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </Stack>

      {options?.nativeType && (
        <Stack>
          <Text fontSize="sm" color="gray.600">
            {t('blocks.inputs.nativeVariables.settings.variableCreated')}{' '}
            <strong>{`{${options.nativeType}}`}</strong>
          </Text>
          <Text fontSize="xs" color="gray.500">
            {t('blocks.inputs.nativeVariables.settings.sourceLabel')}:{' '}
            {
              nativeVariableTypes.find((t) => t.value === options.nativeType)
                ?.label
            }
          </Text>
        </Stack>
      )}
    </Stack>
  )
}
