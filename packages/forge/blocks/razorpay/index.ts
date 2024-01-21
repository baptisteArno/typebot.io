import { createBlock } from '@typebot.io/forge'
import { RazorpayLogo } from './logo'
import { auth } from './auth'

export const razorpay = createBlock({
  id: 'razorpay',
  name: 'Razorpay',
  tags: [],
  LightLogo: RazorpayLogo,
  auth,
  actions: [],
})
