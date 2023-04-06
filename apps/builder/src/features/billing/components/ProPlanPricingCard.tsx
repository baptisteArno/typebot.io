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
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@/components/icons'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Plan } from '@typebot.io/prisma'
import { useEffect, useState } from 'react'
import { parseNumberWithCommas } from '@typebot.io/lib'
import {
  chatsLimit,
  computePrice,
  formatPrice,
  getChatsLimit,
  getStorageLimit,
  storageLimit,
} from '@typebot.io/lib/pricing'
import { FeaturesList } from './FeaturesList'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { useI18n, useScopedI18n } from '@/locales'

type Props = {
  initialChatsLimitIndex?: number
  initialStorageLimitIndex?: number
  currency?: 'usd' | 'eur'
  isLoading: boolean
  onPayClick: (props: {
    selectedChatsLimitIndex: number
    selectedStorageLimitIndex: number
  }) => void
}

export const ProPlanPricingCard = ({
  initialChatsLimitIndex,
  initialStorageLimitIndex,
  currency,
  isLoading,
  onPayClick,
}: Props) => {
  const t = useI18n()
  const scopedT = useScopedI18n('billing.pricingCard')
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
      if (isCurrentPlan) return scopedT('upgradeButton.current')

      if (
        selectedChatsLimitIndex !== initialChatsLimitIndex ||
        selectedStorageLimitIndex !== initialStorageLimitIndex
      )
        return t('update')
    }
    return t('upgrade')
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
    <Flex
      p="6"
      pos="relative"
      h="full"
      flexDir="column"
      flex="1"
      flexShrink={0}
      borderWidth="1px"
      borderColor={useColorModeValue('blue.500', 'blue.300')}
      rounded="lg"
    >
      <Flex justifyContent="center">
        <Tag
          pos="absolute"
          top="-10px"
          colorScheme="blue"
          bg={useColorModeValue('blue.500', 'blue.400')}
          variant="solid"
          fontWeight="semibold"
          style={{ marginTop: 0 }}
        >
          {scopedT('pro.mostPopularLabel')}
        </Tag>
      </Flex>
      <Stack justifyContent="space-between" h="full">
        <Stack spacing="4" mt={2}>
          <Heading fontSize="2xl">
            {scopedT('heading', {
              plan: <chakra.span color="blue.400">Pro</chakra.span>,
            })}
          </Heading>
          <Text>{scopedT('pro.description')}</Text>
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
            <chakra.span fontSize="md">{scopedT('perMonth')}</chakra.span>
          </Heading>
          <Text fontWeight="bold">
            <Tooltip
              label={
                <FeaturesList
                  features={[
                    scopedT('starter.brandingRemoved'),
                    scopedT('starter.fileUploadBlock'),
                    scopedT('starter.createFolders'),
                  ]}
                  spacing="0"
                />
              }
              hasArrow
              placement="top"
            >
              <chakra.span textDecoration="underline" cursor="pointer">
                {scopedT('pro.everythingFromStarter')}
              </chakra.span>
            </Tooltip>
            {scopedT('plus')}
          </Text>
          <FeaturesList
            features={[
              scopedT('pro.includedSeats'),
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
                  {scopedT('chatsPerMonth')}
                </Text>
                <MoreInfoTooltip>{scopedT('chatsTooltip')}</MoreInfoTooltip>
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
                  {scopedT('storageLimit')}
                </Text>
                <MoreInfoTooltip>
                  {scopedT('storageLimitTooltip')}
                </MoreInfoTooltip>
              </HStack>,
              scopedT('pro.customDomains'),
              scopedT('pro.analytics'),
            ]}
          />
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={handlePayClick}
            isLoading={isLoading}
            isDisabled={isCurrentPlan}
          >
            {getButtonLabel()}
          </Button>
        </Stack>
      </Stack>
    </Flex>
  )
}
