import {
  blockBaseSchema,
  optionBaseSchema,
} from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { InputBlockType } from "../constants";
import { PaymentProvider } from "./constants";

export type CreditCardDetails = {
  number: string;
  exp_month: string;
  exp_year: string;
  cvc: string;
};

const addressSchema = z.object({
  country: z.string().optional(),
  line1: z.string().optional(),
  line2: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

export const paymentInputOptionsSchema = optionBaseSchema.merge(
  z.object({
    provider: z.nativeEnum(PaymentProvider).optional(),
    labels: z
      .object({
        button: z.string().optional(),
        success: z.string().optional(),
      })
      .optional(),
    additionalInformation: z
      .object({
        description: z.string().optional(),
        name: z.string().optional(),
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
        address: addressSchema.optional(),
      })
      .optional(),
    credentialsId: z.string().optional(),
    currency: z.string().optional(),
    amount: z.string().optional(),
    retryMessageContent: z.string().optional(),
  }),
);

export const paymentInputRuntimeOptionsSchema = z.object({
  paymentIntentSecret: z.string(),
  amountLabel: z.string(),
  publicKey: z.string(),
});

export const paymentInputSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([InputBlockType.PAYMENT]),
      options: paymentInputOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Payment",
    ref: "paymentInput",
  });

export type PaymentInputBlock = z.infer<typeof paymentInputSchema>;
export type PaymentInputRuntimeOptions = z.infer<
  typeof paymentInputRuntimeOptionsSchema
>;

export type PaymentAddress = NonNullable<
  NonNullable<PaymentInputBlock["options"]>["additionalInformation"]
>["address"];
