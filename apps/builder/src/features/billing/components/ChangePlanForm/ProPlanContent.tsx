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
  Tooltip,
  Flex,
  Tag,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@/components/icons'
import { useWorkspace } from '@/features/workspace'
import { Plan } from 'db'
import { useEffect, useState } from 'react'
import {
  chatsLimit,
  getChatsLimit,
  getStorageLimit,
  storageLimit,
  parseNumberWithCommas,
  formatPrice,
  computePrice,
} from 'utils'
import { FeaturesList } from './components/FeaturesList'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'

type ProPlanContentProps = {
  initialChatsLimitIndex?: number
  initialStorageLimitIndex?: number
  currency?: 'usd' | 'eur'
  onPayClick: (props: {
    selectedChatsLimitIndex: number
    selectedStorageLimitIndex: number
  }) => Promise<void>
}

export const ProPlanContent = ({
  initialChatsLimitIndex,
  initialStorageLimitIndex,
  currency,
  onPayClick,
}: ProPlanContentProps) => {
  const { workspace } = useWorkspace()
  const [selectedChatsLimitIndex, setSelectedChatsLimitIndex] =
    useState<number>()
  const [selectedStorageLimitIndex, setSelectedStorageLimitIndex] =
    useState<number>()
  const [isPaying, setIsPaying] = useState(false)

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
    chatsLimit[Plan.PRO].totalIncluded +
      chatsLimit[Plan.PRO].increaseStep.amount *
        (selectedChatsLimitIndex ?? 0) ===
      workspaceChatsLimit &&
    storageLimit[Plan.PRO].totalIncluded +
      storageLimit[Plan.PRO].increaseStep.amount *
        (selectedStorageLimitIndex ?? 0) ===
      workspaceStorageLimit

  const getButtonLabel = () => {
    if (
      selectedChatsLimitIndex === undefined ||
      selectedStorageLimitIndex === undefined
    )
      return ''
    if (workspace?.plan === Plan.PRO) {
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
    setIsPaying(true)
    await onPayClick({
      selectedChatsLimitIndex,
      selectedStorageLimitIndex,
    })
    setIsPaying(false)
  }

  return (
    <Flex
      p="6"
      pos="relative"
      h="full"
      flexDir="column"
      flex="1"
      flexShrink={0}
      borderWidth="1px"
      borderColor="blue.500"
      rounded="lg"
    >
      <Flex justifyContent="center">
        <Tag
          pos="absolute"
          top="-10px"
          colorScheme="blue"
          variant="solid"
          fontWeight="semibold"
          style={{ marginTop: 0 }}
        >
          Most popular
        </Tag>
      </Flex>
      <Stack justifyContent="space-between" h="full">
        <Stack spacing="4" mt={2}>
          <Heading fontSize="2xl">
            Upgrade to <chakra.span color="blue.400">Pro</chakra.span>
          </Heading>
          <Text>For agencies & growing startups.</Text>
        </Stack>
        <Stack spacing="4">
          <Heading>
            {formatPrice(
              computePrice(
                Plan.PRO,
                selectedChatsLimitIndex ?? 0,
                selectedStorageLimitIndex ?? 0
              ) ?? NaN,
              currency
            )}
            <chakra.span fontSize="md">/ month</chakra.span>
          </Heading>
          <Text fontWeight="bold">
            <Tooltip
              label={
                <FeaturesList
                  features={[
                    'Branding removed',
                    'File upload input block',
                    'Create folders',
                  ]}
                  spacing="0"
                />
              }
              hasArrow
              placement="top"
            >
              <chakra.span textDecoration="underline" cursor="pointer">
                Everything in Starter
              </chakra.span>
            </Tooltip>
            , plus:
          </Text>
          <FeaturesList
            features={[
              '5 seats included',
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
                            chatsLimit.PRO.totalIncluded +
                              chatsLimit.PRO.increaseStep.amount *
                                selectedChatsLimitIndex
                          )
                        : undefined}
                    </MenuButton>
                    <MenuList>
                      {selectedChatsLimitIndex !== 0 && (
                        <MenuItem onClick={() => setSelectedChatsLimitIndex(0)}>
                          {parseNumberWithCommas(chatsLimit.PRO.totalIncluded)}
                        </MenuItem>
                      )}
                      {selectedChatsLimitIndex !== 1 && (
                        <MenuItem onClick={() => setSelectedChatsLimitIndex(1)}>
                          {parseNumberWithCommas(
                            chatsLimit.PRO.totalIncluded +
                              chatsLimit.PRO.increaseStep.amount
                          )}
                        </MenuItem>
                      )}
                      {selectedChatsLimitIndex !== 2 && (
                        <MenuItem onClick={() => setSelectedChatsLimitIndex(2)}>
                          {parseNumberWithCommas(
                            chatsLimit.PRO.totalIncluded +
                              chatsLimit.PRO.increaseStep.amount * 2
                          )}
                        </MenuItem>
                      )}
                      {selectedChatsLimitIndex !== 3 && (
                        <MenuItem onClick={() => setSelectedChatsLimitIndex(3)}>
                          {parseNumberWithCommas(
                            chatsLimit.PRO.totalIncluded +
                              chatsLimit.PRO.increaseStep.amount * 3
                          )}
                        </MenuItem>
                      )}
                      {selectedChatsLimitIndex !== 4 && (
                        <MenuItem onClick={() => setSelectedChatsLimitIndex(4)}>
                          {parseNumberWithCommas(
                            chatsLimit.PRO.totalIncluded +
                              chatsLimit.PRO.increaseStep.amount * 4
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
                            storageLimit.PRO.totalIncluded +
                              storageLimit.PRO.increaseStep.amount *
                                selectedStorageLimitIndex
                          )
                        : undefined}
                    </MenuButton>
                    <MenuList>
                      {selectedStorageLimitIndex !== 0 && (
                        <MenuItem
                          onClick={() => setSelectedStorageLimitIndex(0)}
                        >
                          {parseNumberWithCommas(
                            storageLimit.PRO.totalIncluded
                          )}
                        </MenuItem>
                      )}
                      {selectedStorageLimitIndex !== 1 && (
                        <MenuItem
                          onClick={() => setSelectedStorageLimitIndex(1)}
                        >
                          {parseNumberWithCommas(
                            storageLimit.PRO.totalIncluded +
                              storageLimit.PRO.increaseStep.amount
                          )}
                        </MenuItem>
                      )}
                      {selectedStorageLimitIndex !== 2 && (
                        <MenuItem
                          onClick={() => setSelectedStorageLimitIndex(2)}
                        >
                          {parseNumberWithCommas(
                            storageLimit.PRO.totalIncluded +
                              storageLimit.PRO.increaseStep.amount * 2
                          )}
                        </MenuItem>
                      )}
                      {selectedStorageLimitIndex !== 3 && (
                        <MenuItem
                          onClick={() => setSelectedStorageLimitIndex(3)}
                        >
                          {parseNumberWithCommas(
                            storageLimit.PRO.totalIncluded +
                              storageLimit.PRO.increaseStep.amount * 3
                          )}
                        </MenuItem>
                      )}
                      {selectedStorageLimitIndex !== 4 && (
                        <MenuItem
                          onClick={() => setSelectedStorageLimitIndex(4)}
                        >
                          {parseNumberWithCommas(
                            storageLimit.PRO.totalIncluded +
                              storageLimit.PRO.increaseStep.amount * 4
                          )}
                        </MenuItem>
                      )}
                    </MenuList>
                  </Menu>{' '}
                  GB of storage
                </Text>
                <MoreInfoTooltip>
                  You accumulate storage for every file that your user upload
                  into your bot. If you delete the result, it will free up the
                  space.
                </MoreInfoTooltip>
              </HStack>,
              'Custom domains',
              'In-depth analytics',
            ]}
          />
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={handlePayClick}
            isLoading={isPaying}
            isDisabled={isCurrentPlan}
          >
            {getButtonLabel()}
          </Button>
        </Stack>
      </Stack>
    </Flex>
  )
}
