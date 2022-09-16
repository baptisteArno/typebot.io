import { Select } from '@chakra-ui/react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { OptionItem } from 'components/octaComponents/OctaSelect/OctaSelect.type'
import { useTypebot } from 'contexts/TypebotContext'
import React, { ChangeEvent, MouseEvent, useEffect } from 'react'
import { OptionAgentGroup } from './AssignToSelect.style'
import {
  AssignToTeamOptions
} from 'models'

type Props = {
  onSelect: (option: AssignToTeamOptions) => void,
  selectedUserGroup: string
}

export const AutoAssignToSelect = ({ onSelect, selectedUserGroup }: Props) => {
  const { octaAgents, typebot } = useTypebot()

  useEffect(() => {
    console.log(selectedUserGroup)
  
  }, [])
  

  const handleOnChange = (e: any): void => {
    onSelect(JSON.parse(e.value))
  }
  return (
    <OctaSelect
      placeholder="Não atribuir (Visível a todos)"
      defaultValue={selectedUserGroup}
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
