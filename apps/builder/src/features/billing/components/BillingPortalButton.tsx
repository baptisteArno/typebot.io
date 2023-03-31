import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { useScopedI18n } from '@/locales'
import { Button, Link } from '@chakra-ui/react'

type Props = {
  workspaceId: string
}

export const BillingPortalButton = ({ workspaceId }: Props) => {
  const scopedT = useScopedI18n('billing')
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
      {scopedT('billingPortalButton.label')}
    </Button>
  )
}
