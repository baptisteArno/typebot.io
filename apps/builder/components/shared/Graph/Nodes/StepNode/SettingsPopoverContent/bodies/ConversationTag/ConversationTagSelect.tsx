import React, { useState, useLayoutEffect } from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { useTypebot } from 'contexts/TypebotContext'
import { ConversationTagOptions } from 'models'
import { OptionType } from 'components/octaComponents/OctaSelect/OctaSelect.type'

type Props = {
  onSelect: (option: ConversationTagOptions) => void
  selectedTag?: string
}

export const ConversationTagSelect = ({ onSelect, selectedTag }: Props) => {
  const { tagsList } = useTypebot();
  const [defaultSelected, setDefaultSelected] = useState<OptionType>()

  const handleOnChange = (selected: any): void => {
    onSelect(selected)
  }

  useLayoutEffect(() => {
    if (tagsList && selectedTag) {
      const defaultSelectedTag = tagsList.filter((item) => item.id === selectedTag)[0];
      if(defaultSelectedTag){
        setDefaultSelected({
          label: defaultSelectedTag.name,
          value: {
            tagId: defaultSelectedTag.id
          },
          key: ''
        })
      }
    }
    return () => {
      setDefaultSelected(undefined)
    };
  }, [tagsList, selectedTag])

  return (
    <OctaSelect
      placeholder="Selecione uma tag"
      defaultSelected={defaultSelected}
      findable
      options={tagsList}
      onChange={handleOnChange}
    />
  )
}
