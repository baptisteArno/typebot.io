import { FormLabel, Stack } from '@chakra-ui/react'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { ChoiceInputOptions, TextBubbleContent, Variable } from 'models'
import React from 'react'
import { TextBubbleEditor } from '../../TextBubbleEditor'
import { FooterMessage } from 'components/shared/buttons/UploadButton.style'

type ChoiceInputSettingsBodyProps = {
  options?: ChoiceInputOptions
  onOptionsChange: (options: ChoiceInputOptions) => void
}

export const ChoiceInputSettingsBody = ({
  options,
  onOptionsChange,
}: ChoiceInputSettingsBodyProps) => {
  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    if (options) {
      onOptionsChange({
        ...options,
        message: content
      })
    }
  }

  const handleVariableChange = (variable?: Variable) =>
    options && onOptionsChange({ ...options, variableId: variable?.id })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Texto da pergunta:
        </FormLabel>
        (
        <TextBubbleEditor
          increment={1}
          onClose={handleCloseEditorBotMessage}
          initialValue={
            options?.message
              ? options.message.richText
              : []
          }
          onKeyUp={handleCloseEditorBotMessage}
        />
        )
      </Stack>
      <FooterMessage>
        Edite as opções que enviaremos com essa pergunta diretamente na árvore ;)
      </FooterMessage>
      <Stack>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
      <FooterMessage>
        Edite as opções diretamente na árvore.
      </FooterMessage>
    </Stack>
  )
}
