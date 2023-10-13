import React, { useState, useLayoutEffect } from 'react'
import { useTypebot } from 'contexts/TypebotContext'
import { ConversationTagOptions } from 'models'
import { OptionType } from 'components/octaComponents/OctaSelect/OctaSelect.type'
import { Tag } from 'services/octadesk/tags/tags.types'
import Select from 'react-select';

type Props = {
  onSelect: (option: ConversationTagOptions) => void
  selectedTags?: Array<Tag>
}

export const ConversationTagSelect = ({ onSelect, selectedTags }: Props) => {
  const { tagsList } = useTypebot();
  const [defaultSelected, setDefaultSelected] = useState<Array<OptionType>>()
  const tagOptions: ConversationTagOptions = { tags: new Array<Tag> };
    
  const handleOnChange = (selected: any): void => {
    selected?.forEach((tg: any) => {
      tagOptions.tags.push({
          _id: tg.id,
          name: tg.name
        })
    });

    onSelect(tagOptions)
  }

  useLayoutEffect(() => {
    if (tagsList && selectedTags) {
      const defaultSelectedTags = tagsList.filter(tag => selectedTags.map(selTag => selTag._id).includes(tag.id));
      if(defaultSelectedTags){
        setDefaultSelected(defaultSelectedTags)
      }
    }
    return () => {
      setDefaultSelected(undefined)
    };
  }, [tagsList, selectedTags])

  return (
      <Select
        isMulti
        placeholder="Selecione uma tag"
        defaultValue={defaultSelected}
        onChange={handleOnChange}
        options={tagsList}
        closeMenuOnSelect={false}
      />
  );  
}
