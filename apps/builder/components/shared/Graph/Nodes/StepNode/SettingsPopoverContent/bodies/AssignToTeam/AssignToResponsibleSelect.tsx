import React, { useState, useEffect, useCallback } from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { useTypebot } from 'contexts/TypebotContext'
import { OptionType } from 'components/octaComponents/OctaSelect/OctaSelect.type'

type Props = {
  onSelect: (option: any) => void
  options: IOptions
  hasResponsibleContact: boolean
}

interface IParsedAgents {
  label: string
  value: {
    assignTo: string
    assignType: string
  }
  key: number
  isTitle: any
}

interface IOptions {
  assignTo: string
  assignType: '@NO-ONE' | '@AGENT'
  subType: 'RESPONSIBLE_CONTACT'
}

type Combination =
  | 'RESPONSIBLE_CONTACT@NO-ONE'
  | '@NO-ONE'
  | 'RESPONSIBLE_CONTACT@AGENT'
  | '@AGENT'
  | '@GROUP'
  | 'RESPONSIBLE_CONTACT@GROUP'

export const AssignToResponsibleSelect = ({
  onSelect,
  options,
  hasResponsibleContact,
}: Props) => {
  const { octaAgents } = useTypebot()
  const [itemsToResponsibleAssign, setItemsToResponsibleAssign] = useState<
    Array<OptionType>
  >([])
  const [defaultSelected, setDefaultSelected] = useState<OptionType>()

  const responsibleContactDefault = {
    label: 'Responsável pelo contato',
    value: {
      assignType: '@NO-ONE',
      subType: 'RESPONSIBLE_CONTACT',
    },
    key: 'responsible-key',
  }
  const noOne = {
    label: 'Não atribuir (Visível a todos)',
    value: {
      assignType: '@NO-ONE',
    },
    key: 0,
  }
  const generateAgentValue = (agent: IParsedAgents) => ({
    label: agent?.label,
    value: {
      assignTo: agent?.value?.assignTo,
      assignType: agent?.value?.assignType,
    },
    key: agent?.key,
  })
  const generateResponsibleAgentValue = (agent: IParsedAgents) => ({
    label: 'Responsável pelo contato',
    value: {
      assignTo: agent?.value?.assignTo,
      assignType: agent?.value?.assignType,
      subType: options?.subType,
    },
    key: agent?.key,
  })

  const selectedOption = {
    'RESPONSIBLE_CONTACT@NO-ONE': () => responsibleContactDefault,
    '@NO-ONE': () => noOne,
    'RESPONSIBLE_CONTACT@AGENT': (agent: IParsedAgents, options: IOptions) =>
      generateResponsibleAgentValue(agent),
    'RESPONSIBLE_CONTACT@GROUP': (agent: IParsedAgents, options: IOptions) =>
      generateResponsibleAgentValue(agent),
    '@AGENT': (agent: IParsedAgents, options: IOptions) =>
      generateAgentValue(agent),
    '@GROUP': (agent: IParsedAgents, options: IOptions) =>
      generateAgentValue(agent),
  }

  const chooseCurrentSelected = (
    options: IOptions,
    agents: IParsedAgents[]
  ) => {
    const agent: IParsedAgents = agents.find(
      (agent) => agent?.value?.assignTo === options?.assignTo
    ) as IParsedAgents
    const subType = options?.subType || ''
    const assignType = options?.assignType || ''
    const combination: Combination = (subType + assignType) as Combination

    if (selectedOption[combination]) {
      return selectedOption[combination](agent, options)
    }
    return noOne
  }

  useEffect(() => {
    if (octaAgents) {
      const parsedAgents = octaAgents.map((agentGroup, idx) => ({
        label: agentGroup.name,
        value: {
          assignTo: agentGroup.id,
          assignType: agentGroup.operationType,
        },
        key: idx,
        isTitle: agentGroup.isTitle,
      }))

      const agents: IParsedAgents[] =
        parsedAgents.filter((agent, index) => index > 0) || []

      let list = [parsedAgents[0], responsibleContactDefault, ...agents]

      if (!hasResponsibleContact) {
        list = [parsedAgents[0], ...agents]
      }
      const currentSelected = chooseCurrentSelected(options, agents)

      setDefaultSelected(currentSelected)
      setItemsToResponsibleAssign(list)
    }
    return () => {
      setItemsToResponsibleAssign([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [octaAgents, hasResponsibleContact])

  const handleOnChange = (selected: any): void => {
    onSelect(selected)
  }

  return (
    <OctaSelect
      name="responsible"
      placeholder=""
      defaultSelected={defaultSelected || ''}
      findable
      options={itemsToResponsibleAssign}
      onChange={handleOnChange}
    />
  )
}
