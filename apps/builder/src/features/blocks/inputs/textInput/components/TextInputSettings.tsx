import { RichTextCaptionEditor } from '@/components/RichTextCaptionEditor'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormLabel, Stack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { TextInputBlock, Variable } from '@typebot.io/schemas'
import { defaultTextInputOptions } from '@typebot.io/schemas/features/blocks/inputs/text/constants'
import { TElement } from '@udecode/plate-common'
import React from 'react'
import { convertRichTextToPlainText } from '../helpers/convertRichTextToPlainText'

type Props = {
  blockId: string
  options: TextInputBlock['options']
  onOptionsChange: (options: TextInputBlock['options']) => void
}

export const TextInputSettings = ({
  blockId,
  options,
  onOptionsChange,
}: Props) => {
  const { t } = useTranslate()

  const updatePlaceholder = (richTextPlaceholder: TElement[]) =>
    onOptionsChange({
      ...options,
      labels: {
        ...options?.labels,
        richTextPlaceholder,
        placeholder: convertRichTextToPlainText(richTextPlaceholder),
      },
    })

  const updateVariableId = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  const initialPlaceholder: TElement[] =
    options?.labels?.richTextPlaceholder ??
    (options?.labels?.placeholder ?? defaultTextInputOptions.labels.placeholder
      ? [
          {
            type: 'p',
            children: [
              {
                text:
                  options?.labels?.placeholder ??
                  defaultTextInputOptions.labels.placeholder,
              },
            ],
          },
        ]
      : [])

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Text fontSize="sm" fontWeight="medium">
          {t('blocks.inputs.text.settings.placeholder.label')}
        </Text>
        <RichTextCaptionEditor
          id={`text-input-placeholder-${blockId}`}
          initialValue={initialPlaceholder}
          onChange={updatePlaceholder}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t('blocks.inputs.settings.saveAnswer.label')}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={updateVariableId}
        />
      </Stack>
    </Stack>
  )
}
