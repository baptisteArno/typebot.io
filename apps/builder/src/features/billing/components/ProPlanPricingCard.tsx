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
import { formatPrice } from '@typebot.io/billing/helpers/formatPrice'
import { ChatsProTiersModal } from './ChatsProTiersModal'
import { prices } from '@typebot.io/billing/constants'
import { T, useTranslate } from '@tolgee/react'

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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslate()

  const getButtonLabel = () => {
    if (currentPlan === Plan.PRO)
      return t('billing.pricingCard.upgradeButton.current')
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
        borderColor={useColorModeValue('orange.500', 'orange.300')}
        rounded="lg"
      >
        <Flex justifyContent="center">
          <Tag
            pos="absolute"
            top="-10px"
            colorScheme="orange"
            bg={useColorModeValue('orange.500', 'orange.400')}
            variant="solid"
            fontWeight="semibold"
            style={{ marginTop: 0 }}
          >
            {t('billing.pricingCard.pro.mostPopularLabel')}
          </Tag>
        </Flex>
        <Stack justifyContent="space-between" h="full">
          <Stack spacing="4" mt={2}>
            <Heading fontSize="2xl">
              <T
                keyName="billing.pricingCard.heading"
                params={{
                  strong: (
                    <chakra.span
                      color={useColorModeValue('orange.400', 'orange.300')}
                    >
                      Pro
                    </chakra.span>
                  ),
                }}
              />
            </Heading>
            <Text>{t('billing.pricingCard.pro.description')}</Text>
          </Stack>
          <Stack spacing="8">
            <Stack spacing="4">
              <Heading>
                {formatPrice(prices.PRO, { currency })}
                <chakra.span fontSize="md">
                  {t('billing.pricingCard.perMonth')}
                </chakra.span>
              </Heading>
              <Text fontWeight="bold">
                <Tooltip
                  label={
                    <FeaturesList
                      features={[
                        t('billing.pricingCard.starter.brandingRemoved'),
                        t('billing.pricingCard.starter.fileUploadBlock'),
                        t('billing.pricingCard.starter.createFolders'),
                      ]}
                      spacing="0"
                    />
                  }
                  hasArrow
                  placement="top"
                >
                  <chakra.span textDecoration="underline" cursor="pointer">
                    {t('billing.pricingCard.pro.everythingFromStarter')}
                  </chakra.span>
                </Tooltip>
                {t('billing.pricingCard.plus')}
              </Text>
              <FeaturesList
                features={[
                  t('billing.pricingCard.pro.includedSeats'),
                  <Stack key="starter-chats" spacing={1}>
                    <HStack key="test">
                      <Text>
                        10,000 {t('billing.pricingCard.chatsPerMonth')}
                      </Text>
                      <MoreInfoTooltip>
                        {t('billing.pricingCard.chatsTooltip')}
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
                  t('billing.pricingCard.pro.whatsAppIntegration'),
                  t('billing.pricingCard.pro.customDomains'),
                  t('billing.pricingCard.pro.analytics'),
                ]}
              />
            </Stack>

            <Button
              colorScheme="orange"
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
