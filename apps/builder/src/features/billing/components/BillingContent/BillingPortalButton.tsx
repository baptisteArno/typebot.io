import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { Button, Link } from '@chakra-ui/react'

type Props = {
  workspaceId: string
}

export const BillingPortalButton = ({ workspaceId }: Props) => {
  const { showToast } = useToast()
  const { data } = trpc.billing.getBillingPortalUrl.useQuery(
    {
      workspaceId,
    },
    {
      onError: (error) => {
        showToast({
          description: error.message,
        })
      },
    }
  )
  return (
    <Button as={Link} href={data?.billingPortalUrl} isLoading={!data}>
      Billing Portal
    </Button>
  )
}
