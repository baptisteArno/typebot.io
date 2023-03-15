import { Stripe } from '@stripe/stripe-js'

export const loadStripe = (publishableKey: string): Promise<Stripe> =>
  new Promise<Stripe>((resolve) => {
    if (window.Stripe) return resolve(window.Stripe(publishableKey))
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3'
    document.body.appendChild(script)
    script.onload = () => {
      if (!window.Stripe) throw new Error('Stripe.js failed to load.')
      resolve(window.Stripe(publishableKey))
    }
  })
