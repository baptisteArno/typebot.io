import { z } from 'zod'
import { IntegrationStepType, stepBaseSchema } from '../shared'

export const googleAnalyticsOptionsSchema = z.object({
  trackingId: z.string().optional(),
  category: z.string().optional(),
  action: z.string().optional(),
  label: z.string().optional(),
  value: z.number().optional(),
})

export const googleAnalyticsStepSchema = stepBaseSchema.and(
  z.object({
    type: z.enum([IntegrationStepType.GOOGLE_ANALYTICS]),
    options: googleAnalyticsOptionsSchema,
  })
)

export const defaultGoogleAnalyticsOptions: GoogleAnalyticsOptions = {}

export type GoogleAnalyticsStep = z.infer<typeof googleAnalyticsStepSchema>
export type GoogleAnalyticsOptions = z.infer<
  typeof googleAnalyticsOptionsSchema
>
