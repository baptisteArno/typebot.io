import { FormLabel, Stack } from '@chakra-ui/react'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { CallOtherBotOptions, TextBubbleContent } from 'models'
import React, { useEffect, useState } from 'react'
import { CallOtherBotSelect } from './CallOtherBotSelect'
import { TextBubbleEditor } from '../../../TextBubbleEditor'
import { ASSIGN_TO } from 'enums/assign-to'
import { useUser } from 'contexts/UserContext'

type CallOtherBotSettingsBodyProps = {
  options: CallOtherBotOptions
  onOptionsChange: (options: CallOtherBotOptions) => void
}

export const CallOtherBotSettingsBody = ({
  options,
  onOptionsChange,
}: CallOtherBotSettingsBodyProps) => {

  const handleCallOtherBotChange = (e: any) => {
    onOptionsChange({
      ...options,
      botToCall: e.fluxId,
    })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Selecione o bot quer você quer chamar:
        </FormLabel>
        <CallOtherBotSelect selectedBot={options.botToCall} onSelect={handleCallOtherBotChange} />
      </Stack>
    </Stack>
  )
}
