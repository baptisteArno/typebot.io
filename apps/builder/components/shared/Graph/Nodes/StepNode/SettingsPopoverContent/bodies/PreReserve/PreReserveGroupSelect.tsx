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
  const { octaGroups } = useTypebot();

  const [itemsToAutoAssign, setItemsToAutoAssign] = useState<Array<OptionType>>([])
  const [defaultSelected, setDefaultSelected] = useState<OptionType>();

  useEffect(() => {
    if (octaGroups) {
      const items = octaGroups.map((agentGroup, idx) => ({
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
  }, [octaGroups]);

  useLayoutEffect(() => {
    if (octaGroups && selectedUserGroup) {
      const defaults = octaGroups.filter((item) => item.id === selectedUserGroup)[0];
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
  }, [octaGroups, selectedUserGroup])

  const handleOnChange = (selected: any): void => {
    onSelect(selected)
  }

  return (
    <OctaSelect
      placeholder="Não reservar"
      defaultSelected={defaultSelected}
      findable
      options={itemsToAutoAssign}
      onChange={handleOnChange}
    />
  )
}
