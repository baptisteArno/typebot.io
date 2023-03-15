import { UnlockPlanAlertInfo } from '@/components/UnlockPlanAlertInfo'
import { trpc } from '@/lib/trpc'
import { Flex } from '@chakra-ui/react'
import { Workspace } from '@typebot.io/schemas'
import { useMemo } from 'react'
import { getChatsLimit, getStorageLimit } from '@typebot.io/lib/pricing'

const ALERT_CHATS_PERCENT_THRESHOLD = 80
const ALERT_STORAGE_PERCENT_THRESHOLD = 80

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

  const storageLimitPercentage = useMemo(() => {
    if (!usageData?.totalStorageUsed || !workspace?.plan) return 0
    return Math.round(
      (usageData.totalStorageUsed /
        1024 /
        1024 /
        1024 /
        getStorageLimit({
          additionalStorageIndex: workspace.additionalStorageIndex,
          plan: workspace.plan,
          customStorageLimit: workspace.customStorageLimit,
        })) *
        100
    )
  }, [
    usageData?.totalStorageUsed,
    workspace?.additionalStorageIndex,
    workspace?.customStorageLimit,
    workspace?.plan,
  ])

  return (
    <>
      {chatsLimitPercentage > ALERT_CHATS_PERCENT_THRESHOLD && (
        <Flex p="4">
          <UnlockPlanAlertInfo
            status="warning"
            contentLabel={
              <>
                Your workspace collected{' '}
                <strong>{chatsLimitPercentage}%</strong> of your total chats
                limit this month. Upgrade your plan to continue chatting with
                your customers beyond this limit.
              </>
            }
            buttonLabel="Upgrade"
          />
        </Flex>
      )}
      {storageLimitPercentage > ALERT_STORAGE_PERCENT_THRESHOLD && (
        <Flex p="4">
          <UnlockPlanAlertInfo
            status="warning"
            contentLabel={
              <>
                Your workspace collected{' '}
                <strong>{storageLimitPercentage}%</strong> of your total storage
                allowed. Upgrade your plan or delete some existing results to
                continue collecting files from your user beyond this limit.
              </>
            }
            buttonLabel="Upgrade"
          />
        </Flex>
      )}
    </>
  )
}
