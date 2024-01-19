import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { createHmac, timingSafeEqual } from 'crypto'
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
        const expectedSignature = createHmac('sha256', credentials.keySecret).update(payload).digest('hex');
        variables.set(options.saveStatusInVariableId, timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(paymentResponse.razorpay_signature)))
      } catch (error) {
        return logs.add(error as string)
      }


    },
  },
})
