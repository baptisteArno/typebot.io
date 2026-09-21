import { env } from '@typebot.io/env'

export interface GroupLimitResponse {
  maxGroups: number
  error?: string
}

export const isWorkspaceExcludedFromGroupsLimit = (
  workspaceId: string
): boolean =>
  env.NEXT_PUBLIC_GROUPS_LIMIT_EXCLUDED_WORKSPACE_IDS?.includes(
    workspaceId
  ) ?? false

export const checkGroupLimits = async (
  workspaceId: string
): Promise<GroupLimitResponse> => {
  if (isWorkspaceExcludedFromGroupsLimit(workspaceId)) {
    return { maxGroups: Number.MAX_SAFE_INTEGER }
  }
  const maxGroupsNumber = Number(env.NEXT_PUBLIC_HUB_MAX_GROUPS)
  try {
    // Use environment variable for hub URL, fallback to hardcoded URL if not set
    const hubUrl = env.NEXT_PUBLIC_HUB_URL || 'https://bot.avocad0.dev'

    const baseUrl = `${hubUrl}/api/v1/item/${workspaceId}/typbot`
    const shouldSendMax = Number.isFinite(maxGroupsNumber)
    const requestUrl = shouldSendMax
      ? `${baseUrl}?max_no_components=${maxGroupsNumber}`
      : baseUrl

    const response = await fetch(requestUrl, {
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
    })

    if (!response.ok) {
      return {
        maxGroups: maxGroupsNumber || 0,
        error: 'cannot call the api',
      }
    }

    const data = await response.json()

    // Check multiple possible response structures
    const apiLimit = data.data?.limit ?? data.limit

    console.log('Typebot Service Response: apiLimit', apiLimit)

    if (
      apiLimit !== undefined &&
      apiLimit !== null &&
      Number.isFinite(Number(apiLimit))
    ) {
      const limitValue = Number(apiLimit)
      if (limitValue > 0) {
        return {
          maxGroups: limitValue,
        }
      }
    }

    // If API succeeded but limit is missing or invalid, log error and use env as fallback
    console.warn(
      `API call succeeded but limit is missing or invalid. Response:`,
      JSON.stringify(data),
      `Tried paths: data.data?.limit, data.limit, data.data?.maxGroups, data.maxGroups`
    )
    console.log('Typebot Service Response: maxGroupsNumber', maxGroupsNumber)
    return {
      maxGroups: maxGroupsNumber || 0,
      error: 'API limit missing or invalid',
    }
  } catch (error) {
    return {
      maxGroups: maxGroupsNumber || 0,
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

    // If there was an error fetching limits, don't unpublish (conservative approach)
    if (limits.error) {
      console.warn(
        `Failed to fetch group limits for workspace ${workspaceId}: ${limits.error}. Using fallback limit: ${limits.maxGroups}`
      )
      // If API failed, don't unpublish (conservative approach)
      return false
    }

    // Safety checks
    if (limits.maxGroups <= 0) {
      console.error('Failed to fetch group limits: limit is invalid or zero')
      // If no groups allowed or API failed, don't unpublish (conservative approach)
      return false
    }

    const shouldUnpublish = currentGroupCount > limits.maxGroups
    if (shouldUnpublish) {
      console.log(
        `Typebot should be unpublished: ${currentGroupCount} groups > ${limits.maxGroups} limit`
      )
    }
    return shouldUnpublish
  } catch (error) {
    console.error('Error in shouldUnpublishTypebot:', error)
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
