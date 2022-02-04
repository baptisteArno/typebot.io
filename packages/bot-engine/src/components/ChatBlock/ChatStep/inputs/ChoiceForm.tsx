import { ChoiceInputStep } from 'models'
import React, { useState } from 'react'
import { SendButton } from './SendButton'

type ChoiceFormProps = {
  step: ChoiceInputStep
  onSubmit: (value: string) => void
}

export const ChoiceForm = ({ step, onSubmit }: ChoiceFormProps) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  const handleClick = (itemIndex: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (step.options?.isMultipleChoice) toggleSelectedItemIndex(itemIndex)
    else onSubmit(step.items[itemIndex].content ?? '')
  }

  const toggleSelectedItemIndex = (itemIndex: number) => {
    const existingIndex = selectedIndices.indexOf(itemIndex)
    if (existingIndex !== -1) {
      selectedIndices.splice(existingIndex, 1)
      setSelectedIndices([...selectedIndices])
    } else {
      setSelectedIndices([...selectedIndices, itemIndex])
    }
  }

  const handleSubmit = () =>
    onSubmit(
      selectedIndices
        .map((itemIndex) => step.items[itemIndex].content)
        .join(', ')
    )

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className="flex flex-wrap">
        {step.items.map((item, idx) => (
          <button
            key={item.id}
            role={step.options?.isMultipleChoice ? 'checkbox' : 'button'}
            onClick={handleClick(idx)}
            className={
              'py-2 px-4 font-semibold rounded-md transition-all filter hover:brightness-90 active:brightness-75 duration-100 focus:outline-none mr-2 mb-2 typebot-button ' +
              (selectedIndices.includes(idx) || !step.options?.isMultipleChoice
                ? 'active'
                : '')
            }
            data-testid="button"
          >
            {item.content}
          </button>
        ))}
      </div>
      <div className="flex">
        {selectedIndices.length > 0 && (
          <SendButton label={step.options?.buttonLabel ?? 'Send'} />
        )}
      </div>
    </form>
  )
}
