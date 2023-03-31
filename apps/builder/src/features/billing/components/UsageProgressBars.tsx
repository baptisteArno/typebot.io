import {
  Stack,
  Flex,
  Heading,
  Progress,
  Text,
  Skeleton,
  HStack,
  Tooltip,
} from '@chakra-ui/react'
import { AlertIcon } from '@/components/icons'
import { Plan, Workspace } from '@typebot.io/prisma'
import React from 'react'
import { parseNumberWithCommas } from '@typebot.io/lib'
import { getChatsLimit, getStorageLimit } from '@typebot.io/lib/pricing'
import { defaultQueryOptions, trpc } from '@/lib/trpc'
import { storageToReadable } from '../helpers/storageToReadable'
import { useScopedI18n } from '@/locales'

type Props = {
  workspace: Workspace
}

export const UsageProgressBars = ({ workspace }: Props) => {
  const scopedT = useScopedI18n('billing.usage')
  const { data, isLoading } = trpc.billing.getUsage.useQuery(
    {
      workspaceId: workspace.id,
    },
    defaultQueryOptions
  )
  const totalChatsUsed = data?.totalChatsUsed ?? 0
  const totalStorageUsed = data?.totalStorageUsed ?? 0

  const workspaceChatsLimit = getChatsLimit(workspace)
  const workspaceStorageLimit = getStorageLimit(workspace)
  const workspaceStorageLimitGigabites =
    workspaceStorageLimit * 1024 * 1024 * 1024

  const chatsPercentage = Math.round(
    (totalChatsUsed / workspaceChatsLimit) * 100
  )
  const storagePercentage = Math.round(
    (totalStorageUsed / workspaceStorageLimitGigabites) * 100
  )

  return (
    <Stack spacing={6}>
      <Heading fontSize="3xl">{scopedT('heading')}</Heading>
      <Stack spacing={3}>
        <Flex justifyContent="space-between">
          <HStack>
            <Heading fontSize="xl" as="h3">
              {scopedT('chats.heading')}
            </Heading>
            {chatsPercentage >= 80 && (
              <Tooltip
                placement="top"
                rounded="md"
                p="3"
                label={
                  <Text>
                    {scopedT('chats.alert.soonReach')}
                    <br />
                    <br />
                    {scopedT('chats.alert.updatePlan')}
                  </Text>
                }
              >
                <span>
                  <AlertIcon color="orange.500" />
                </span>
              </Tooltip>
            )}
            <Text fontSize="sm" fontStyle="italic" color="gray.500">
              {scopedT('chats.resetInfo')}
            </Text>
          </HStack>

          <HStack>
            <Skeleton
              fontWeight="bold"
              isLoaded={!isLoading}
              h={isLoading ? '5px' : 'auto'}
            >
              {parseNumberWithCommas(totalChatsUsed)}
            </Skeleton>
            <Text>
              /{' '}
              {workspaceChatsLimit === -1
                ? 'Unlimited'
                : parseNumberWithCommas(workspaceChatsLimit)}
            </Text>
          </HStack>
        </Flex>

        <Progress
          h="5px"
          value={chatsPercentage}
          rounded="full"
          hasStripe
          isIndeterminate={isLoading}
          colorScheme={totalChatsUsed >= workspaceChatsLimit ? 'red' : 'blue'}
        />
      </Stack>
      {workspace.plan !== Plan.FREE && (
        <Stack spacing={3}>
          <Flex justifyContent="space-between">
            <HStack>
              <Heading fontSize="xl" as="h3">
                {scopedT('storage.heading')}
              </Heading>
              {storagePercentage >= 80 && (
                <Tooltip
                  placement="top"
                  rounded="md"
                  p="3"
                  label={
                    <Text>
                      {scopedT('storage.alert.soonReach')}
                      <br />
                      <br />
                      {scopedT('storage.alert.updatePlan')}
                    </Text>
                  }
                >
                  <span>
                    <AlertIcon color="orange.500" />
                  </span>
                </Tooltip>
              )}
            </HStack>
            <HStack>
              <Skeleton
                fontWeight="bold"
                isLoaded={!isLoading}
                h={isLoading ? '5px' : 'auto'}
              >
                {storageToReadable(totalStorageUsed)}
              </Skeleton>
              <Text>
                /{' '}
                {workspaceStorageLimit === -1
                  ? 'Unlimited'
                  : `${workspaceStorageLimit} GB`}
              </Text>
            </HStack>
          </Flex>
          <Progress
            value={storagePercentage}
            h="5px"
            colorScheme={
              totalStorageUsed >= workspaceStorageLimitGigabites
                ? 'red'
                : 'blue'
            }
            rounded="full"
            hasStripe
            isIndeterminate={isLoading}
          />
        </Stack>
      )}
    </Stack>
  )
}
