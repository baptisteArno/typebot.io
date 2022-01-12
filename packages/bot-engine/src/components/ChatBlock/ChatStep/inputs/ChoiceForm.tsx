import { ChoiceInputOptions } from 'models'
import React, { useMemo, useState } from 'react'
import { filterTable } from 'utils'
import { useTypebot } from '../../../../contexts/TypebotContext'
import { SendButton } from './SendButton'

type ChoiceFormProps = {
  options?: ChoiceInputOptions
  onSubmit: (value: string) => void
}

export const ChoiceForm = ({ options, onSubmit }: ChoiceFormProps) => {
  const { typebot } = useTypebot()
  const items = useMemo(
    () => filterTable(options?.itemIds ?? [], typebot.choiceItems),
    []
  )
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleClick = (itemId: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (options?.isMultipleChoice) toggleSelectedItemId(itemId)
    else onSubmit(items.byId[itemId].content ?? '')
  }

  const toggleSelectedItemId = (itemId: string) => {
    const existingIndex = selectedIds.indexOf(itemId)
    if (existingIndex !== -1) {
      selectedIds.splice(existingIndex, 1)
      setSelectedIds([...selectedIds])
    } else {
      setSelectedIds([...selectedIds, itemId])
    }
  }

  const handleSubmit = () =>
    onSubmit(selectedIds.map((itemId) => items.byId[itemId].content).join(', '))

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className="flex flex-wrap">
        {options?.itemIds.map((itemId) => (
          <button
            role={options?.isMultipleChoice ? 'checkbox' : 'button'}
            onClick={handleClick(itemId)}
            className={
              'py-2 px-4 font-semibold rounded-md transition-all filter hover:brightness-90 active:brightness-75 duration-100 focus:outline-none mr-2 mb-2 typebot-button ' +
              (selectedIds.includes(itemId) || !options?.isMultipleChoice
                ? 'active'
                : '')
            }
          >
            {items.byId[itemId].content}
          </button>
        ))}
      </div>
      <div className="flex">
        {selectedIds.length > 0 && (
          <SendButton label={options?.buttonLabel ?? 'Send'} />
        )}
      </div>
    </form>
  )
}
