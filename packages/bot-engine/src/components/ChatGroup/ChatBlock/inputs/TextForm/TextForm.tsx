import {
  EmailInputBlock,
  InputBlockType,
  NumberInputBlock,
  PhoneNumberInputBlock,
  TextInputBlock,
  UrlInputBlock,
} from 'models'
import React, { FormEvent, useState } from 'react'
import { SendButton } from '../SendButton'
import { TextInput } from './TextInputContent'

type TextFormProps = {
  block:
    | TextInputBlock
    | EmailInputBlock
    | NumberInputBlock
    | UrlInputBlock
    | PhoneNumberInputBlock
  onSubmit: (value: string) => void
  defaultValue?: string
  hasGuestAvatar: boolean
}

export const TextForm = ({
  block,
  onSubmit,
  defaultValue,
  hasGuestAvatar,
}: TextFormProps) => {
  const [inputValue, setInputValue] = useState(defaultValue ?? '')

  const isLongText = block.type === InputBlockType.TEXT && block.options?.isLong

  const handleChange = (inputValue: string) => {
    if (block.type === InputBlockType.URL && !inputValue.startsWith('https://'))
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
      <TextInput block={block} onChange={handleChange} value={inputValue} />
      <SendButton
        label={block.options?.labels?.button ?? 'Send'}
        isDisabled={inputValue === ''}
        className="my-2 ml-2"
      />
    </form>
  )
}
