import { NumberInputStep, TextInputStep } from 'models'
import React, { FormEvent, useRef, useState } from 'react'
import { SendIcon } from '../../../../assets/icons'

type NumberInputProps = {
  step: NumberInputStep
  onSubmit: (value: string) => void
}

export const NumberInput = ({ step, onSubmit }: NumberInputProps) => {
  const inputRef = useRef(null)
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue === '') return
    onSubmit(inputValue)
  }

  return (
    <div className="flex flex-col w-full lg:w-4/6">
      <div className="flex items-center">
        <form
          className="flex items-end justify-between rounded-lg pr-2 typebot-input"
          onSubmit={handleSubmit}
        >
          <input
            ref={inputRef}
            className="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full comp-input"
            type="number"
            placeholder={
              step.options?.labels?.placeholder ?? 'Type your answer...'
            }
            onChange={(e) => setInputValue(e.target.value)}
            style={{ appearance: 'auto' }}
            min={step.options?.min}
            max={step.options?.max}
            step={step.options?.step}
            required
          />
          <button
            type="submit"
            className={
              'my-2 ml-2 py-2 px-4 font-semibold rounded-md text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 typebot-button active'
            }
            disabled={inputValue === ''}
          >
            <span className="hidden xs:flex">
              {step.options?.labels?.button ?? 'Send'}
            </span>
            <SendIcon className="send-icon flex xs:hidden" />
          </button>
        </form>
      </div>
    </div>
  )
}
