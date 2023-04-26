import { CheckIcon } from '@/components/icons/CheckIcon'
import { Show } from 'solid-js'

type Props = {
  isChecked: boolean
}

export const Checkbox = (props: Props) => {
  return (
    <div
      class={'w-4 h-4 typebot-checkbox' + (props.isChecked ? ' checked' : '')}
    >
      <Show when={props.isChecked}>
        <CheckIcon />
      </Show>
    </div>
  )
}
