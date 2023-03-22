import { ShortTextInput } from '@/components'
import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { NumberInputBlock } from '@typebot.io/schemas'
import { createSignal, onMount } from 'solid-js'

type NumberInputProps = {
  block: NumberInputBlock
  defaultValue?: string
  onSubmit: (value: InputSubmitContent) => void
}

export const NumberInput = (props: NumberInputProps) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? '')
  let inputRef: HTMLInputElement | undefined

  const handleInput = (inputValue: string) => setInputValue(inputValue)

  const checkIfInputIsValid = () =>
    inputValue() !== '' && inputRef?.reportValidity()

  const submit = () => {
    if (checkIfInputIsValid()) props.onSubmit({ value: inputValue() })
  }

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') submit()
  }

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus()
  })

  return (
    <div
      class={'flex items-end justify-between pr-2 typebot-input w-full'}
      data-testid="input"
      style={{
        'max-width': '350px',
      }}
      onKeyDown={submitWhenEnter}
    >
      <ShortTextInput
        ref={inputRef}
        value={inputValue()}
        placeholder={
          props.block.options?.labels?.placeholder ?? 'Type your answer...'
        }
        onInput={handleInput}
        type="number"
        style={{ appearance: 'auto' }}
        min={props.block.options?.min}
        max={props.block.options?.max}
        step={props.block.options?.step ?? 'any'}
      />
      <SendButton
        type="button"
        isDisabled={inputValue() === ''}
        class="my-2 ml-2"
        on:click={submit}
      >
        {props.block.options?.labels?.button ?? 'Send'}
      </SendButton>
    </div>
  )
}
