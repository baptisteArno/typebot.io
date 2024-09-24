import { stripeCredentialsSchema } from "@typebot.io/blocks-inputs/payment/schema";
import { googleSheetsCredentialsSchema } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { smtpCredentialsSchema } from "@typebot.io/blocks-integrations/sendEmail/schema";
import { forgedCredentialsSchemas } from "@typebot.io/forge-repository/credentials";
import { whatsAppCredentialsSchema } from "@typebot.io/whatsapp/schemas";
import { z } from "@typebot.io/zod";

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
