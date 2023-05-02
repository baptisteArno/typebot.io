import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { IntegrationBlockType } from './enums'
import { variableStringSchema } from '../../utils'

export const googleAnalyticsOptionsSchema = z.object({
  trackingId: z.string().optional(),
  category: z.string().optional(),
  action: z.string().optional(),
  label: z.string().optional(),
  value: z.number().or(variableStringSchema).optional(),
  sendTo: z.string().optional(),
})

export const googleAnalyticsBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.GOOGLE_ANALYTICS]),
    options: googleAnalyticsOptionsSchema,
  })
)

export const defaultGoogleAnalyticsOptions: GoogleAnalyticsOptions = {}

export type GoogleAnalyticsBlock = z.infer<typeof googleAnalyticsBlockSchema>
export type GoogleAnalyticsOptions = z.infer<
  typeof googleAnalyticsOptionsSchema
>
