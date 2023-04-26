import { isMobile } from '@/utils/isMobileSignal'
import { splitProps } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { SendIcon } from './icons'
import { Button } from './Button'

type SendButtonProps = {
  isDisabled?: boolean
  isLoading?: boolean
  disableIcon?: boolean
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

export const SendButton = (props: SendButtonProps) => {
  const [local, others] = splitProps(props, ['disableIcon'])
  return (
    <Button type="submit" {...others}>
      {isMobile() && !local.disableIcon ? (
        <SendIcon
          class={'send-icon flex ' + (local.disableIcon ? 'hidden' : '')}
        />
      ) : (
        props.children
      )}
    </Button>
  )
}
