import { FormLabel, Stack } from '@chakra-ui/react'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { Input } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { InputOptions, TextBubbleContent, TextInputOptions, Variable } from 'models'
import React from 'react'
import { TextBubbleEditor } from '../../TextBubbleEditor'
import { useTypebot } from 'contexts/TypebotContext'

type InputSettingBodyProps = {
  step: {
    type: string,
    options: InputOptions
  }
  onOptionsChange: (options: InputOptions) => void
}

export const InputSettingBody = ({
  step,
  onOptionsChange,
}: InputSettingBodyProps) => {
  const { typebot } = useTypebot()

  const handleVariableChange = (variable: Variable) => {
    if (variable) {
      onOptionsChange({
        ...step.options, variableId: variable?.id, property: {
          domain: "CHAT",
          name: variable.name,
          type: variable.type ? variable.type : "string",
          token: variable.token
        }
      })
    } else {
      onOptionsChange({
        ...step.options, variableId: undefined
      })
    }
  }

  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    onOptionsChange({
      ...step.options,
      message: content
    })
  }

  const handleFallBackMessage = (content: TextBubbleContent, index: number) => {
    if (!step.options.fallbackMessages)
      step.options.fallbackMessages = []

    if (step.options.fallbackMessages.length > index)
      step.options.fallbackMessages[index] = content
    else
      step.options.fallbackMessages.push(content)

    onOptionsChange({
      ...step.options
    })
  }

  if (!step.options.variableId && step.options.initialVariableToken) {
    let myVariable = typebot?.variables?.find(v => v.token === step.options.initialVariableToken)
    if (myVariable) {
      step.options.variableId = myVariable.id
      handleVariableChange(myVariable)
    }
  }

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
            step.options.message
              ? step.options.message.richText
              : []
          }
          onKeyUp={handleCloseEditorBotMessage}
        />
        )
      </Stack>
      <Stack>
        <VariableSearchInput
          initialVariableId={step.options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
      {step.options.useFallback &&
        (
          step.options.fallbackMessages?.length ?
            step.options.fallbackMessages.map((message, index) =>
            (
              <>
                <FormLabel mb="0" htmlFor="placeholder">
                  Mensagem para resposta inválida - Tentativa {index + 1}
                </FormLabel>
                <TextBubbleEditor
                  increment={1}
                  onClose={(content) => handleFallBackMessage(content, index)}
                  initialValue={
                    message
                      ? message.richText
                      : []
                  }
                  onKeyUp={(content) => handleFallBackMessage(content, index)}
                />

              </>
            )) :
            <TextBubbleEditor
              increment={1}
              onClose={(content) => handleFallBackMessage(content, 0)}
              initialValue={[]}
              onKeyUp={(content) => handleFallBackMessage(content, 0)}
            />
        )}
    </Stack>
  )
}
