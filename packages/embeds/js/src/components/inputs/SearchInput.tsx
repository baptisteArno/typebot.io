import { Show, createSignal, splitProps } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { CloseIcon } from '../icons/CloseIcon'

type Props = {
  ref: HTMLInputElement | undefined
  onInput: (value: string) => void
  onClear: () => void
} & Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'onInput'>

export const SearchInput = (props: Props) => {
  const [value, setValue] = createSignal('')
  const [local, others] = splitProps(props, ['onInput', 'ref'])

  const changeValue = (value: string) => {
    setValue(value)
    local.onInput(value)
  }

  const clearValue = () => {
    setValue('')
    props.onClear()
  }

  return (
    <div class="flex justify-between items-center gap-2 w-full pr-4">
      <input
        ref={props.ref}
        class="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
        type="text"
        style={{ 'font-size': '16px' }}
        value={value()}
        onInput={(e) => changeValue(e.currentTarget.value)}
        {...others}
      />
      <Show when={value().length > 0}>
        <button class="w-5 h-5" on:click={clearValue}>
          <CloseIcon />
        </button>
      </Show>
    </div>
  )
}
