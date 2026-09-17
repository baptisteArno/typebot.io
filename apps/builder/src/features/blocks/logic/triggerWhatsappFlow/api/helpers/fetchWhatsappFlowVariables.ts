import { env } from '@typebot.io/env'

export type WhatsappFlowVariable = {
  name: string
  type: string
  example?: unknown
}

/**
 * Fetches the declared entry-screen data fields of one WhatsApp Flow — what a
 * caller must supply to open it correctly — through the Avocado Hub. Same
 * trust boundary as `fetchWhatsappFlows`. Returns an empty list on any
 * failure so the settings UI degrades gracefully to "no fields found" rather
 * than breaking the block's settings panel.
 */
export const fetchWhatsappFlowVariables = async (
  workspaceId: string,
  flowId: string
): Promise<WhatsappFlowVariable[]> => {
  try {
    const hubUrl = env.NEXT_PUBLIC_HUB_URL || 'https://bot.avocad0.dev'

    const response = await fetch(
      `${hubUrl}/api/v1/item/${workspaceId}/whatsapp-flows/${flowId}/variables`,
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
    return (data?.data as WhatsappFlowVariable[]) ?? []
  } catch {
    return []
  }
}
