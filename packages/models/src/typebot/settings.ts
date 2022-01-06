export type Settings = {
  typingEmulation: TypingEmulationSettings
}

export type TypingEmulationSettings = {
  enabled: boolean
  speed: number
  maxDelay: number
}
