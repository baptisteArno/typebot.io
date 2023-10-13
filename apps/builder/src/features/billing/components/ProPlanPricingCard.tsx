import {
  Stack,
  Heading,
  chakra,
  HStack,
  Button,
  Text,
  Tooltip,
  Flex,
  Tag,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { Plan } from '@typebot.io/prisma'
import { FeaturesList } from './FeaturesList'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { useI18n, useScopedI18n } from '@/locales'
import { formatPrice } from '@typebot.io/lib/billing/formatPrice'
import { ChatsProTiersModal } from './ChatsProTiersModal'
import { prices } from '@typebot.io/lib/billing/constants'

type Props = {
  currentPlan: Plan
  currency?: 'usd' | 'eur'
  isLoading: boolean
  onPayClick: () => void
}

export const ProPlanPricingCard = ({
  currentPlan,
  currency,
  isLoading,
  onPayClick,
}: Props) => {
  const t = useI18n()
  const scopedT = useScopedI18n('billing.pricingCard')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const getButtonLabel = () => {
    if (currentPlan === Plan.PRO) return scopedT('upgradeButton.current')
    return t('upgrade')
  }

  return (
    <>
      <ChatsProTiersModal isOpen={isOpen} onClose={onClose} />{' '}
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
                plan: (
                  <chakra.span
                    color={useColorModeValue('blue.400', 'blue.300')}
                  >
                    Pro
                  </chakra.span>
                ),
              })}
            </Heading>
            <Text>{scopedT('pro.description')}</Text>
          </Stack>
          <Stack spacing="8">
            <Stack spacing="4">
              <Heading>
                {formatPrice(prices.PRO, { currency })}
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
                  <Stack key="starter-chats" spacing={1}>
                    <HStack key="test">
                      <Text>10,000 {scopedT('chatsPerMonth')}</Text>
                      <MoreInfoTooltip>
                        {scopedT('chatsTooltip')}
                      </MoreInfoTooltip>
                    </HStack>
                    <Text
                      fontSize="sm"
                      color={useColorModeValue('gray.500', 'gray.400')}
                    >
                      Extra chats:{' '}
                      <Button size="xs" variant="outline" onClick={onOpen}>
                        See tiers
                      </Button>
                    </Text>
                  </Stack>,
                  scopedT('pro.whatsAppIntegration'),
                  scopedT('pro.customDomains'),
                  scopedT('pro.analytics'),
                ]}
              />
            </Stack>

            <Button
              colorScheme="blue"
              variant="outline"
              onClick={onPayClick}
              isLoading={isLoading}
              isDisabled={currentPlan === Plan.PRO}
            >
              {getButtonLabel()}
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </>
  )
}
