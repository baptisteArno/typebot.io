import { SendButton } from '@/components/SendButton'
import { createEffect, createSignal, Show } from 'solid-js'
import { Stripe, StripeElements } from '@stripe/stripe-js'
import { BotContext } from '@/types'
import { PaymentInputOptions, RuntimeOptions } from 'models'
import '@power-elements/stripe-elements'
declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-payment-request': unknown
    }
  }
}

// TODO: Implement support for payment input. (WIP)

type Props = {
  context: BotContext
  options: PaymentInputOptions & RuntimeOptions
  onSuccess: () => void
}

let stripe: Stripe | undefined
let elements: StripeElements | undefined
let ignoreFirstPaymentIntentCall = true

export const StripePaymentForm = (props: Props) => {
  const [message, setMessage] = createSignal<string>()
  const [isLoading, setIsLoading] = createSignal(false)

  createEffect(() => {
    if (!stripe) return

    if (ignoreFirstPaymentIntentCall)
      return (ignoreFirstPaymentIntentCall = false)

    stripe
      .retrievePaymentIntent(props.options.paymentIntentSecret)
      .then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case 'succeeded':
            setMessage('Payment succeeded!')
            break
          case 'processing':
            setMessage('Your payment is processing.')
            break
          case 'requires_payment_method':
            setMessage('Your payment was not successful, please try again.')
            break
          default:
            setMessage('Something went wrong.')
            break
        }
      })
  })

  const handleSubmit = async (event: Event & { submitter: HTMLElement }) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // TO-DO: Handle redirection correctly.
        return_url: props.context.apiHost,
        payment_method_data: {
          billing_details: {
            name: props.options.additionalInformation?.name,
            email: props.options.additionalInformation?.email,
            phone: props.options.additionalInformation?.phoneNumber,
          },
        },
      },
      redirect: 'if_required',
    })

    setIsLoading(false)
    if (error?.type === 'validation_error') return
    if (error?.type === 'card_error') return setMessage(error.message)
    if (!error && paymentIntent.status === 'succeeded') return props.onSuccess()
  }

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      class="flex flex-col rounded-lg p-4 typebot-input w-full items-center"
    >
      {/* <stripe-payment-request
        publishable-key={props.options.publicKey}
        client-secret={props.options.paymentIntentSecret}
        generate="source"
        amount="125"
        label="Double Double"
        country="CA"
        currency={props.options.currency}
      /> */}
      <SendButton
        isLoading={isLoading() || !elements}
        class="mt-4 w-full max-w-lg"
        disableIcon
      >
        {props.options.labels.button} {props.options.amountLabel}
      </SendButton>

      <Show when={message()}>
        <div
          id="payment-message"
          class="typebot-input-error-message mt-4 text-center"
        >
          {message()}
        </div>
      </Show>
    </form>
  )
}
