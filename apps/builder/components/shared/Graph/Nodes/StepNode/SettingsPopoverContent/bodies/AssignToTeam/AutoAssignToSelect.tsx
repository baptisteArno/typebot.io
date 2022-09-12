import { Select } from '@chakra-ui/react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { OptionItem } from 'components/octaComponents/OctaSelect/OctaSelect.type'
import { useTypebot } from 'contexts/TypebotContext'
import React, { ChangeEvent, MouseEvent } from 'react'
import { OptionAgentGroup } from './AssignToSelect.style'

type Props = {
  teamId?: string
  onSelect: (teamId: string) => void
}

export const AutoAssignToSelect = ({ teamId, onSelect }: Props) => {
  const { octaAgents } = useTypebot()

  const handleOnChange = (e: any): void => {
    onSelect('')
  }
  return (
    <OctaSelect
      placeholder="Não atribuir (Visível a todos)"
      items={octaAgents.map((agentGroup) => ({
        label: agentGroup.name,
        value: agentGroup.id,
        isTitle: agentGroup.isTitle,
      }))}
      onChange={handleOnChange}
    />
  )
}
