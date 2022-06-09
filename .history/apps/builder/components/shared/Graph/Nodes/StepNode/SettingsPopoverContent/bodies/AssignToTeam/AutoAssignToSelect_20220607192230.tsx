import { Select } from '@chakra-ui/react'
import React, { ChangeEvent } from 'react'
import {
  agents
} from 'services/typebots/Agents'

type Props = {
  teamId?: string
  onSelect: (teamId: string) => void
}

export const AutoAssignToSelect = ({ teamId, onSelect }: Props) => {
  const handleOnChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value)
  }
  return (
    <Select
      placeholder="Não atribuir (Visível a todos)"
      value={teamId}
      onChange={handleOnChange}
    >
      <option value="1">Willian</option>
      <option value="2">Willian 2</option>
    </Select>
  )
}
