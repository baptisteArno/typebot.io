import { PaymentInputOptions, Variable } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

export const createPaymentIntentQuery = ({
  apiHost,
  isPreview,
  inputOptions,
  variables,
}: {
  inputOptions: PaymentInputOptions
  apiHost: string
  variables: Variable[]
  isPreview: boolean
}) =>
  sendRequest<{ clientSecret: string; publicKey: string; amountLabel: string }>(
    {
      url: `${apiHost}/api/integrations/stripe/createPaymentIntent`,
      method: 'POST',
      body: { inputOptions, isPreview, variables },
    }
  )
