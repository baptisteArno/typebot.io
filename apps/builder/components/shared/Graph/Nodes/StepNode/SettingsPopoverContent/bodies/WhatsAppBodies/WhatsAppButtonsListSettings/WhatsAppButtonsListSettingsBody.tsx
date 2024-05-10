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
import { TextBubbleContent, Variable, WhatsAppButtonsListOptions } from 'models'
import React, { useState } from 'react'
import { TextBubbleEditor } from 'components/shared/Graph/Nodes/StepNode/TextBubbleEditor'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { SlArrowDown, SlArrowUp } from 'react-icons/sl'
import { AssignToResponsibleSelect } from '../../AssignToTeam/AssignToResponsibleSelect'

type WhatsAppButtonsListSettingsBodyProps = {
  options: WhatsAppButtonsListOptions
  onOptionsChange: (options: WhatsAppButtonsListOptions) => void
}

export const WhatsAppButtonsListSettingsBody = ({
  options,
  onOptionsChange,
}: WhatsAppButtonsListSettingsBodyProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [value, setValue] = useState({
    header: '',
    body: '',
    footer: '',
  })
  const MAX_LENGHT_HEADER_AND_FOOTER = 60
  const MAX_LENGHT_BODY = 1024
  const handleVariableChange = (variable: Variable) => {
    onOptionsChange({
      ...options,
      property: {
        domain: variable.domain,
        name: variable.name,
        type: variable.type ? variable.type : 'string',
        token: variable.token,
      },
      variableId: variable.id,
    })
  }

  const handleHeaderText = (content: any) => {
    const updateHeaderText = { header: content.plainText }
    setValue((value) => ({
      ...value,
      ...updateHeaderText,
    }))
    onOptionsChange({
      ...options,
      header: {
        content,
      },
    })
  }

  const handleBodyText = (content: any) => {
    const updateBodyText = { body: content.plainText }
    setValue((value) => ({
      ...value,
      ...updateBodyText,
    }))
    onOptionsChange({
      ...options,
      body: {
        content,
      },
    })
  }

  const handleFooterText = (content: any) => {
    const updateFooterText = { footer: content.plainText }
    setValue((value) => ({
      ...value,
      ...updateFooterText,
    }))
    onOptionsChange({
      ...options,
      footer: {
        content,
      },
    })
  }

  const handleFallBackMessage = (content: TextBubbleContent, index: number) => {
    if (!options) return
    if (!options?.fallbackMessages) options.fallbackMessages = []

    if (options.fallbackMessages.length > index)
      options.fallbackMessages[index] = content
    else options.fallbackMessages.push(content)

    onOptionsChange({
      ...options,
    })
  }

  const fallbackMessageComponent = (
    message: TextBubbleContent,
    index: string
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
          maxLength={MAX_LENGHT_BODY}
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
          <FormLabel mb="0" htmlFor="button">
            Texto do cabeçalho
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {value?.header?.length ?? 0}/{MAX_LENGHT_HEADER_AND_FOOTER}
          </FormLabel>
        </Flex>

        <TextBubbleEditor
          onClose={handleHeaderText}
          initialValue={
            options.header?.content ? options.header.content.richText : []
          }
          onKeyUp={handleHeaderText}
          maxLength={MAX_LENGHT_HEADER_AND_FOOTER}
        />
      </Stack>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="button">
            Texto do corpo da mensagem
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {value?.body?.length ?? 0}/{MAX_LENGHT_BODY}
          </FormLabel>
        </Flex>
        <TextBubbleEditor
          required
          onClose={handleBodyText}
          initialValue={
            options.body?.content ? options.body.content.richText : []
          }
          onKeyUp={handleBodyText}
          maxLength={MAX_LENGHT_BODY}
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
            onClose={(content) => handleFallBackMessage(content, 0)}
            initialValue={[]}
            onKeyUp={(content) => handleFallBackMessage(content, 0)}
          />
        ))}
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="button">
            Texto do rodapé
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {value?.footer?.length ?? 0}/{MAX_LENGHT_HEADER_AND_FOOTER}
          </FormLabel>
        </Flex>
        <TextBubbleEditor
          onClose={handleFooterText}
          initialValue={
            options.footer?.content ? options.footer.content.richText : []
          }
          onKeyUp={handleFooterText}
          maxLength={MAX_LENGHT_HEADER_AND_FOOTER}
        />
      </Stack>
      <Stack>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
