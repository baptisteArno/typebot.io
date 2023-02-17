import {
  Stack,
  Heading,
  chakra,
  HStack,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Text,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@/components/icons'
import { useWorkspace } from '@/features/workspace'
import { Plan } from 'db'
import { useEffect, useState } from 'react'
import { parseNumberWithCommas } from 'utils'
import {
  chatsLimit,
  computePrice,
  formatPrice,
  getChatsLimit,
  getStorageLimit,
  storageLimit,
} from 'utils/pricing'
import { FeaturesList } from './components/FeaturesList'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'

type StarterPlanContentProps = {
  initialChatsLimitIndex?: number
  initialStorageLimitIndex?: number
  currency?: 'eur' | 'usd'
  isLoading?: boolean
  onPayClick: (props: {
    selectedChatsLimitIndex: number
    selectedStorageLimitIndex: number
  }) => void
}

export const StarterPlanContent = ({
  initialChatsLimitIndex,
  initialStorageLimitIndex,
  isLoading,
  currency,
  onPayClick,
}: StarterPlanContentProps) => {
  const { workspace } = useWorkspace()
  const [selectedChatsLimitIndex, setSelectedChatsLimitIndex] =
    useState<number>()
  const [selectedStorageLimitIndex, setSelectedStorageLimitIndex] =
    useState<number>()

  useEffect(() => {
    if (
      selectedChatsLimitIndex === undefined &&
      initialChatsLimitIndex !== undefined
    )
      setSelectedChatsLimitIndex(initialChatsLimitIndex)
    if (
      selectedStorageLimitIndex === undefined &&
      initialStorageLimitIndex !== undefined
    )
      setSelectedStorageLimitIndex(initialStorageLimitIndex)
  }, [
    initialChatsLimitIndex,
    initialStorageLimitIndex,
    selectedChatsLimitIndex,
    selectedStorageLimitIndex,
  ])

  const workspaceChatsLimit = workspace ? getChatsLimit(workspace) : undefined
  const workspaceStorageLimit = workspace
    ? getStorageLimit(workspace)
    : undefined

  const isCurrentPlan =
    chatsLimit[Plan.STARTER].totalIncluded +
      chatsLimit[Plan.STARTER].increaseStep.amount *
        (selectedChatsLimitIndex ?? 0) ===
      workspaceChatsLimit &&
    storageLimit[Plan.STARTER].totalIncluded +
      storageLimit[Plan.STARTER].increaseStep.amount *
        (selectedStorageLimitIndex ?? 0) ===
      workspaceStorageLimit

  const getButtonLabel = () => {
    if (
      selectedChatsLimitIndex === undefined ||
      selectedStorageLimitIndex === undefined
    )
      return ''
    if (workspace?.plan === Plan.PRO) return 'Downgrade'
    if (workspace?.plan === Plan.STARTER) {
      if (isCurrentPlan) return 'Your current plan'

      if (
        selectedChatsLimitIndex !== initialChatsLimitIndex ||
        selectedStorageLimitIndex !== initialStorageLimitIndex
      )
        return 'Update'
    }
    return 'Upgrade'
  }

  const handlePayClick = async () => {
    if (
      selectedChatsLimitIndex === undefined ||
      selectedStorageLimitIndex === undefined
    )
      return
    onPayClick({
      selectedChatsLimitIndex,
      selectedStorageLimitIndex,
    })
  }

  return (
    <Stack spacing={6} p="6" rounded="lg" borderWidth="1px" flex="1" h="full">
      <Stack spacing="4">
        <Heading fontSize="2xl">
          Upgrade to <chakra.span color="orange.400">Starter</chakra.span>
        </Heading>
        <Text>For individuals & small businesses.</Text>
        <Heading>
          {formatPrice(
            computePrice(
              Plan.STARTER,
              selectedChatsLimitIndex ?? 0,
              selectedStorageLimitIndex ?? 0
            ) ?? NaN,
            currency
          )}
          <chakra.span fontSize="md">/ month</chakra.span>
        </Heading>
        <FeaturesList
          features={[
            '2 seats included',
            <HStack key="test">
              <Text>
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronLeftIcon transform="rotate(-90deg)" />}
                    size="sm"
                    isLoading={selectedChatsLimitIndex === undefined}
                  >
                    {selectedChatsLimitIndex !== undefined
                      ? parseNumberWithCommas(
                          chatsLimit.STARTER.totalIncluded +
                            chatsLimit.STARTER.increaseStep.amount *
                              selectedChatsLimitIndex
                        )
                      : undefined}
                  </MenuButton>
                  <MenuList>
                    {selectedChatsLimitIndex !== 0 && (
                      <MenuItem onClick={() => setSelectedChatsLimitIndex(0)}>
                        {parseNumberWithCommas(
                          chatsLimit.STARTER.totalIncluded
                        )}
                      </MenuItem>
                    )}
                    {selectedChatsLimitIndex !== 1 && (
                      <MenuItem onClick={() => setSelectedChatsLimitIndex(1)}>
                        {parseNumberWithCommas(
                          chatsLimit.STARTER.totalIncluded +
                            chatsLimit.STARTER.increaseStep.amount
                        )}
                      </MenuItem>
                    )}
                    {selectedChatsLimitIndex !== 2 && (
                      <MenuItem onClick={() => setSelectedChatsLimitIndex(2)}>
                        {parseNumberWithCommas(
                          chatsLimit.STARTER.totalIncluded +
                            chatsLimit.STARTER.increaseStep.amount * 2
                        )}
                      </MenuItem>
                    )}
                    {selectedChatsLimitIndex !== 3 && (
                      <MenuItem onClick={() => setSelectedChatsLimitIndex(3)}>
                        {parseNumberWithCommas(
                          chatsLimit.STARTER.totalIncluded +
                            chatsLimit.STARTER.increaseStep.amount * 3
                        )}
                      </MenuItem>
                    )}
                    {selectedChatsLimitIndex !== 4 && (
                      <MenuItem onClick={() => setSelectedChatsLimitIndex(4)}>
                        {parseNumberWithCommas(
                          chatsLimit.STARTER.totalIncluded +
                            chatsLimit.STARTER.increaseStep.amount * 4
                        )}
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>{' '}
                chats/mo
              </Text>
              <MoreInfoTooltip>
                A chat is counted whenever a user starts a discussion. It is
                independant of the number of messages he sends and receives.
              </MoreInfoTooltip>
            </HStack>,
            <HStack key="test">
              <Text>
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronLeftIcon transform="rotate(-90deg)" />}
                    size="sm"
                    isLoading={selectedStorageLimitIndex === undefined}
                  >
                    {selectedStorageLimitIndex !== undefined
                      ? parseNumberWithCommas(
                          storageLimit.STARTER.totalIncluded +
                            storageLimit.STARTER.increaseStep.amount *
                              selectedStorageLimitIndex
                        )
                      : undefined}
                  </MenuButton>
                  <MenuList>
                    {selectedStorageLimitIndex !== 0 && (
                      <MenuItem onClick={() => setSelectedStorageLimitIndex(0)}>
                        {parseNumberWithCommas(
                          storageLimit.STARTER.totalIncluded
                        )}
                      </MenuItem>
                    )}
                    {selectedStorageLimitIndex !== 1 && (
                      <MenuItem onClick={() => setSelectedStorageLimitIndex(1)}>
                        {parseNumberWithCommas(
                          storageLimit.STARTER.totalIncluded +
                            storageLimit.STARTER.increaseStep.amount
                        )}
                      </MenuItem>
                    )}
                    {selectedStorageLimitIndex !== 2 && (
                      <MenuItem onClick={() => setSelectedStorageLimitIndex(2)}>
                        {parseNumberWithCommas(
                          storageLimit.STARTER.totalIncluded +
                            storageLimit.STARTER.increaseStep.amount * 2
                        )}
                      </MenuItem>
                    )}
                    {selectedStorageLimitIndex !== 3 && (
                      <MenuItem onClick={() => setSelectedStorageLimitIndex(3)}>
                        {parseNumberWithCommas(
                          storageLimit.STARTER.totalIncluded +
                            storageLimit.STARTER.increaseStep.amount * 3
                        )}
                      </MenuItem>
                    )}
                    {selectedStorageLimitIndex !== 4 && (
                      <MenuItem onClick={() => setSelectedStorageLimitIndex(4)}>
                        {parseNumberWithCommas(
                          storageLimit.STARTER.totalIncluded +
                            storageLimit.STARTER.increaseStep.amount * 4
                        )}
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>{' '}
                GB of storage
              </Text>
              <MoreInfoTooltip>
                You accumulate storage for every file that your user upload into
                your bot. If you delete the result, it will free up the space.
              </MoreInfoTooltip>
            </HStack>,
            'Branding removed',
            'File upload input block',
            'Create folders',
          ]}
        />
      </Stack>
      <Button
        colorScheme="orange"
        variant="outline"
        onClick={handlePayClick}
        isLoading={isLoading}
        isDisabled={isCurrentPlan}
      >
        {getButtonLabel()}
      </Button>
    </Stack>
  )
}
