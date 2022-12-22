import { z } from 'zod'
import { InputBlockType, optionBaseSchema, blockBaseSchema } from '../shared'

export type CreditCardDetails = {
  number: string
  exp_month: string
  exp_year: string
  cvc: string
}

export enum PaymentProvider {
  STRIPE = 'Stripe',
}

export const paymentInputOptionsSchema = optionBaseSchema.and(
  z.object({
    provider: z.nativeEnum(PaymentProvider),
    labels: z.object({
      button: z.string(),
      success: z.string().optional(),
    }),
    additionalInformation: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
      })
      .optional(),
    credentialsId: z.string().optional(),
    currency: z.string(),
    amount: z.string().optional(),
  })
)

export const paymentInputRuntimeOptionsSchema = z.object({
  paymentIntentSecret: z.string(),
  amountLabel: z.string(),
  publicKey: z.string(),
})

export const paymentInputSchema = blockBaseSchema.and(
  z.object({
    type: z.enum([InputBlockType.PAYMENT]),
    options: paymentInputOptionsSchema,
  })
)

export const defaultPaymentInputOptions: PaymentInputOptions = {
  provider: PaymentProvider.STRIPE,
  labels: { button: 'Pay', success: 'Success' },
  currency: 'USD',
}

export type PaymentInputBlock = z.infer<typeof paymentInputSchema>
export type PaymentInputOptions = z.infer<typeof paymentInputOptionsSchema>
export type PaymentInputRuntimeOptions = z.infer<
  typeof paymentInputRuntimeOptionsSchema
>
