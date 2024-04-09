import { Textarea, ShortTextInput } from '@/components'
import { SendButton } from '@/components/SendButton'
import { CommandData } from '@/features/commands'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { TextInputBlock } from '@typebot.io/schemas'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { defaultTextInputOptions } from '@typebot.io/schemas/features/blocks/inputs/text/constants'

type Props = {
  block: TextInputBlock
  defaultValue?: string
  onSubmit: (value: InputSubmitContent) => void
}

export const TextInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? '')
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined

  const handleInput = (inputValue: string) => setInputValue(inputValue)

  const checkIfInputIsValid = () =>
    inputRef?.value !== '' && inputRef?.reportValidity()

  const submit = () => {
    if (checkIfInputIsValid())
      props.onSubmit({ value: inputRef?.value ?? inputValue() })
    else inputRef?.focus()
  }

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (props.block.options?.isLong) return
    if (e.key === 'Enter') submit()
  }

  const submitIfCtrlEnter = (e: KeyboardEvent) => {
    if (!props.block.options?.isLong) return
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
  }

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus()
    window.addEventListener('message', processIncomingEvent)
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent)
  })

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromTypebot) return
    if (data.command === 'setInputValue') setInputValue(data.value)
  }

  return (
    <div
      class={'flex items-end justify-between pr-2 typebot-input w-full'}
      data-testid="input"
      style={{
        'max-width': props.block.options?.isLong ? undefined : '350px',
      }}
      onKeyDown={submitWhenEnter}
    >
      {props.block.options?.isLong ? (
        <Textarea
          ref={inputRef as HTMLTextAreaElement}
          onInput={handleInput}
          onKeyDown={submitIfCtrlEnter}
          value={inputValue()}
          placeholder={
            props.block.options?.labels?.placeholder ??
            defaultTextInputOptions.labels.placeholder
          }
        />
      ) : (
        <ShortTextInput
          ref={inputRef as HTMLInputElement}
          onInput={handleInput}
          value={inputValue()}
          placeholder={
            props.block.options?.labels?.placeholder ??
            defaultTextInputOptions.labels.placeholder
          }
        />
      )}
      <SendButton type="button" class="my-2 ml-2" on:click={submit}>
        {props.block.options?.labels?.button ??
          defaultTextInputOptions.labels.button}
      </SendButton>
    </div>
  )
}
