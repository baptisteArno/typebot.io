import { isMobile } from '@/utils/isMobileSignal'
import { splitProps } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'

type TextareaProps = {
  ref: HTMLTextAreaElement | undefined
  onInput: (value: string) => void
} & Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onInput'>

export const Textarea = (props: TextareaProps) => {
  const [local, others] = splitProps(props, ['ref', 'onInput'])

  return (
    <textarea
      ref={local.ref}
      class="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
      rows={6}
      data-testid="textarea"
      required
      style={{ 'font-size': '16px' }}
      autofocus={!isMobile()}
      onInput={(e) => local.onInput(e.currentTarget.value)}
      {...others}
    />
  )
}
