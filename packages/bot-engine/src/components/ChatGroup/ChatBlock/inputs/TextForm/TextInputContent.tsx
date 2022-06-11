import {
  TextInputBlock,
  EmailInputBlock,
  NumberInputBlock,
  InputBlockType,
  UrlInputBlock,
  PhoneNumberInputBlock,
} from 'models'
import React, {
  ChangeEvent,
  ChangeEventHandler,
  RefObject,
  useEffect,
  useRef,
} from 'react'
import PhoneInput, { Value, Country } from 'react-phone-number-input'

type TextInputProps = {
  block:
    | TextInputBlock
    | EmailInputBlock
    | NumberInputBlock
    | UrlInputBlock
    | PhoneNumberInputBlock
  value: string
  onChange: (value: string) => void
}

export const TextInput = ({ block, value, onChange }: TextInputProps) => {
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!inputRef.current) return
    inputRef.current.focus()
  }, [])

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
          ref={inputRef as unknown as RefObject<HTMLTextAreaElement>}
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
          name="typebot-short-text"
          onChange={handleInputChange}
          autoComplete="new-typebot-answer-value"
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={inputRef as any}
          value={value}
          onChange={handlePhoneNumberChange}
          placeholder={
            block.options.labels.placeholder ?? 'Your phone number...'
          }
          defaultCountry={block.options.defaultCountryCode as Country}
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
      required
      style={{ fontSize: '16px' }}
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
      {...props}
    />
  )
)
