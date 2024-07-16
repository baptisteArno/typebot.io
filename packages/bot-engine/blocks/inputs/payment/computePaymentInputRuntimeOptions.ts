import { TRPCError } from '@trpc/server'
import {
  PaymentInputBlock,
  PaymentInputRuntimeOptions,
  SessionState,
  StripeCredentials,
} from '@typebot.io/schemas'
import Stripe from 'stripe'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import prisma from '@typebot.io/lib/prisma'
import { defaultPaymentInputOptions } from '@typebot.io/schemas/features/blocks/inputs/payment/constants'

export const computePaymentInputRuntimeOptions =
  (state: SessionState) => (options: PaymentInputBlock['options']) =>
    createStripePaymentIntent(state)(options)

const createStripePaymentIntent =
  (state: SessionState) =>
  async (
    options: PaymentInputBlock['options']
  ): Promise<PaymentInputRuntimeOptions> => {
    const {
      resultId,
      typebot: { variables },
    } = state.typebotsQueue[0]
    const isPreview = !resultId
    if (!options?.credentialsId)
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
    const currency = options?.currency ?? defaultPaymentInputOptions.currency
    const amount = Math.round(
      Number(parseVariables(variables)(options.amount)) *
        (isZeroDecimalCurrency(currency) ? 1 : 100)
    )
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
      currency,
      receipt_email: receiptEmail === '' ? undefined : receiptEmail,
      description: parseVariables(variables)(
        options.additionalInformation?.description
      ),
      automatic_payment_methods: {
        enabled: true,
      },
    })

    if (!paymentIntent.client_secret)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Could not create payment intent',
      })

    const priceFormatter = new Intl.NumberFormat(
      options.currency === 'EUR' ? 'fr-FR' : undefined,
      {
        style: 'currency',
        currency,
      }
    )

    return {
      paymentIntentSecret: paymentIntent.client_secret,
      publicKey:
        isPreview && stripeKeys.test?.publicKey
          ? stripeKeys.test.publicKey
          : stripeKeys.live.publicKey,
      amountLabel: priceFormatter.format(
        amount / (isZeroDecimalCurrency(currency) ? 1 : 100)
      ),
    }
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
