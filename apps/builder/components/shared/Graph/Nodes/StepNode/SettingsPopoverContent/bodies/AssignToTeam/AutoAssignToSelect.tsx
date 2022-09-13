import { Select } from '@chakra-ui/react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { OptionItem } from 'components/octaComponents/OctaSelect/OctaSelect.type'
import { useTypebot } from 'contexts/TypebotContext'
import React, { ChangeEvent, MouseEvent } from 'react'
import { OptionAgentGroup } from './AssignToSelect.style'
import {
  AssignToTeamOptions
} from 'models'

type Props = {
  onSelect: (option: AssignToTeamOptions) => void
}

export const AutoAssignToSelect = ({ onSelect }: Props) => {
  const { octaAgents } = useTypebot()

  const handleOnChange = (e: any): void => {
    onSelect(JSON.parse(e.value))
  }
  return (
    <OctaSelect
      placeholder="Não atribuir (Visível a todos)"
      items={octaAgents.map((agentGroup) => ({
        label: agentGroup.name,
        value: {
          assignTo: agentGroup.id,
          assignType: agentGroup.operationType
        },
        isTitle: agentGroup.isTitle,
      }))}
      onChange={handleOnChange}
    />
  )
}
