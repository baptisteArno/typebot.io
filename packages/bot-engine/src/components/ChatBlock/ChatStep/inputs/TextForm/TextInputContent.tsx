import {
  TextInputStep,
  EmailInputStep,
  NumberInputStep,
  InputStepType,
} from 'models'
import React, {
  ChangeEvent,
  ChangeEventHandler,
  RefObject,
  useEffect,
  useRef,
} from 'react'

type TextInputProps = {
  step: TextInputStep | EmailInputStep | NumberInputStep
  onChange: (value: string) => void
}

export const TextInput = ({ step, onChange }: TextInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!inputRef.current) return
    inputRef.current.focus()
  }, [])

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onChange(e.target.value)

  switch (step.type) {
    case InputStepType.TEXT: {
      return step.options?.isLong ? (
        <LongTextInput
          ref={inputRef as unknown as RefObject<HTMLTextAreaElement>}
          placeholder={
            step.options?.labels?.placeholder ?? 'Type your answer...'
          }
          onChange={handleInputChange}
        />
      ) : (
        <ShortTextInput
          ref={inputRef}
          placeholder={
            step.options?.labels?.placeholder ?? 'Type your answer...'
          }
          onChange={handleInputChange}
        />
      )
    }
    case InputStepType.EMAIL: {
      return (
        <ShortTextInput
          ref={inputRef}
          placeholder={
            step.options?.labels?.placeholder ?? 'Type your email...'
          }
          onChange={handleInputChange}
          type="email"
        />
      )
    }
    case InputStepType.NUMBER: {
      return (
        <ShortTextInput
          ref={inputRef}
          placeholder={
            step.options?.labels?.placeholder ?? 'Type your answer...'
          }
          onChange={handleInputChange}
          type="number"
          style={{ appearance: 'auto' }}
          min={step.options?.min}
          max={step.options?.max}
          step={step.options?.step}
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
      className="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full comp-input"
      type="text"
      required
      {...props}
    />
  )
)

const LongTextInput = React.forwardRef(
  (
    props: { placeholder: string; onChange: ChangeEventHandler },
    ref: React.ForwardedRef<HTMLTextAreaElement>
  ) => (
    <textarea
      ref={ref}
      className="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full comp-input"
      rows={4}
      data-testid="textarea"
      required
      {...props}
    />
  )
)
