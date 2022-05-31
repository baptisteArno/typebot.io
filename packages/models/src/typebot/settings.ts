export type Settings = {
  general: GeneralSettings
  typingEmulation: TypingEmulation
  metadata: Metadata
}

export type GeneralSettings = {
  isBrandingEnabled: boolean
  isNewResultOnRefreshEnabled?: boolean
  isInputPrefillEnabled?: boolean
  isHideQueryParamsEnabled?: boolean
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
  customHeadCode?: string
}

export const defaultSettings: Settings = {
  general: {
    isBrandingEnabled: true,
    isNewResultOnRefreshEnabled: false,
    isInputPrefillEnabled: true,
    isHideQueryParamsEnabled: true,
  },
  typingEmulation: { enabled: true, speed: 300, maxDelay: 1.5 },
  metadata: {
    description:
      'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.',
  },
}
