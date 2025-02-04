import { forgedCredentialsSchemas } from "@typebot.io/forge-repository/credentials";
import { z } from "@typebot.io/zod";

export const credentialsBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  iv: z.string(),
});

export const whatsAppCredentialsSchema = z
  .object({
    type: z.literal("whatsApp"),
    data: z.object({
      systemUserAccessToken: z.string(),
      phoneNumberId: z.string(),
    }),
  })
  .merge(credentialsBaseSchema);
export type WhatsAppCredentials = z.infer<typeof whatsAppCredentialsSchema>;

export const stripeCredentialsSchema = z
  .object({
    type: z.literal("stripe"),
    data: z.object({
      live: z.object({
        secretKey: z.string(),
        publicKey: z.string(),
      }),
      test: z.object({
        secretKey: z.string().optional(),
        publicKey: z.string().optional(),
      }),
    }),
  })
  .merge(credentialsBaseSchema);
export type StripeCredentials = z.infer<typeof stripeCredentialsSchema>;

export const googleSheetsCredentialsSchema = z
  .object({
    type: z.literal("google sheets"),
    data: z.object({
      refresh_token: z.string().nullish(),
      expiry_date: z.number().nullish(),
      access_token: z.string().nullish(),
      token_type: z.string().nullish(),
      id_token: z.string().nullish(),
      scope: z.string().optional(),
    }),
  })
  .merge(credentialsBaseSchema);
export type GoogleSheetsCredentials = z.infer<
  typeof googleSheetsCredentialsSchema
>;

export const smtpCredentialsSchema = z
  .object({
    type: z.literal("smtp"),
    data: z.object({
      host: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      isTlsEnabled: z.boolean().optional(),
      port: z.number(),
      from: z.object({
        email: z.string().optional(),
        name: z.string().optional(),
      }),
    }),
  })
  .merge(credentialsBaseSchema);
export type SmtpCredentials = z.infer<typeof smtpCredentialsSchema>;

const credentialsSchema = z.discriminatedUnion("type", [
  smtpCredentialsSchema,
  googleSheetsCredentialsSchema,
  stripeCredentialsSchema,
  whatsAppCredentialsSchema,
  ...Object.values(forgedCredentialsSchemas),
]);
export type Credentials = z.infer<typeof credentialsSchema>;

export const credentialsTypes = [
  "smtp",
  "google sheets",
  "stripe",
  "whatsApp",
  ...(Object.keys(forgedCredentialsSchemas) as Array<
    keyof typeof forgedCredentialsSchemas
  >),
] as const;

export const credentialsTypeSchema = z.enum(credentialsTypes);
