import { z } from 'zod'

const generalSettings = z.object({
  isBrandingEnabled: z.boolean(),
  isTypingEmulationEnabled: z.boolean().optional(),
  isInputPrefillEnabled: z.boolean().optional(),
  isHideQueryParamsEnabled: z.boolean().optional(),
  isNewResultOnRefreshEnabled: z.boolean().optional(),
})

const typingEmulation = z.object({
  enabled: z.boolean(),
  speed: z.number(),
  maxDelay: z.number(),
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
  general: generalSettings,
  typingEmulation: typingEmulation,
  metadata: metadataSchema,
})

export const defaultSettings: Settings = {
  general: {
    isBrandingEnabled: true,
    isNewResultOnRefreshEnabled: true,
    isInputPrefillEnabled: true,
    isHideQueryParamsEnabled: true,
  },
  typingEmulation: { enabled: true, speed: 300, maxDelay: 1.5 },
  metadata: {
    description:
      'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.',
  },
}

export type Settings = z.infer<typeof settingsSchema>
export type GeneralSettings = z.infer<typeof generalSettings>
export type TypingEmulation = z.infer<typeof typingEmulation>
export type Metadata = z.infer<typeof metadataSchema>
