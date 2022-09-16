import { FormLabel, Stack } from '@chakra-ui/react'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import {
  AssignToTeamOptions,
  TextBubbleContent
} from 'models'
import React from 'react'
import { AutoAssignToSelect } from './AutoAssignToSelect'
import { TextBubbleEditor } from '../../../TextBubbleEditor'

type AssignToTeamSettingsBodyProps = {
  options: AssignToTeamOptions
  onOptionsChange: (options: AssignToTeamOptions) => void
}

export const AssignToTeamSettingsBody = ({
  options,
  onOptionsChange
}: AssignToTeamSettingsBodyProps) => {
  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    onOptionsChange({
      ...options,
      messages: {
        ...options.messages,
        firstMessage: {
          content
        }
      },
    })
  }
  const handleCloseEditorConnectionMessage = (content: TextBubbleContent) => {
    onOptionsChange({
      ...options,
      messages: {
        ...options.messages,
        connectionSuccess: {
          content
        }
      },
    })
  }
  const handleCloseEditorUnavailability = (content: TextBubbleContent) => {
    onOptionsChange({
      ...options,
      messages: {
        ...options.messages,
        noAgentAvailable: {
          content
        }
      },
    })
  }
  const handleDefaultAssignToChange = (option: AssignToTeamOptions) =>
    {
      onOptionsChange({
        ...options,
        assignTo: option.assignTo,
        assignType: option.assignType
      })
    }
  const handleCheckAvailabilityChange = (isAvailable: boolean) =>
    onOptionsChange({ ...options, isAvailable })
  const handleRedirectWhenNoneAvailable = (shouldRedirectNoneAvailable: boolean) => {
    onOptionsChange({ ...options, shouldRedirectNoneAvailable })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Mensagem do bot
        </FormLabel>
        (
        <TextBubbleEditor
          onClose={handleCloseEditorBotMessage}
          initialValue={options.messages.firstMessage?.content ? options.messages.firstMessage.content.richText : []}
          onKeyUp={handleCloseEditorBotMessage}
        />
        )
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Atribuir automaticamente para:
        </FormLabel>
        <AutoAssignToSelect
          selectedUserGroup={options.assignTo ? options.assignTo : ''}
          onSelect={handleDefaultAssignToChange}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Mensagem de conexão
        </FormLabel>
        (
        <TextBubbleEditor
          onClose={handleCloseEditorBotMessage}
          initialValue={options.messages.connectionSuccess?.content ? options.messages.connectionSuccess.content.richText : []}
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
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Mensagem de indisponibilidade
        </FormLabel>
        (
        <TextBubbleEditor
          onClose={handleCloseEditorBotMessage}
          initialValue={options.messages.noAgentAvailable?.content ? options.messages.noAgentAvailable.content.richText : []}
          onKeyUp={handleCloseEditorUnavailability}
        />
        )
      </Stack>
      <SwitchWithLabel
        id="switch"
        label="Redirecionar quando não houver usuários?"
        initialValue={options?.shouldRedirectNoneAvailable ?? false}
        onCheckChange={handleRedirectWhenNoneAvailable}
      />
    </Stack>
  )
}
