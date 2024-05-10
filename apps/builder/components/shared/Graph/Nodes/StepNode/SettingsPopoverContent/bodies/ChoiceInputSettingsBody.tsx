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
import { ChoiceInputOptions, TextBubbleContent, Variable } from 'models'
import React from 'react'
import { TextBubbleEditor } from '../../TextBubbleEditor'
import { FooterMessage } from 'components/shared/buttons/UploadButton.style'
import { SlArrowDown } from 'react-icons/sl'
import { SlArrowUp } from 'react-icons/sl'
import { AssignToResponsibleSelect } from './AssignToTeam/AssignToResponsibleSelect'

type ChoiceInputSettingsBodyProps = {
  options?: ChoiceInputOptions
  onOptionsChange: (options: ChoiceInputOptions) => void
}

const MAX_LENGHT_TEXT = 500

export const ChoiceInputSettingsBody = ({
  options,
  onOptionsChange,
}: ChoiceInputSettingsBodyProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    if (options) {
      onOptionsChange({
        ...options,
        message: content,
      })
    }
  }

  const handleFallbackMessage = (content: TextBubbleContent, index: number) => {
    if (!options) return
    if (!options?.fallbackMessages) options.fallbackMessages = []

    if (options.fallbackMessages.length > index)
      options.fallbackMessages[index] = content
    else options.fallbackMessages.push(content)

    onOptionsChange({
      ...options,
    })
  }

  const handleVariableChange = (variable?: Variable) =>
    options && onOptionsChange({ ...options, variableId: variable?.id })

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
          onClose={(content) => handleFallbackMessage(content, index)}
          initialValue={message ? message.richText : []}
          onKeyUp={(content) => handleFallbackMessage(content, index)}
          maxLength={MAX_LENGHT_TEXT}
        />
      </Box>
    )
  }

  const onAssign = (v: any) => {
    onOptionsChange({
      ...options,
      ...v,
    })
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
            {options?.message?.plainText?.length ?? 0}/{MAX_LENGHT_TEXT}
          </FormLabel>
        </Flex>
        (
        <TextBubbleEditor
          required={{ errorMsg: 'O campo "Texto da pergunta" é obrigatório' }}
          onClose={handleCloseEditorBotMessage}
          initialValue={options?.message ? options?.message.richText : []}
          onKeyUp={handleCloseEditorBotMessage}
          maxLength={MAX_LENGHT_TEXT}
        />
        )
      </Stack>
      <FooterMessage>
        Edite as opções que enviaremos com essa pergunta diretamente na árvore
        ;)
      </FooterMessage>
      <Stack>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
      {options?.useFallback &&
        (options?.fallbackMessages?.length ? (
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
                {options?.fallbackMessages.map((message, index) =>
                  fallbackMessageComponent(message, index)
                )}
                <Box>
                  <FormLabel mb="0" htmlFor="placeholder">
                    Se o cliente errar 3 vezes seguidas, atribuir conversa para:
                  </FormLabel>
                  <AssignToResponsibleSelect
                    hasResponsibleContact={false}
                    options={options}
                    onSelect={onAssign}
                  />
                </Box>
              </Flex>
            </Collapse>
          </>
        ) : (
          <TextBubbleEditor
            onClose={(content) => handleFallbackMessage(content, 0)}
            initialValue={[]}
            onKeyUp={(content) => handleFallbackMessage(content, 0)}
          />
        ))}
    </Stack>
  )
}
