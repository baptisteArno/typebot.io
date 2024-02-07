export type VoicesResponse = {
  voices: {
    name: string
    voice_id: string
  }[]
}

export type ModelsResponse = {
  model_id: string
  name: string
}[]
