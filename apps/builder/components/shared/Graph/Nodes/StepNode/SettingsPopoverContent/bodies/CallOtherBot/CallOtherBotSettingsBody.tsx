import { FormLabel, Stack } from '@chakra-ui/react'
import { CallOtherBotOptions } from 'models'
import React from 'react'
import { CallOtherBotSelect } from './CallOtherBotSelect'

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
      botToCall: e.fluxId
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
