import {
  TextInputBlock,
  EmailInputBlock,
  NumberInputBlock,
  InputBlockType,
  UrlInputBlock,
  PhoneNumberInputBlock,
} from 'models'
import React, { ChangeEvent, ChangeEventHandler } from 'react'
import PhoneInput, { Value, Country } from 'react-phone-number-input'
import { isMobile } from 'services/utils'

type TextInputProps = {
  inputRef: React.RefObject<any>
  block:
    | TextInputBlock
    | EmailInputBlock
    | NumberInputBlock
    | UrlInputBlock
    | PhoneNumberInputBlock
  value: string
  onChange: (value: string) => void
}

export const TextInput = ({
  inputRef,
  block,
  value,
  onChange,
}: TextInputProps) => {
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onChange(e.target.value)

  const handlePhoneNumberChange = (value?: Value | undefined) => {
    onChange(value as string)
  }

  switch (block.type) {
    case InputBlockType.TEXT: {
      return block.options?.isLong ? (
        <LongTextInput
          ref={inputRef}
          value={value}
          placeholder={
            block.options?.labels?.placeholder ?? 'Type your answer...'
          }
          onChange={handleInputChange}
        />
      ) : (
        <ShortTextInput
          ref={inputRef}
          value={value}
          placeholder={
            block.options?.labels?.placeholder ?? 'Type your answer...'
          }
          onChange={handleInputChange}
          // Hack to disable Chrome autocomplete
          name="no-name"
        />
      )
    }
    case InputBlockType.EMAIL: {
      return (
        <ShortTextInput
          ref={inputRef}
          value={value}
          placeholder={
            block.options?.labels?.placeholder ?? 'Type your email...'
          }
          onChange={handleInputChange}
          type="email"
          autoComplete="email"
        />
      )
    }
    case InputBlockType.NUMBER: {
      return (
        <ShortTextInput
          ref={inputRef}
          value={value}
          placeholder={
            block.options?.labels?.placeholder ?? 'Type your answer...'
          }
          onChange={handleInputChange}
          type="number"
          style={{ appearance: 'auto' }}
          min={block.options?.min}
          max={block.options?.max}
          step={block.options?.step ?? 'any'}
        />
      )
    }
    case InputBlockType.URL: {
      return (
        <ShortTextInput
          ref={inputRef}
          value={value}
          placeholder={block.options?.labels?.placeholder ?? 'Type your URL...'}
          onChange={handleInputChange}
          type="url"
          autoComplete="url"
        />
      )
    }
    case InputBlockType.PHONE: {
      return (
        <PhoneInput
          ref={inputRef}
          value={value}
          onChange={handlePhoneNumberChange}
          placeholder={
            block.options.labels.placeholder ?? 'Your phone number...'
          }
          defaultCountry={block.options.defaultCountryCode as Country}
          autoFocus={!isMobile}
        />
      )
    }
  }
}

const ShortTextInput = React.forwardRef(
  (
    props: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => (
    <input
      ref={ref}
      className="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
      type="text"
      style={{ fontSize: '16px' }}
      autoFocus={!isMobile}
      {...props}
    />
  )
)

const LongTextInput = React.forwardRef(
  (
    props: {
      placeholder: string
      value: string
      onChange: ChangeEventHandler
    },
    ref: React.ForwardedRef<HTMLTextAreaElement>
  ) => (
    <textarea
      ref={ref}
      className="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
      rows={6}
      data-testid="textarea"
      required
      style={{ fontSize: '16px' }}
      autoFocus={!isMobile}
      {...props}
    />
  )
)
