import { isMobile } from '@/utils/isMobileSignal'
import { splitProps, Switch, Match } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { SendIcon } from './icons'
import { Button } from './Button'
import { isEmpty } from '@typebot.io/lib'
import clsx from 'clsx'

type SendButtonProps = {
  isDisabled?: boolean
  isLoading?: boolean
  disableIcon?: boolean
  class?: string
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

export const SendButton = (props: SendButtonProps) => {
  const [local, others] = splitProps(props, ['disableIcon'])
  const showIcon =
    (isMobile() && !local.disableIcon) ||
    !props.children ||
    (typeof props.children === 'string' && isEmpty(props.children))
  return (
    <Button
      type="submit"
      {...others}
      class={clsx('flex items-center', props.class)}
      aria-label={showIcon ? 'Send' : undefined}
    >
      <Switch>
        <Match when={showIcon}>
          <SendIcon
            class={
              'send-icon flex w-6 h-6 ' + (local.disableIcon ? 'hidden' : '')
            }
          />
        </Match>
        <Match when={!showIcon}>{props.children}</Match>
      </Switch>
    </Button>
  )
}
