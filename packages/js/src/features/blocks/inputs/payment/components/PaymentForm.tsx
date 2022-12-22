import { BotContext } from '@/types'
import { PaymentInputOptions, PaymentProvider, RuntimeOptions } from 'models'
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
        // eslint-disable-next-line solid/reactivity
        onSuccess={props.onSuccess}
        options={props.options}
        context={props.context}
      />
    </Match>
  </Switch>
)
