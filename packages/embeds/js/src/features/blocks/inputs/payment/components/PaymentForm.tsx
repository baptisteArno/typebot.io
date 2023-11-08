import { BotContext } from '@/types'
import { StripePaymentForm } from './StripePaymentForm'
import { PaymentInputBlock, RuntimeOptions } from '@typebot.io/schemas'

type Props = {
  context: BotContext
  options: PaymentInputBlock['options'] & RuntimeOptions
  onSuccess: () => void
}

export const PaymentForm = (props: Props) => (
  <StripePaymentForm
    onSuccess={props.onSuccess}
    options={props.options}
    context={props.context}
  />
)
