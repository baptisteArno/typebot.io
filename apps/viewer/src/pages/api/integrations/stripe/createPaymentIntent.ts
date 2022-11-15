import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  decrypt,
  forbidden,
  initMiddleware,
  methodNotAllowed,
} from 'utils/api'
import Stripe from 'stripe'

import Cors from 'cors'
import { withSentry } from '@sentry/nextjs'
import { PaymentInputOptions, StripeCredentialsData, Variable } from 'models'
import prisma from '@/lib/prisma'
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
      { apiVersion: '2022-08-01' }
    )
    const amount =
      Number(parseVariables(variables)(inputOptions.amount)) *
      (isZeroDecimalCurrency(inputOptions.currency) ? 1 : 100)
    if (isNaN(amount)) return badRequest(res)
    // Create a PaymentIntent with the order amount and currency
    const receiptEmail = parseVariables(variables)(
      inputOptions.additionalInformation?.email
    )
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: inputOptions.currency,
        receipt_email: receiptEmail === '' ? undefined : receiptEmail,
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
        amountLabel: `${
          amount / (isZeroDecimalCurrency(inputOptions.currency) ? 1 : 100)
        }${
          currencySymbols[inputOptions.currency] ?? ` ${inputOptions.currency}`
        }`,
      })
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any
      return 'raw' in error
        ? res.status(error.raw.statusCode).send({
            error: {
              name: `${error.raw.type} ${error.raw.param}`,
              message: error.raw.message,
            },
          })
        : res.status(500).send({
            error,
          })
    }
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

// https://stripe.com/docs/currencies#zero-decimal
const isZeroDecimalCurrency = (currency: string) =>
  [
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
  ].includes(currency)

export default withSentry(handler)
