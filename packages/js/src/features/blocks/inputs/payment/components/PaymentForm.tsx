import { BotContext } from '@/types'
import type { PaymentInputOptions, RuntimeOptions } from 'models'
import { PaymentProvider } from 'models/features/blocks/inputs/payment/enums'
import { Match, Switch } from 'solid-js'
import { StripePaymentForm } from './StripePaymentForm'

type Props = {
  context: BotContext
  options: PaymentInputOptions & RuntimeOptions
  onSuccess: () => void
}

export const PaymentForm = (props: Props) => (
  <Switch>
    <Match when={props.options.provider === PaymentProvider.STRIPE}>
      <StripePaymentForm
        onSuccess={props.onSuccess}
        options={props.options}
        context={props.context}
      />
    </Match>
  </Switch>
)
