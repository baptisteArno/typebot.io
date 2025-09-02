export interface GroupLimitResponse {
  maxGroups: number
  error?: string
}

export const checkGroupLimits = async (
  workspaceId: string
): Promise<GroupLimitResponse> => {
  try {
    const response = await fetch(
      `${process.env.HUB_URL}/api/v1/item/${workspaceId}/typebot`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-SIGNATURE': process.env.HUB_API_SIGNATURE,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()
    return {
      maxGroups: data.maxGroups || 0,
    }
  } catch (error) {
    console.error('Failed to fetch group limits:', error)
    // Default to no additional groups if API fails
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
      // If no groups allowed or API failed, don't allow adding groups
      return false
    }
    
    return currentGroupCount < limits.maxGroups
  } catch {
    // If API fails, don't allow adding groups (conservative approach)
    return false
  }
}
