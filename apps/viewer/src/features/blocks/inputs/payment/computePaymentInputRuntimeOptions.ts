import { parseVariables } from '@/features/variables/parseVariables'
import prisma from '@/lib/prisma'
import { TRPCError } from '@trpc/server'
import {
  PaymentInputOptions,
  PaymentInputRuntimeOptions,
  SessionState,
  StripeCredentials,
} from '@typebot.io/schemas'
import Stripe from 'stripe'
import { decrypt } from '@typebot.io/lib/api/encryption'

export const computePaymentInputRuntimeOptions =
  (state: Pick<SessionState, 'result' | 'typebot'>) =>
  (options: PaymentInputOptions) =>
    createStripePaymentIntent(state)(options)

const createStripePaymentIntent =
  (state: Pick<SessionState, 'result' | 'typebot'>) =>
  async (options: PaymentInputOptions): Promise<PaymentInputRuntimeOptions> => {
    const {
      result,
      typebot: { variables },
    } = state
    const isPreview = !result.id
    if (!options.credentialsId)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing credentialsId',
      })
    const stripeKeys = await getStripeInfo(options.credentialsId)
    if (!stripeKeys)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Credentials not found',
      })
    const stripe = new Stripe(
      isPreview && stripeKeys?.test?.secretKey
        ? stripeKeys.test.secretKey
        : stripeKeys.live.secretKey,
      { apiVersion: '2022-11-15' }
    )
    const amount =
      Number(parseVariables(variables)(options.amount)) *
      (isZeroDecimalCurrency(options.currency) ? 1 : 100)
    if (isNaN(amount))
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Could not parse amount, make sure your block is configured correctly',
      })
    // Create a PaymentIntent with the order amount and currency
    const receiptEmail = parseVariables(variables)(
      options.additionalInformation?.email
    )
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: options.currency,
      receipt_email: receiptEmail === '' ? undefined : receiptEmail,
      description: options.additionalInformation?.description,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    if (!paymentIntent.client_secret)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Could not create payment intent',
      })

    return {
      paymentIntentSecret: paymentIntent.client_secret,
      publicKey:
        isPreview && stripeKeys.test?.publicKey
          ? stripeKeys.test.publicKey
          : stripeKeys.live.publicKey,
      amountLabel: `${
        amount / (isZeroDecimalCurrency(options.currency) ? 1 : 100)
      }${currencySymbols[options.currency] ?? ` ${options.currency}`}`,
    }
  }

const getStripeInfo = async (
  credentialsId: string
): Promise<StripeCredentials['data'] | undefined> => {
  const credentials = await prisma.credentials.findUnique({
    where: { id: credentialsId },
  })
  if (!credentials) return
  return decrypt(credentials.data, credentials.iv) as StripeCredentials['data']
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
