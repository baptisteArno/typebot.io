import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'

export const verifyPayment = createAction({
  name: 'Verify Payment',
  auth,
  baseOptions,
  options: option.object({
    paymentResponse: option.string.layout({
      label: 'Payment Response',
      moreInfoTooltip: 'Payment response from Payment Button action',
    }),
    saveStatusInVariableId: option.string.layout({
      label: 'Payment Status',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: (options) =>
    options.saveStatusInVariableId ? [options.saveStatusInVariableId] : [],
  run: {
    server: async ({ credentials, options, variables, logs }) => {
      if (!credentials.keySecret)
        return logs.add(
          'Invalid razorpay secret. Please check your configuration.'
        )
      if (!options.paymentResponse)
        return logs.add(
          'Payment response is empty. Please check the logs for any error.'
        )
      if (!options.saveStatusInVariableId)
        return logs.add(
          'Payment Status variable is not specified. Please select a variable to save the payment status.'
        )

      try {
        const paymentResponse = JSON.parse(options.paymentResponse)

        const payload = paymentResponse.razorpay_order_id + '|' + paymentResponse.razorpay_payment_id;
        const checkPayment = await signatureVerified(credentials.keySecret, payload, paymentResponse.razorpay_signature)
        variables.set(options.saveStatusInVariableId, checkPayment)
      } catch (error) {
        return logs.add(error as string)
      }

    },
  },
})

async function signatureVerified(secret: string, payload: string, signature: string) {
  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  return await crypto.subtle.verify(
    "HMAC",
    key,
    hexToBuffer(signature),
    enc.encode(payload)
  )
}

function hexToBuffer(hex: string) {
  const matches = hex.match(/[\da-f]{2}/gi) ?? []; // grab hex pairs
  const { buffer } = new Uint8Array(matches.map((h: string) => parseInt(h, 16)));
  return buffer;
}
