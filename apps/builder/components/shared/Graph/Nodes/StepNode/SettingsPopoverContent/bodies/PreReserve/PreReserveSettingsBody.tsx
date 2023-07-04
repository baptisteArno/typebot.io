import { FormLabel, Stack } from '@chakra-ui/react'
import { PreReserveOptions } from 'models'
import React from 'react'
import { AutoAssignToSelect } from './PreReserveGroupSelect'
import { ASSIGN_TO } from 'enums/assign-to'

type PreReserveSettingsBodyProps = {
  options: PreReserveOptions
  onOptionsChange: (options: PreReserveOptions) => void
}

export const PreReserveSettingsBody = ({
  options,
  onOptionsChange,
}: PreReserveSettingsBodyProps) => {
  const handleDefaultAssignToChange = (e: any) => {
    const option = e

    onOptionsChange({
      ...options,
      ...option,
    })
  }
  
  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Reservar conversa para o grupo:
        </FormLabel>
        (
        <AutoAssignToSelect
          selectedUserGroup={options.assignTo || ASSIGN_TO.noOne}
          onSelect={handleDefaultAssignToChange}
        />
      </Stack>
    </Stack>
  )
}
