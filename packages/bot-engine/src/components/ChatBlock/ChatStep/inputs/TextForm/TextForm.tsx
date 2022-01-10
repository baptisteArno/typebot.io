import {
  EmailInputStep,
  NumberInputStep,
  PhoneNumberInputStep,
  TextInputStep,
  UrlInputStep,
} from 'models'
import React, { FormEvent, useState } from 'react'
import { SendButton } from '../SendButton'
import { TextInput } from './TextInputContent'

type TextFormProps = {
  step:
    | TextInputStep
    | EmailInputStep
    | NumberInputStep
    | UrlInputStep
    | PhoneNumberInputStep
  onSubmit: (value: string) => void
}

export const TextForm = ({ step, onSubmit }: TextFormProps) => {
  const [inputValue, setInputValue] = useState('')

  const handleChange = (inputValue: string) => setInputValue(inputValue)

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
          <TextInput step={step} onChange={handleChange} />
          <SendButton
            label={step.options?.labels?.button ?? 'Send'}
            isDisabled={inputValue === ''}
          />
        </form>
      </div>
    </div>
  )
}
