import React, { useState, useEffect, useLayoutEffect } from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { useTypebot } from 'contexts/TypebotContext'
import {
  ConversationTagOptions
} from 'models'
import { OptionType } from 'components/octaComponents/OctaSelect/OctaSelect.type'

type Props = {
  onSelect: (option: ConversationTagOptions) => void,
  tag?: string
}

export const ConversationTagSelect = ({ onSelect, tag }: Props) => {

  //const [itemsToTags, setItemsToTags] = useState<Array<OptionType>>([])
  //const [defaultSelected, setDefaultSelected] = useState<OptionType>();

  /*useEffect(() => {
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
      setItemsToTags(items);
    }
    return () => {
      setItemsToTags([])
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
  }, [octaGroups, selectedUserGroup])*/

  const handleOnChange = (selected: any): void => {
    onSelect(selected)
  }

  return (
    <OctaSelect
      placeholder="Não tageado"
      //defaultSelected={defaultSelected}
      findable
      //options={itemsToTags}
      onChange={handleOnChange}
    />
  )
}
