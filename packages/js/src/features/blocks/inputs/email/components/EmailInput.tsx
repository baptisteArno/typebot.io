import { ShortTextInput } from '@/components/inputs'
import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { EmailInputBlock } from 'models'
import { createSignal } from 'solid-js'

type Props = {
  block: EmailInputBlock & { prefilledValue?: string }
  onSubmit: (value: InputSubmitContent) => void
  hasGuestAvatar: boolean
}

export const EmailInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(
    // eslint-disable-next-line solid/reactivity
    props.block.prefilledValue ?? ''
  )
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

  return (
    <div
      class={
        'flex items-end justify-between rounded-lg pr-2 typebot-input w-full'
      }
      data-testid="input"
      style={{
        'margin-right': props.hasGuestAvatar ? '50px' : '0.5rem',
        'max-width': '350px',
      }}
      onKeyDown={submitWhenEnter}
    >
      <ShortTextInput
        ref={inputRef}
        value={inputValue()}
        placeholder={
          props.block.options?.labels?.placeholder ?? 'Type your email...'
        }
        onInput={handleInput}
        type="email"
        autocomplete="email"
      />
      <SendButton
        type="button"
        isDisabled={inputValue() === ''}
        class="my-2 ml-2"
        onClick={submit}
      >
        {props.block.options?.labels?.button ?? 'Send'}
      </SendButton>
    </div>
  )
}
