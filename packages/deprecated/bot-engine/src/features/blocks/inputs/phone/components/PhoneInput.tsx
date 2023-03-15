import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/helpers'
import { PhoneNumberInputBlock } from '@typebot.io/schemas'
import React, { useRef, useState } from 'react'
import ReactPhoneNumberInput, { Value, Country } from 'react-phone-number-input'

type PhoneInputProps = {
  block: PhoneNumberInputBlock
  onSubmit: (value: InputSubmitContent) => void
  defaultValue?: string
  hasGuestAvatar: boolean
}

export const PhoneInput = ({
  block,
  onSubmit,
  defaultValue,
  hasGuestAvatar,
}: PhoneInputProps) => {
  const [inputValue, setInputValue] = useState(defaultValue ?? '')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null)

  const handleChange = (inputValue: Value | undefined) =>
    setInputValue(inputValue as string)

  const checkIfInputIsValid = () =>
    inputValue !== '' && inputRef.current?.reportValidity()

  const submit = () => {
    if (checkIfInputIsValid()) onSubmit({ value: inputValue })
  }

  const submitWhenEnter = (e: React.KeyboardEvent) => {
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
        maxWidth: '350px',
      }}
      onKeyDown={submitWhenEnter}
    >
      <ReactPhoneNumberInput
        ref={inputRef}
        value={inputValue}
        onChange={handleChange}
        placeholder={block.options.labels.placeholder ?? 'Your phone number...'}
        defaultCountry={block.options.defaultCountryCode as Country}
        autoFocus={!isMobile}
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
