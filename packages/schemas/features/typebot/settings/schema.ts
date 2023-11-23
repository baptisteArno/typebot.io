import { z } from 'zod'
import { rememberUserStorages } from './constants'
import { whatsAppSettingsSchema } from '../../whatsapp'

const generalSettings = z.object({
  isBrandingEnabled: z.boolean().optional(),
  isTypingEmulationEnabled: z.boolean().optional(),
  isInputPrefillEnabled: z.boolean().optional(),
  isHideQueryParamsEnabled: z.boolean().optional(),
  isNewResultOnRefreshEnabled: z.boolean().optional(),
  rememberUser: z
    .object({
      isEnabled: z.boolean().optional(),
      storage: z.enum(rememberUserStorages).optional(),
    })
    .optional(),
})

const typingEmulation = z.object({
  enabled: z.boolean().optional(),
  speed: z.number().optional(),
  maxDelay: z.number().optional(),
})

const metadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  favIconUrl: z.string().optional(),
  customHeadCode: z.string().optional(),
  googleTagManagerId: z.string().optional(),
})

export const settingsSchema = z.object({
  general: generalSettings.optional(),
  typingEmulation: typingEmulation.optional(),
  metadata: metadataSchema.optional(),
  whatsApp: whatsAppSettingsSchema.optional(),
  publicShare: z
    .object({
      isEnabled: z.boolean().optional(),
    })
    .optional(),
})

export type Settings = z.infer<typeof settingsSchema>
