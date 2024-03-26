import { Flex, FormLabel, Spacer, Stack, Text } from '@chakra-ui/react'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { AssignToTeamOptions, TextBubbleContent } from 'models'
import React, { useEffect, useState } from 'react'
import { AutoAssignToSelect } from './AutoAssignToSelect'
import { AssignToResponsibleSelect } from './AssignToResponsibleSelect'
import { TextBubbleEditor } from '../../../TextBubbleEditor'
import { ASSIGN_TO } from 'enums/assign-to'
import { useUser } from 'contexts/UserContext'

type AssignToTeamSettingsBodyProps = {
  options: AssignToTeamOptions
  onOptionsChange: (options: AssignToTeamOptions) => void
}

const MAX_LENGHT_TEXT = 500

export const AssignToTeamSettingsBody = ({
  options,
  onOptionsChange,
}: AssignToTeamSettingsBodyProps) => {
  const { verifyFeatureToggle } = useUser()

  const [autoAssignToTitle, setAutoAssignToTitle] = useState<string>(
    'Atribuir automaticamente para:'
  )
  const [hasResponsibleContact, setHasResponsibleContact] =
    useState<boolean>(false)
  useEffect(() => {
    const responsibleContactEnabled = verifyFeatureToggle(
      'responsible-contact-enabled'
    )
    setHasResponsibleContact(responsibleContactEnabled)
    if (responsibleContactEnabled) {
      setAutoAssignToTitle(
        'Se não houver um responsável pelo contato, atribuir para:'
      )
    }
  }, [])

  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    onOptionsChange({
      ...options,
      messages: {
        ...options.messages,
        firstMessage: {
          content,
        },
      },
    })
  }
  const handleCloseEditorConnectionMessage = (content: TextBubbleContent) => {
    onOptionsChange({
      ...options,
      messages: {
        ...options.messages,
        connectionSuccess: {
          content,
        },
      },
    })
  }
  const handleCloseEditorUnavailability = (content: TextBubbleContent) => {
    onOptionsChange({
      ...options,
      messages: {
        ...options.messages,
        noAgentAvailable: {
          content,
        },
      },
    })
  }
  const handleDefaultAssignToChange = (e: any) => {
    const option = e

    onOptionsChange({
      ...options,
      ...option,
    })
  }
  const handleAssignToResponsibleChange = (e: any) => {
    onOptionsChange({
      ...options,
      subType: e.value?.subType,
    })
  }
  const handleCheckAvailabilityChange = (isAvailable: boolean) =>
    onOptionsChange({ ...options, isAvailable })

  return (
    <Stack spacing={4}>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="placeholder">
            Mensagem do bot
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {options.messages.firstMessage?.content?.plainText.length ?? 0}/
            {MAX_LENGHT_TEXT}
          </FormLabel>
        </Flex>
        (
        <TextBubbleEditor
          maxLength={500}
          onClose={handleCloseEditorBotMessage}
          initialValue={
            options.messages.firstMessage?.content
              ? options.messages.firstMessage.content.richText
              : []
          }
          onKeyUp={handleCloseEditorBotMessage}
        />
        )
      </Stack>
      {hasResponsibleContact && (
        <Stack>
          <FormLabel mb="0" htmlFor="button">
            Atribuir conversa para:
          </FormLabel>
          <AssignToResponsibleSelect
            onSelect={handleAssignToResponsibleChange}
          />
        </Stack>
      )}
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          {autoAssignToTitle}
        </FormLabel>
        <AutoAssignToSelect
          selectedUserGroup={options.assignTo || ASSIGN_TO.noOne}
          onSelect={handleDefaultAssignToChange}
        />
      </Stack>
      <Stack>
        <Flex>
          <FormLabel mb="0" htmlFor="placeholder">
            Mensagem de conexão
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {options.messages.connectionSuccess?.content?.plainText.length ?? 0}
            /{MAX_LENGHT_TEXT}
          </FormLabel>
        </Flex>
        (
        <TextBubbleEditor
          maxLength={MAX_LENGHT_TEXT}
          onClose={handleCloseEditorConnectionMessage}
          initialValue={
            options.messages.connectionSuccess?.content
              ? options.messages.connectionSuccess.content.richText
              : []
          }
          onKeyUp={handleCloseEditorConnectionMessage}
        />
        )
      </Stack>
      <SwitchWithLabel
        id="switch"
        label="Verificar disponibilidade dos usuários"
        initialValue={options?.isAvailable ?? false}
        onCheckChange={handleCheckAvailabilityChange}
      />
      {options.isAvailable && (
        <Stack>
          <Flex>
            <FormLabel mb="0" htmlFor="placeholder">
              Mensagem de indisponibilidade
            </FormLabel>
            <Spacer />
            <FormLabel mb="0" htmlFor="button">
              {options.messages.noAgentAvailable?.content?.plainText.length ??
                0}
              /{MAX_LENGHT_TEXT}
            </FormLabel>
          </Flex>
          <TextBubbleEditor
            maxLength={MAX_LENGHT_TEXT}
            onClose={handleCloseEditorUnavailability}
            initialValue={
              options.messages.noAgentAvailable?.content
                ? options.messages.noAgentAvailable.content.richText
                : []
            }
            onKeyUp={handleCloseEditorUnavailability}
          />
          <Text color="gray.400" fontSize="sm">
            Não se esqueça de dizer qual componente seguirá esse caminho na
            árvore.
          </Text>
        </Stack>
      )}
    </Stack>
  )
}
