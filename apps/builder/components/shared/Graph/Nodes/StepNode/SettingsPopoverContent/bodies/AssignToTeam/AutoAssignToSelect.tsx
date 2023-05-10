import React, { useState, useEffect, useLayoutEffect } from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { useTypebot } from 'contexts/TypebotContext'
import {
  AssignToTeamOptions
} from 'models'
import { OptionType } from 'components/octaComponents/OctaSelect/OctaSelect.type'

type Props = {
  onSelect: (option: AssignToTeamOptions) => void,
  selectedUserGroup?: string
}

export const AutoAssignToSelect = ({ onSelect, selectedUserGroup }: Props) => {
  const { octaAgents } = useTypebot();

  const [itemsToAutoAssign, setItemsToAutoAssign] = useState<Array<OptionType>>([])
  const [defaultSelected, setDefaultSelected] = useState<OptionType>();

  useEffect(() => {
    if (octaAgents) {
      const items = octaAgents.map((agentGroup, idx) => ({
        label: agentGroup.name,
        value: {
          assignTo: agentGroup.id,
          assignType: agentGroup.operationType
        },
        key: idx,
        isTitle: agentGroup.isTitle,
      }))
      setItemsToAutoAssign(items);
    }
    return () => {
      setItemsToAutoAssign([])
    };
  }, [octaAgents]);

  const handleOnChange = (selected: any): void => {
    onSelect(selected)
  }

  useLayoutEffect(() => {
    if (octaAgents && selectedUserGroup) {
      const defaults = octaAgents.filter((item) => item.id === selectedUserGroup)[0];
      if(defaults){
        setDefaultSelected({
          label: defaults.name,
          value: {
            assignTo: defaults.id,
            assignType: defaults.operationType
          },
          key: ''
        })
      }
    }
    return () => {
      setDefaultSelected(undefined)
    };
  }, [octaAgents, selectedUserGroup])

  return (
    <OctaSelect
      placeholder="Não atribuir (Visível a todos)"
      defaultSelected={defaultSelected}
      findable
      options={itemsToAutoAssign}
      onChange={handleOnChange}
    />
  )
}
