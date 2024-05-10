import {
  Box,
  Button,
  Collapse,
  Flex,
  FormLabel,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { InputOptions, TextBubbleContent, Variable } from 'models'
import React from 'react'
import { TextBubbleEditor } from '../../TextBubbleEditor'
import { useTypebot } from 'contexts/TypebotContext'
import { SlArrowDown, SlArrowUp } from 'react-icons/sl'
import { AssignToResponsibleSelect } from './AssignToTeam/AssignToResponsibleSelect'

type InputSettingBodyProps = {
  step: {
    type: string
    options: InputOptions
  }
  onOptionsChange: (options: InputOptions) => void
}

const MAX_LENGHT_TEXTS_QUESTION = 500

export const InputSettingBody = ({
  step,
  onOptionsChange,
}: InputSettingBodyProps) => {
  const { typebot } = useTypebot()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const handleVariableChange = (variable: Variable) => {
    if (variable) {
      onOptionsChange({
        ...step.options,
        variableId: variable?.id,
        property: {
          domain: 'CHAT',
          name: variable.name,
          type: variable.type ? variable.type : 'string',
          token: variable.token,
        },
      })
    } else {
      onOptionsChange({
        ...step.options,
        variableId: undefined,
      })
    }
  }

  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    onOptionsChange({
      ...step.options,
      message: content,
    })
  }

  const handleFallBackMessage = (content: TextBubbleContent, index: number) => {
    if (!step.options.fallbackMessages) step.options.fallbackMessages = []

    if (step.options.fallbackMessages.length > index)
      step.options.fallbackMessages[index] = content
    else step.options.fallbackMessages.push(content)

    onOptionsChange({
      ...step.options,
    })
  }

  if (!step.options.variableId && step.options.initialVariableToken) {
    const myVariable = typebot?.variables?.find(
      (v) => v.token === step.options.initialVariableToken
    )
    if (myVariable) {
      step.options.variableId = myVariable.id
      handleVariableChange(myVariable)
    }
  }

  const onAssign = (v) => {
    onOptionsChange({
      ...step.options,
      ...v,
    })
  }

  const fallbackMessageComponent = (
    message: TextBubbleContent,
    index: number
  ) => {
    return (
      <Box>
        <FormLabel mb="0" htmlFor="placeholder">
          Mensagem para resposta inválida - Tentativa {index + 1}
        </FormLabel>
        <TextBubbleEditor
          required={{
            errorMsg: `O campo "Mensagem para resposta inválida - Tentativa ${
              index + 1
            }" é obrigatório`,
          }}
          onClose={(content) => handleFallBackMessage(content, index)}
          initialValue={message ? message.richText : []}
          onKeyUp={(content) => handleFallBackMessage(content, index)}
          maxLength={MAX_LENGHT_TEXTS_QUESTION}
        />
      </Box>
    )
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="placeholder">
            Texto da pergunta
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {step?.options?.message?.plainText?.length ?? 0}/
            {MAX_LENGHT_TEXTS_QUESTION}
          </FormLabel>
        </Flex>
        (
        <TextBubbleEditor
          required={{ errorMsg: 'O campo "Texto da pergunta" é obrigatório' }}
          onClose={handleCloseEditorBotMessage}
          initialValue={
            step.options.message ? step.options.message.richText : []
          }
          onKeyUp={handleCloseEditorBotMessage}
          maxLength={MAX_LENGHT_TEXTS_QUESTION}
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
        (step.options.fallbackMessages?.length ? (
          <>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Text>Se o cliente não responder com nenhuma das opções:</Text>
              <Button
                background={'transparent'}
                onClick={() => setIsCollapsed((v) => !v)}
              >
                {isCollapsed ? <SlArrowDown /> : <SlArrowUp />}
              </Button>
            </Flex>
            <Collapse in={isCollapsed}>
              <Flex direction={'column'} gap={4}>
                {step.options?.fallbackMessages.map((message, index) =>
                  fallbackMessageComponent(message, index)
                )}
                <Box>
                  <FormLabel mb="0" htmlFor="placeholder">
                    Se o cliente errar 3 vezes seguidas, atribuir conversa para:
                  </FormLabel>
                  <AssignToResponsibleSelect
                    hasResponsibleContact={false}
                    options={step?.options}
                    onSelect={onAssign}
                  />
                </Box>
              </Flex>
            </Collapse>
          </>
        ) : (
          <TextBubbleEditor
            onClose={(content) => handleFallBackMessage(content, 0)}
            initialValue={[]}
            onKeyUp={(content) => handleFallBackMessage(content, 0)}
          />
        ))}
    </Stack>
  )
}
