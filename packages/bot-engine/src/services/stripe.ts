import { PaymentInputOptions, Variable } from 'models'
import { sendRequest } from 'utils'

export const createPaymentIntent = ({
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
