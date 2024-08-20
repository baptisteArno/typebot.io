import { SendButton } from '@/components/SendButton'
import { CommandData } from '@/features/commands/types'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { NumberInputBlock } from '@typebot.io/schemas'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { numberInputHelper } from '../numberInputHelper'
import { defaultNumberInputOptions } from '@typebot.io/schemas/features/blocks/inputs/number/constants'

type NumberInputProps = {
  block: NumberInputBlock
  defaultValue?: string
  onSubmit: (value: InputSubmitContent) => void
}

export const NumberInput = (props: NumberInputProps) => {
  const [inputValue, setInputValue] = createSignal<string | number>(
    props.defaultValue ?? ''
  )
  const [staticValue, bindValue, targetValue] = numberInputHelper(() =>
    inputValue()
  )
  let inputRef: HTMLInputElement | undefined

  const checkIfInputIsValid = () =>
    inputRef?.value !== '' && inputRef?.reportValidity()

  const submit = () => {
    if (checkIfInputIsValid())
      props.onSubmit({
        type: 'text',
        value: inputRef?.value ?? inputValue().toString(),
      })
    else inputRef?.focus()
  }

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') submit()
  }

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus({ preventScroll: true })
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
      class="typebot-input-form flex w-full gap-2 items-end max-w-[350px]"
      onKeyDown={submitWhenEnter}
    >
      <div class={'flex typebot-input w-full'}>
        <input
          ref={inputRef}
          class="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
          style={{ 'font-size': '16px', appearance: 'auto' }}
          value={staticValue}
          // @ts-expect-error not defined
          // eslint-disable-next-line solid/jsx-no-undef
          use:bindValue
          placeholder={
            props.block.options?.labels?.placeholder ??
            defaultNumberInputOptions.labels.placeholder
          }
          onInput={(e) => {
            setInputValue(targetValue(e.currentTarget))
          }}
          type="number"
          min={props.block.options?.min}
          max={props.block.options?.max}
          step={props.block.options?.step ?? 'any'}
        />
      </div>
      <SendButton type="button" class="h-[56px]" on:click={submit}>
        {props.block.options?.labels?.button}
      </SendButton>
    </div>
  )
}
