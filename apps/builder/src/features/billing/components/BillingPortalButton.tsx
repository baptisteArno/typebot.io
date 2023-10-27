import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { useTranslate } from '@tolgee/react'
import { Button, ButtonProps, Link } from '@chakra-ui/react'

type Props = {
  workspaceId: string
} & Pick<ButtonProps, 'colorScheme'>

export const BillingPortalButton = ({ workspaceId, colorScheme }: Props) => {
  const { t } = useTranslate()
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
      {t('billing.billingPortalButton.label')}
    </Button>
  )
}
