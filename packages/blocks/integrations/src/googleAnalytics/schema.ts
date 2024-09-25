import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { variableStringSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { IntegrationBlockType } from "../constants";

export const googleAnalyticsOptionsSchema = z.object({
  trackingId: z.string().optional(),
  category: z.string().optional(),
  action: z.string().optional(),
  label: z.string().optional(),
  value: z.number().or(variableStringSchema).optional(),
  sendTo: z.string().optional(),
});

export const googleAnalyticsBlockSchema = blockBaseSchema
  .merge(
    z.object({
      type: z.enum([IntegrationBlockType.GOOGLE_ANALYTICS]),
      options: googleAnalyticsOptionsSchema.optional(),
    }),
  )
  .openapi({
    title: "Google Analytics",
    ref: "googleAnalyticsBlock",
  });

export type GoogleAnalyticsBlock = z.infer<typeof googleAnalyticsBlockSchema>;
