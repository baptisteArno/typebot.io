import { env } from '@typebot.io/env'

export const computeRiskLevel = (typebot: any) => {
  const stringifiedTypebot = JSON.stringify(typebot)
  if (!env.RADAR_HIGH_RISK_KEYWORDS) return 0
  if (
    env.RADAR_HIGH_RISK_KEYWORDS.some((keyword) =>
      stringifiedTypebot.toLowerCase().includes(keyword)
    )
  )
    return 100
  if (!env.RADAR_INTERMEDIATE_RISK_KEYWORDS) return 0
  if (
    env.RADAR_INTERMEDIATE_RISK_KEYWORDS.some((keyword) =>
      stringifiedTypebot.toLowerCase().includes(keyword)
    )
  )
    return 50
  return 0
}
