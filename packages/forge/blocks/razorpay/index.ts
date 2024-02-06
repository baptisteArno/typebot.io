import { createBlock } from '@typebot.io/forge'
import { RazorpayLogo } from './logo'
import { auth } from './auth'
import { baseOptions } from './baseOptions'
import { createQrCode } from './actions/createQrCode'
import { createOrder } from './actions/createOrder'
import { createPaymentButton } from './actions/createPaymentButton'
import { verifyPayment } from './actions/verifyPayment'

export const razorpay = createBlock({
  id: 'razorpay',
  name: 'Razorpay',
  tags: ['razorpay', 'payment gateway', 'payments'],
  LightLogo: RazorpayLogo,
  auth,
  options: baseOptions,
  actions: [createQrCode, createOrder, createPaymentButton, verifyPayment],
})
