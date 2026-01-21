import React, { useEffect } from 'react'
import { useTranslate } from '@tolgee/react'
import { Stack, Text } from '@chakra-ui/react'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { Variable } from '@typebot.io/schemas'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { createId } from '@paralleldrive/cuid2'
import { VALIDATION_RESULT_VARIABLES } from '@typebot.io/bot-engine/blocks/logic/validation/constants'

type BaseOptions = {
  inputVariableId?: string
  outputVariableId?: string
  removeFormatting?: boolean
}

type Props<T extends BaseOptions> = {
  options: T | undefined
  onOptionsChange: (options: T) => void
  documentType: 'cpf' | 'cnpj'
}

export const DocumentValidationSettings = <T extends BaseOptions>({
  options,
  onOptionsChange,
  documentType,
}: Props<T>) => {
  const { t } = useTranslate()
  const { typebot, createVariable } = useTypebot()

  const handleInputVariableChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      inputVariableId: variable?.id,
      removeFormatting: options?.removeFormatting ?? true,
    } as T)
  }

  const handleOutputVariableChange = (variable?: Variable) => {
    onOptionsChange({
      ...options,
      outputVariableId: variable?.id,
      removeFormatting: options?.removeFormatting ?? true,
    } as T)
  }

  const handleRemoveFormattingChange = (removeFormatting: boolean) => {
    onOptionsChange({ ...options, removeFormatting } as T)
  }

  const resultVariableName =
    documentType === 'cpf'
      ? VALIDATION_RESULT_VARIABLES.CPF
      : VALIDATION_RESULT_VARIABLES.CNPJ

  // Auto-create validation result variable
  useEffect(() => {
    if (typebot?.variables) {
      const existingVariable = typebot.variables.find(
        (v) => v.name === resultVariableName
      )

      if (!existingVariable) {
        const id = 'v' + createId()
        createVariable({
          id,
          name: resultVariableName,
          isSessionVariable: true,
        })
      }
    }
  }, [typebot?.variables, resultVariableName, createVariable])

  return (
    <Stack spacing={4}>
      <Text fontWeight="semibold">
        {t(
          `blocks.logic.validate${
            documentType.charAt(0).toUpperCase() + documentType.slice(1)
          }.configure.label`
        )}
      </Text>

      <Stack>
        <Text fontSize="sm">
          {t(
            `blocks.logic.validate${
              documentType.charAt(0).toUpperCase() + documentType.slice(1)
            }.inputVariable.label`
          )}
        </Text>
        <VariableSearchInput
          initialVariableId={options?.inputVariableId}
          onSelectVariable={handleInputVariableChange}
          placeholder={t(
            `blocks.logic.validate${
              documentType.charAt(0).toUpperCase() + documentType.slice(1)
            }.inputPlaceholder`
          )}
        />
      </Stack>

      <Stack>
        <Text fontSize="sm" color="green.600">
          {t(
            `blocks.logic.validate${
              documentType.charAt(0).toUpperCase() + documentType.slice(1)
            }.autoCreatedVariable`
          )}{' '}
          <strong>{resultVariableName}</strong>
        </Text>
        <Text fontSize="xs" color="gray.500">
          {t(
            `blocks.logic.validate${
              documentType.charAt(0).toUpperCase() + documentType.slice(1)
            }.${
              documentType === 'cnpj'
                ? 'manualVariableDescription'
                : 'variableDescription'
            }`
          )}
        </Text>
      </Stack>

      <Stack>
        <Text fontSize="sm">
          {t(
            `blocks.logic.validate${
              documentType.charAt(0).toUpperCase() + documentType.slice(1)
            }.outputVariable.label`
          )}
        </Text>
        <VariableSearchInput
          initialVariableId={options?.outputVariableId}
          onSelectVariable={handleOutputVariableChange}
          placeholder={t(
            `blocks.logic.validate${
              documentType.charAt(0).toUpperCase() + documentType.slice(1)
            }.outputPlaceholder`
          )}
        />
      </Stack>

      <SwitchWithLabel
        label={t(
          `blocks.logic.validate${
            documentType.charAt(0).toUpperCase() + documentType.slice(1)
          }.removeFormatting.label`
        )}
        initialValue={options?.removeFormatting ?? true}
        onCheckChange={handleRemoveFormattingChange}
      />
    </Stack>
  )
}
