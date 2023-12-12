export type ZemanticAiResponse = {
  results: { documentId: string; text: string; score: number }[]
  summary: string
}
