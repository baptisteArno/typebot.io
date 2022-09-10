import {
  EmailInputBlock,
  InputBlockType,
  NumberInputBlock,
  PhoneNumberInputBlock,
  TextInputBlock,
  UrlInputBlock,
} from 'models'
import React, { useRef, useState } from 'react'
import { InputSubmitContent } from '../../InputChatBlock'
import { SendButton } from '../SendButton'
import { TextInput } from './TextInput'

type TextFormProps = {
  block:
    | TextInputBlock
    | EmailInputBlock
    | NumberInputBlock
    | UrlInputBlock
    | PhoneNumberInputBlock
  onSubmit: (value: InputSubmitContent) => void
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
  const inputRef = useRef<HTMLInputElement | null>(null)

  const isLongText = block.type === InputBlockType.TEXT && block.options?.isLong

  const handleChange = (inputValue: string) => {
    if (block.type === InputBlockType.URL && !inputValue.startsWith('https://'))
      return inputValue === 'https:/'
        ? undefined
        : setInputValue(`https://${inputValue}`)

    setInputValue(inputValue)
  }

  const checkIfInputIsValid = () =>
    inputValue !== '' && inputRef.current?.reportValidity()

  const submit = () => {
    if (checkIfInputIsValid()) onSubmit({ value: inputValue })
  }

  const submitWhenEnter = (e: React.KeyboardEvent) => {
    if (block.type === InputBlockType.TEXT && block.options.isLong) return
    if (e.key === 'Enter') submit()
  }

  return (
    <div
      className={
        'flex items-end justify-between rounded-lg pr-2 typebot-input w-full'
      }
      data-testid="input"
      style={{
        marginRight: hasGuestAvatar ? '50px' : '0.5rem',
        maxWidth: isLongText ? undefined : '350px',
      }}
      onKeyDown={submitWhenEnter}
    >
      <TextInput
        inputRef={inputRef}
        block={block}
        onChange={handleChange}
        value={inputValue}
      />
      <SendButton
        type="button"
        label={block.options?.labels?.button ?? 'Send'}
        isDisabled={inputValue === ''}
        className="my-2 ml-2"
        onClick={submit}
      />
    </div>
  )
}
