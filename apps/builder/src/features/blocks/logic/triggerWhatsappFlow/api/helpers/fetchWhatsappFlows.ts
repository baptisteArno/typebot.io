import { env } from '@typebot.io/env'

export type WhatsappFlow = {
  id: string
  name: string
}

/**
 * Fetches the published WhatsApp Flows of the business a Typebot workspace is
 * linked to, through the Avocado Hub (the same trust boundary the builder
 * already uses in `fetchSmartAssignmentRules`). Must run server-side: it
 * attaches the shared `X-API-SIGNATURE` secret and keys off the workspace id
 * — never call it from the browser. Returns an empty list on any failure so
 * the settings UI degrades gracefully to "no flows found".
 */
export const fetchWhatsappFlows = async (
  workspaceId: string
): Promise<WhatsappFlow[]> => {
  try {
    const hubUrl = env.NEXT_PUBLIC_HUB_URL || 'https://bot.avocad0.dev'

    const response = await fetch(
      `${hubUrl}/api/v1/item/${workspaceId}/whatsapp-flows`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(hubUrl.includes('ngrok') && {
            'ngrok-skip-browser-warning': '69420',
          }),
          ...(env.NEXT_PUBLIC_HUB_API_SIGNATURE && {
            'X-API-SIGNATURE': env.NEXT_PUBLIC_HUB_API_SIGNATURE,
          }),
        },
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return (data?.data as WhatsappFlow[]) ?? []
  } catch {
    return []
  }
}
