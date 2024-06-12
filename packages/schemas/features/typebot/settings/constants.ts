export const defaultSettings = {
  general: {
    isInputPrefillEnabled: false,
    isHideQueryParamsEnabled: true,
    isNewResultOnRefreshEnabled: true,
    rememberUser: {
      isEnabled: false,
      storage: 'session',
    },
    isBrandingEnabled: false,
    isTypingEmulationEnabled: true,
  },
  typingEmulation: {
    enabled: true,
    speed: 400,
    maxDelay: 3,
    delayBetweenBubbles: 0,
    isDisabledOnFirstMessage: true,
  },
  metadata: {
    description:
      // 'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.',
      'Fale com os seus clientes como eles quiserem! O Futuro do Atendimento já é presente!',
    favIconUrl: (viewerBaseUrl: string) => viewerBaseUrl + '/favicon.png',
    // imageUrl: (viewerBaseUrl: string) => viewerBaseUrl + '/site-preview.png',
    imageUrl: (viewerBaseUrl: string) => viewerBaseUrl + '/kwik_preview.png',
  },
} as const

export const rememberUserStorages = ['session', 'local'] as const
