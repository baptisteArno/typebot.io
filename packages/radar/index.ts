import { env } from '@typebot.io/env'

export const computeRiskLevel = (typebot: any) => {
  const stringifiedTypebot = JSON.stringify(typebot)
  if (
    env.RADAR_HIGH_RISK_KEYWORDS?.some((keyword) =>
      new RegExp(`(?<!https?://[^\\s"]*)\\b${keyword}\\b`, 'gi').test(
        stringifiedTypebot
      )
    )
  )
    return 100
  if (
    env.RADAR_CUMULATIVE_KEYWORDS?.some((set) =>
      set.every((keyword) =>
        keyword.some((k) =>
          new RegExp(`(?<!https?://[^\\s"]*)\\b${k}\\b`, 'gi').test(
            stringifiedTypebot
          )
        )
      )
    )
  )
    return 100
  if (
    env.RADAR_INTERMEDIATE_RISK_KEYWORDS?.some((keyword) =>
      stringifiedTypebot.toLowerCase().includes(keyword)
    )
  )
    return 50
  return 0
}
