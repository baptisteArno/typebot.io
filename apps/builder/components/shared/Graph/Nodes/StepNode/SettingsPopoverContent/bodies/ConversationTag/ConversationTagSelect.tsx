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

  const defaultSelectedTags = selectedTags ? selectedTags.map(tag => tagsList.find(s => s._id === tag._id)) : [];

  return (
    <Select
      isMulti
      placeholder="Selecione uma tag"
      defaultValue={defaultSelectedTags}
      onChange={handleOnChange}
      options={tagsList}
      closeMenuOnSelect={false}
    />
  );
}
