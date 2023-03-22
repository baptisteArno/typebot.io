import { SendButton } from '@/components/SendButton'
import { createSignal, onMount, Show } from 'solid-js'
import type { Stripe, StripeElements } from '@stripe/stripe-js'
import { BotContext } from '@/types'
import type { PaymentInputOptions, RuntimeOptions } from '@typebot.io/schemas'
import { loadStripe } from '@/lib/stripe'

type Props = {
  context: BotContext
  options: PaymentInputOptions & RuntimeOptions
  onSuccess: () => void
}

const slotName = 'stripe-payment-form'

let paymentElementSlot: HTMLSlotElement
let stripe: Stripe | null = null
let elements: StripeElements | null = null

export const StripePaymentForm = (props: Props) => {
  const [message, setMessage] = createSignal<string>()
  const [isMounted, setIsMounted] = createSignal(false)
  const [isLoading, setIsLoading] = createSignal(false)

  onMount(async () => {
    initShadowMountPoint(paymentElementSlot)
    stripe = await loadStripe(props.options.publicKey)
    if (!stripe) return
    elements = stripe.elements({
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: getComputedStyle(paymentElementSlot).getPropertyValue(
            '--typebot-button-bg-color'
          ),
        },
      },
      clientSecret: props.options.paymentIntentSecret,
    })
    const paymentElement = elements.create('payment', {
      layout: 'tabs',
    })
    paymentElement.mount('#payment-element')
    setTimeout(() => setIsMounted(true), 1000)
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
      class="flex flex-col p-4 typebot-input w-full items-center"
    >
      <slot name={slotName} ref={paymentElementSlot} />
      <Show when={isMounted()}>
        <SendButton
          isLoading={isLoading()}
          class="mt-4 w-full max-w-lg animate-fade-in"
          disableIcon
        >
          {props.options.labels.button} {props.options.amountLabel}
        </SendButton>
      </Show>

      <Show when={message()}>
        <div class="typebot-input-error-message mt-4 text-center animate-fade-in">
          {message()}
        </div>
      </Show>
    </form>
  )
}

const initShadowMountPoint = (element: HTMLElement) => {
  const rootNode = element.getRootNode() as ShadowRoot
  const host = rootNode.host
  const slotPlaceholder = document.createElement('div')
  slotPlaceholder.style.width = '100%'
  slotPlaceholder.slot = slotName
  host.appendChild(slotPlaceholder)
  const paymentElementContainer = document.createElement('div')
  paymentElementContainer.id = 'payment-element'
  slotPlaceholder.appendChild(paymentElementContainer)
}
