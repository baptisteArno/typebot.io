import { Group } from '@typebot.io/schemas'
import { env } from '@typebot.io/env'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { TDescendant, TElement, TText } from '@udecode/plate-common'

export const computeRiskLevel = ({
  name,
  groups,
}: {
  name: string
  groups: Group[]
}) => {
  if (!env.RADAR_HIGH_RISK_KEYWORDS) return 0
  if (
    env.RADAR_HIGH_RISK_KEYWORDS.some((keyword) =>
      name.toLowerCase().includes(keyword)
    )
  )
    return 100
  let hasSuspiciousKeywords = false
  for (const group of groups) {
    for (const block of group.blocks) {
      if (block.type !== BubbleBlockType.TEXT) continue
      for (const descendant of block.content?.richText as TDescendant[]) {
        if (
          env.RADAR_HIGH_RISK_KEYWORDS &&
          richTextElementContainsKeywords(env.RADAR_HIGH_RISK_KEYWORDS)(
            descendant
          )
        )
          return 100
        if (
          env.RADAR_INTERMEDIATE_RISK_KEYWORDS &&
          richTextElementContainsKeywords(env.RADAR_INTERMEDIATE_RISK_KEYWORDS)(
            descendant
          )
        )
          hasSuspiciousKeywords = true
      }
    }
  }
  return hasSuspiciousKeywords ? 50 : 0
}

const richTextElementContainsKeywords =
  (keywords: string[]) => (element: TElement | TText) => {
    if (element.text)
      return keywords.some((keyword) =>
        (element.text as string).toLowerCase().includes(keyword)
      )
    if (element.children)
      return (element.children as TDescendant[]).some(
        richTextElementContainsKeywords(keywords)
      )
    return false
  }
