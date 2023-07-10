import {
  EmailInputStep,
  CpfInputStep,
  InputStepType,
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
    | CpfInputStep
    | UrlInputStep
    | PhoneNumberInputStep
  onSubmit: (value: string) => void
  defaultValue?: string
  hasGuestAvatar: boolean
}

export const TextForm = ({
  step,
  onSubmit,
  defaultValue,
  hasGuestAvatar,
}: TextFormProps) => {
  const [inputValue, setInputValue] = useState(defaultValue ?? '')

  const isLongText = step.type === InputStepType.TEXT && step.options?.isLong

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
    <form
      className="flex items-end justify-between rounded-lg pr-2 typebot-input w-full"
      onSubmit={handleSubmit}
      data-testid="input"
      style={{
        marginRight: hasGuestAvatar ? '50px' : '0.5rem',
        maxWidth: isLongText ? undefined : '350px',
      }}
    >
      <TextInput step={step} onChange={handleChange} value={inputValue} />
      <SendButton
        label={step.options?.labels?.button ?? 'Send'}
        isDisabled={inputValue === ''}
        className="my-2 ml-2"
      />
    </form>
  )
}
