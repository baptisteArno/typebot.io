import React, { FormEvent, useRef, useState } from 'react'
import { SendIcon } from '../../../../assets/icons'

type TextInputProps = {
  onSubmit: (value: string) => void
}

export const TextInput = ({ onSubmit }: TextInputProps) => {
  const inputRef = useRef(null)
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue === '') return
    onSubmit(inputValue)
  }

  return (
    <div className="flex flex-col w-full lg:w-4/6">
      <div className="flex items-center">
        <form
          className="flex items-center justify-between rounded-lg pr-2 typebot-input"
          onSubmit={handleSubmit}
        >
          <input
            ref={inputRef}
            className="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full comp-input"
            type="text"
            placeholder={'Type your answer...'}
            onChange={(e) => setInputValue(e.target.value)}
            required
          />
          <button
            type="submit"
            className={
              'py-2 px-4 font-semibold rounded-md text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 typebot-button active'
            }
          >
            <span className="hidden xs:flex">Submit</span>
            <SendIcon className="send-icon flex xs:hidden" />
          </button>
        </form>
      </div>
    </div>
  )
}
