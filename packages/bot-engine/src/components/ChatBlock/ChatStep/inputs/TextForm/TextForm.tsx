import {
  EmailInputStep,
  InputStepType,
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
  defaultValue?: string
}

export const TextForm = ({ step, onSubmit, defaultValue }: TextFormProps) => {
  const [inputValue, setInputValue] = useState(defaultValue ?? '')

  const handleChange = (inputValue: string) => {
    if (step.type === InputStepType.URL && !inputValue.startsWith('https://'))
      return inputValue === 'https:/'
        ? undefined
        : setInputValue(`https://${inputValue}`)

    setInputValue(inputValue)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue === '') return
    onSubmit(inputValue)
  }

  return (
    <div className="flex flex-col w-full lg:w-4/6 mb-2">
      <div className="flex items-center">
        <form
          className="flex items-end justify-between rounded-lg pr-2 typebot-input"
          onSubmit={handleSubmit}
          data-testid="input"
        >
          <TextInput step={step} onChange={handleChange} value={inputValue} />
          <SendButton
            label={step.options?.labels?.button ?? 'Send'}
            isDisabled={inputValue === ''}
            className="my-2 ml-2"
          />
        </form>
      </div>
    </div>
  )
}
