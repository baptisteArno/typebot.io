import {
  EmailInputStep,
  NumberInputStep,
  TextInputStep,
  UrlInputStep,
} from 'models'
import React, { FormEvent, useState } from 'react'
import { SendIcon } from '../../../../../assets/icons'
import { TextInput } from './TextInputContent'

type TextFormProps = {
  step: TextInputStep | EmailInputStep | NumberInputStep | UrlInputStep
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
