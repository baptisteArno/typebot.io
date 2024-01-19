import { createBlock } from '@typebot.io/forge'
import { RazorpayLogo } from './logo'
import { auth } from './auth'
import { createQrCode } from './actions/createQrCode'
import { baseOptions } from './baseOptions'
import { createPaymentButton } from './actions/createPaymentButton'
import { createOrder } from './actions/createOrder'
import { verifyPayment } from './actions/verifyPayment'

export const razorpay = createBlock({
  id: 'razorpay',
  name: 'Razorpay',
  tags: [],
  LightLogo: RazorpayLogo,
  auth,
  options: baseOptions,
  actions: [createQrCode, createOrder, createPaymentButton, verifyPayment],
})
