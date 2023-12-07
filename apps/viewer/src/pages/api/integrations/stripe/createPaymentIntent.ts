import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  forbidden,
  initMiddleware,
  methodNotAllowed,
} from '@typebot.io/lib/api'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import Stripe from 'stripe'

import Cors from 'cors'
import {
  PaymentInputBlock,
  StripeCredentials,
  Variable,
} from '@typebot.io/schemas'
import prisma from '@typebot.io/lib/prisma'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import { defaultPaymentInputOptions } from '@typebot.io/schemas/features/blocks/inputs/payment/constants'

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
      inputOptions: PaymentInputBlock['options']
      isPreview: boolean
      variables: Variable[]
    }
    if (!inputOptions?.credentialsId) return forbidden(res)
    const stripeKeys = await getStripeInfo(inputOptions.credentialsId)
    if (!stripeKeys) return forbidden(res)
    const stripe = new Stripe(
      isPreview && stripeKeys?.test?.secretKey
        ? stripeKeys.test.secretKey
        : stripeKeys.live.secretKey,
      { apiVersion: '2022-11-15' }
    )

    const currency =
      inputOptions.currency ?? defaultPaymentInputOptions.currency

    const amount = Math.round(
      Number(parseVariables(variables)(inputOptions.amount)) *
        (isZeroDecimalCurrency(currency) ? 1 : 100)
    )
    if (isNaN(amount)) return badRequest(res)
    // Create a PaymentIntent with the order amount and currency
    const receiptEmail = parseVariables(variables)(
      inputOptions.additionalInformation?.email
    )
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
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
        amountLabel: `${amount / (isZeroDecimalCurrency(currency) ? 1 : 100)}${
          currencySymbols[currency] ?? ` ${currency}`
        }`,
      })
    } catch (err) {
      if (typeof err === 'object' && err && 'raw' in err) {
        const error = (err as { raw: Stripe.StripeRawError }).raw
        res.status(error.statusCode ?? 500).send({
          error: {
            name: `${error.type} ${error.param}`,
            message: error.message,
          },
        })
      } else {
        res.status(500).send({
          err,
        })
      }
    }
  }
  return methodNotAllowed(res)
}

const getStripeInfo = async (
  credentialsId: string
): Promise<StripeCredentials['data'] | undefined> => {
  const credentials = await prisma.credentials.findUnique({
    where: { id: credentialsId },
  })
  if (!credentials) return
  return (await decrypt(
    credentials.data,
    credentials.iv
  )) as StripeCredentials['data']
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

export default handler
