export type Settings = {
  general: GeneralSettings
  typingEmulation: TypingEmulation
  metadata: Metadata
}

export type GeneralSettings = {
  isBrandingEnabled: boolean
  isNewResultOnRefreshEnabled?: boolean
}

export type TypingEmulation = {
  enabled: boolean
  speed: number
  maxDelay: number
}

export type Metadata = {
  title?: string
  description: string
  imageUrl?: string
  favIconUrl?: string
}

export const defaultSettings: Settings = {
  general: { isBrandingEnabled: true, isNewResultOnRefreshEnabled: false },
  typingEmulation: { enabled: true, speed: 300, maxDelay: 1.5 },
  metadata: {
    description:
      'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.',
  },
}
