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
import { storageToReadable } from './helpers'
import { trpc } from '@/lib/trpc'

type Props = {
  workspace: Workspace
}

export const UsageContent = ({ workspace }: Props) => {
  const { data, isLoading } = trpc.billing.getUsage.useQuery({
    workspaceId: workspace.id,
  })
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
      <Heading fontSize="3xl">Usage</Heading>
      <Stack spacing={3}>
        <Flex justifyContent="space-between">
          <HStack>
            <Heading fontSize="xl" as="h3">
              Chats
            </Heading>
            {chatsPercentage >= 80 && (
              <Tooltip
                placement="top"
                rounded="md"
                p="3"
                label={
                  <Text>
                    Your typebots are popular! You will soon reach your
                    plan&apos;s chats limit. 🚀
                    <br />
                    <br />
                    Make sure to <strong>update your plan</strong> to increase
                    this limit and continue chatting with your users.
                  </Text>
                }
              >
                <span>
                  <AlertIcon color="orange.500" />
                </span>
              </Tooltip>
            )}
            <Text fontSize="sm" fontStyle="italic" color="gray.500">
              (resets on 1st of every month)
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
                Storage
              </Heading>
              {storagePercentage >= 80 && (
                <Tooltip
                  placement="top"
                  rounded="md"
                  p="3"
                  label={
                    <Text>
                      Your typebots are popular! You will soon reach your
                      plan&apos;s storage limit. 🚀
                      <br />
                      <br />
                      Make sure to <strong>update your plan</strong> in order to
                      continue collecting uploaded files. You can also{' '}
                      <strong>delete files</strong> to free up space.
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
