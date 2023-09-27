import { UnlockPlanAlertInfo } from '@/components/UnlockPlanAlertInfo'
import { trpc } from '@/lib/trpc'
import { Flex } from '@chakra-ui/react'
import { Workspace } from '@typebot.io/schemas'
import { useMemo } from 'react'
import { getChatsLimit } from '@typebot.io/lib/pricing'

const ALERT_CHATS_PERCENT_THRESHOLD = 80

type Props = {
  workspace: Workspace
}

export const UsageAlertBanners = ({ workspace }: Props) => {
  const { data: usageData } = trpc.billing.getUsage.useQuery({
    workspaceId: workspace?.id,
  })

  const chatsLimitPercentage = useMemo(() => {
    if (!usageData?.totalChatsUsed || !workspace?.plan) return 0
    return Math.round(
      (usageData.totalChatsUsed /
        getChatsLimit({
          additionalChatsIndex: workspace.additionalChatsIndex,
          plan: workspace.plan,
          customChatsLimit: workspace.customChatsLimit,
        })) *
        100
    )
  }, [
    usageData?.totalChatsUsed,
    workspace?.additionalChatsIndex,
    workspace?.customChatsLimit,
    workspace?.plan,
  ])

  return (
    <>
      {chatsLimitPercentage > ALERT_CHATS_PERCENT_THRESHOLD && (
        <Flex p="4">
          <UnlockPlanAlertInfo status="warning" buttonLabel="Upgrade">
            Your workspace collected <strong>{chatsLimitPercentage}%</strong> of
            your total chats limit this month. Upgrade your plan to continue
            chatting with your customers beyond this limit.
          </UnlockPlanAlertInfo>
        </Flex>
      )}
    </>
  )
}
