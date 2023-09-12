import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { useScopedI18n } from '@/locales'
import { Button, ButtonProps, Link } from '@chakra-ui/react'

type Props = {
  workspaceId: string
} & Pick<ButtonProps, 'colorScheme'>

export const BillingPortalButton = ({ workspaceId, colorScheme }: Props) => {
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
    <Button
      as={Link}
      href={data?.billingPortalUrl}
      isLoading={!data}
      colorScheme={colorScheme}
    >
      {scopedT('billingPortalButton.label')}
    </Button>
  )
}
