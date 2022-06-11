import { PaymentInputOptions, PaymentProvider } from 'models'
import React from 'react'
import { StripePaymentForm } from './StripePaymentForm'

type Props = {
  onSuccess: () => void
  options: PaymentInputOptions
}

export const PaymentForm = ({ onSuccess, options }: Props): JSX.Element => {
  switch (options.provider) {
    case PaymentProvider.STRIPE:
      return <StripePaymentForm onSuccess={onSuccess} options={options} />
  }
}
