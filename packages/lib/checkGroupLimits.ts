import { env } from '@typebot.io/env'

export interface GroupLimitResponse {
  maxGroups: number
  error?: string
}

export const checkGroupLimits = async (
  workspaceId: string
): Promise<GroupLimitResponse> => {
  try {
    // Use environment variable for hub URL, fallback to hardcoded URL if not set
    const hubUrl = env.NEXT_PUBLIC_HUB_URL || 'https://bot.avocad0.dev'

    console.log(
      `Checking group limits for workspace ${workspaceId} using hub URL: ${hubUrl}`
    )

    const response = await fetch(
      `${hubUrl}/api/v1/item/${workspaceId}/typbot`,
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

    if (!response.ok) {
      console.error(
        `Failed to fetch group limits: HTTP ${response.status} - ${response.statusText}`
      )
      return {
        maxGroups: 0,
        error: 'cannot call the api',
      }
    }

    const data = await response.json()
    console.log(`Group limits API response:`, data)

    return {
      maxGroups: data.data?.limit || 0,
    }
  } catch (error) {
    console.error('Failed to fetch group limits: from error', error)
    return {
      maxGroups: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export const shouldUnpublishTypebot = async (
  workspaceId: string,
  currentGroupCount: number
): Promise<boolean> => {
  try {
    const limits = await checkGroupLimits(workspaceId)

    // Safety checks
    if (limits.maxGroups <= 0) {
      console.error(
        'Failed to fetch group limits limits invalid: Cannot Call API'
      )
      // If no groups allowed or API failed, don't unpublish (conservative approach)
      return false
    }

    return currentGroupCount > limits.maxGroups
  } catch {
    // If API fails, don't unpublish (conservative approach)
    return false
  }
}

// Helper function to check if a typebot can have more groups
export const canAddMoreGroups = async (
  workspaceId: string,
  currentGroupCount: number
): Promise<boolean> => {
  try {
    const limits = await checkGroupLimits(workspaceId)

    // Safety checks
    if (limits.maxGroups <= 0) {
      console.log(`Cannot add more groups: maxGroups is ${limits.maxGroups}`)
      // If no groups allowed or API failed, don't allow adding groups
      return false
    }

    const canAdd = currentGroupCount < limits.maxGroups
    console.log(
      `Can add more groups: ${canAdd} (${currentGroupCount} < ${limits.maxGroups})`
    )

    return canAdd
  } catch (error) {
    console.error('Error in canAddMoreGroups:', error)
    // If API fails, don't allow adding groups (conservative approach)
    return false
  }
}
