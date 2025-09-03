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
    data: z.union([
      z.object({
        provider: z.literal("meta").optional(),
        systemUserAccessToken: z.string(),
        phoneNumberId: z.string(),
      }),
      z.object({
        provider: z.literal("360dialog"),
        apiKey: z.string(),
      }),
    ]),
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

export const httpProxyCredentialsSchema = z
  .object({
    type: z.literal("http proxy"),
    data: z.object({
      url: z.string(),
    }),
  })
  .merge(credentialsBaseSchema);
export type HttpProxyCredentials = z.infer<typeof httpProxyCredentialsSchema>;

export const creatableCredentialsSchemas = [
  smtpCredentialsSchema,
  googleSheetsCredentialsSchema,
  stripeCredentialsSchema,
  whatsAppCredentialsSchema,
] as const;

const credentialsSchema = z.discriminatedUnion("type", [
  ...creatableCredentialsSchemas,
  httpProxyCredentialsSchema,
  ...Object.values(forgedCredentialsSchemas),
]);
export type Credentials = z.infer<typeof credentialsSchema>;

const creatableCredentials = z.discriminatedUnion("type", [
  ...creatableCredentialsSchemas,
  ...Object.values(forgedCredentialsSchemas),
]);
export type CreatableCredentials = z.infer<typeof creatableCredentials>;

export const credentialsTypes = [
  "smtp",
  "google sheets",
  "stripe",
  "whatsApp",
  "http proxy",
  ...(Object.keys(forgedCredentialsSchemas) as Array<
    keyof typeof forgedCredentialsSchemas
  >),
] as const;

export const credentialsTypeSchema = z.enum(credentialsTypes);
