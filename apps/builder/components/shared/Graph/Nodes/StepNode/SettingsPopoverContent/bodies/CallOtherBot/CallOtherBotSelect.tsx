import React, { useState, useLayoutEffect } from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { useTypebot } from 'contexts/TypebotContext'
import { CallOtherBotOptions } from 'models'
import { OptionType } from 'components/octaComponents/OctaSelect/OctaSelect.type'

type Props = {
  onSelect: (option: CallOtherBotOptions) => void
  selectedBot?: string
}

export const CallOtherBotSelect = ({ onSelect, selectedBot }: Props) => {
  const { botFluxesList } = useTypebot();
  const [defaultSelected, setDefaultSelected] = useState<OptionType>()

  const handleOnChange = (selected: any): void => {
    onSelect(selected)
  }

  useLayoutEffect(() => {
    if (botFluxesList && selectedBot) {
      const defaultSelectedBot = botFluxesList.filter((item) => item.botId === selectedBot)[0];
      if(defaultSelectedBot){
        setDefaultSelected({
          label: defaultSelectedBot.name,
          value: {
            botToCall: defaultSelectedBot.botToCall
          },
          key: ''
        })
      }
    }
    return () => {
      setDefaultSelected(undefined)
    };
  }, [botFluxesList, selectedBot])

  return (
    <OctaSelect
      placeholder="Selecione um bot para chamar"
      defaultSelected={defaultSelected}
      findable
      options={botFluxesList}
      onChange={handleOnChange}
    />
  )
}
