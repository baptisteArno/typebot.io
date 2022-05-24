import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  decrypt,
  forbidden,
  initMiddleware,
  methodNotAllowed,
} from 'utils'
import Stripe from 'stripe'

import Cors from 'cors'
import { withSentry } from '@sentry/nextjs'
import { PaymentInputOptions, StripeCredentialsData, Variable } from 'models'
import prisma from 'libs/prisma'
import { parseVariables } from 'bot-engine'

const cors = initMiddleware(Cors())

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  CRC: '₡',
  GBP: '£',
  ILS: '₪',
  INR: '₹',
  JPY: '¥',
  KRW: '₩',
  NGN: '₦',
  PHP: '₱',
  PLN: 'zł',
  PYG: '₲',
  THB: '฿',
  UAH: '₴',
  VND: '₫',
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const { inputOptions, isPreview, variables } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      inputOptions: PaymentInputOptions
      isPreview: boolean
      variables: Variable[]
    }
    if (!inputOptions.credentialsId) return forbidden(res)
    const stripeKeys = await getStripeInfo(inputOptions.credentialsId)
    if (!stripeKeys) return forbidden(res)
    const stripe = new Stripe(
      isPreview && stripeKeys?.test?.secretKey
        ? stripeKeys.test.secretKey
        : stripeKeys.live.secretKey,
      { apiVersion: '2020-08-27' }
    )
    console.log(variables, inputOptions)
    const amount = Math.round(
      Number(parseVariables(variables)(inputOptions.amount)) * 100
    )
    if (isNaN(amount)) return badRequest(res)
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: inputOptions.currency,
      receipt_email: inputOptions.additionalInformation?.email,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return res.send({
      clientSecret: paymentIntent.client_secret,
      publicKey:
        isPreview && stripeKeys.test?.publicKey
          ? stripeKeys.test.publicKey
          : stripeKeys.live.publicKey,
      amountLabel: `${amount / 100}${currencySymbols[inputOptions.currency]}`,
    })
  }
  return methodNotAllowed(res)
}

const getStripeInfo = async (
  credentialsId: string
): Promise<StripeCredentialsData | undefined> => {
  const credentials = await prisma.credentials.findUnique({
    where: { id: credentialsId },
  })
  if (!credentials) return
  return decrypt(credentials.data, credentials.iv) as StripeCredentialsData
}

export default withSentry(handler)
