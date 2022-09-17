import { sendRequest } from 'utils'

export const redirectToBillingPortal = ({
  workspaceId,
}: {
  workspaceId: string
}) => sendRequest(`/api/stripe/billing-portal?workspaceId=${workspaceId}`)
