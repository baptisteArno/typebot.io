import { sendRequest } from 'utils'

export const redeemCoupon = async (code: string) =>
  sendRequest<{ message: string }>({
    method: 'POST',
    url: '/api/coupons/redeem',
    body: { code },
  })
