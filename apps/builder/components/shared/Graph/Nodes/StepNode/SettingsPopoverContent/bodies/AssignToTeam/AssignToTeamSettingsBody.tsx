import { FormLabel, Stack } from '@chakra-ui/react'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import {
  AssignToTeamOptions,
  TextBubbleContent
} from 'models'
import React, { useEffect, useState } from 'react'
import { AutoAssignToSelect } from './AutoAssignToSelect'
import { TextBubbleEditor } from '../../../TextBubbleEditor'

type AssignToTeamSettingsBodyProps = {
  options: AssignToTeamOptions
  onOptionsChange: (options: AssignToTeamOptions) => void
}

export const AssignToTeamSettingsBody = ({
  options,
  onOptionsChange,
}: AssignToTeamSettingsBodyProps) => {
  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    console.log('handleCloseEditorBotMessage')
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
    console.log('handleCloseEditorConnectionMessage')
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
    console.log('handleCloseEditorUnavailability')
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
  const handleDefaultAssignToChange = (assignTo: string) =>
    onOptionsChange({ ...options, assignTo })
  const handleCheckAvailabilityChange = (isAvailable: boolean) =>
    onOptionsChange({ ...options, isAvailable })

  // useEffect(() => {
  //   // Update the document title using the browser API
  //   document.title = `You clicked times`;
  // });
  const [data, setData] = useState('');

  const textBubbleToAssign = (assignData: string): string => {
    console.log(assignData)

    return assignData
  }
  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Mensagem do bot
        </FormLabel>
        (
        <TextBubbleEditor
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
          onSelect={handleDefaultAssignToChange}
          teamId={options.assignTo}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Mensagem de conexão
        </FormLabel>
        (
        <TextBubbleEditor
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
          initialValue={options.messages.noAgentAvailable?.content ? options.messages.noAgentAvailable.content.richText : []}
          onKeyUp={handleCloseEditorUnavailability}
        />
        )
      </Stack>
      <SwitchWithLabel
        id="switch"
        label="Redirecionar quando não houver usuários?"
        initialValue={options?.isAvailable ?? false}
        onCheckChange={handleCheckAvailabilityChange}
      />
    </Stack>
  )
}
