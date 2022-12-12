import React, { useState, useEffect, useLayoutEffect } from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { useTypebot } from 'contexts/TypebotContext'
import {
  AssignToTeamOptions
} from 'models'
import { OptionItemType } from 'components/octaComponents/OctaSelect/OctaSelect.type'

type Props = {
  onSelect: (option: AssignToTeamOptions) => void,
  selectedCustomField?: string
}

export const CustomFieldsSelect = ({ onSelect, selectedCustomField }: Props) => {
  const { octaCustomFields } = useTypebot();

  const [itemsCustomFields, setItemsCustomFields] = useState<Array<OptionItemType>>([])
  const [defaultSelected, setDefaultSelected] = useState<OptionItemType>();

  useEffect(() => {
    if (octaCustomFields) {
      const items = octaCustomFields.map((customField) => ({
        label: customField.name,
        value: JSON.stringify({
          property: customField,
        })
      }))
      setItemsCustomFields(items);
    }
    return () => {
      setItemsCustomFields([])
    };
  }, [octaCustomFields]);

  const handleOnChange = (selected: any): void => {
    onSelect(selected)
  }

  useLayoutEffect(() => {
    if (octaCustomFields && selectedCustomField) {
      const defaults = octaCustomFields.filter((item) => item.id === selectedCustomField)[0];
      if(defaults){
        setDefaultSelected({
          label: defaults.name,
          value: JSON.stringify({
            assignTo: defaults.id,
            assignType: defaults.operationType
          })
        })
      }
    }
    return () => {
      setDefaultSelected(undefined)
    };
  }, [octaCustomFields, selectedCustomField])

  return (
    <OctaSelect
      placeholder="Digite o nome do campo"
      defaultSelected={defaultSelected}
      items={itemsCustomFields}
      onChange={handleOnChange}
    />
  )
}
