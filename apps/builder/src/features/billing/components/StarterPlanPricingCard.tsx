import {
  Stack,
  Heading,
  chakra,
  HStack,
  Button,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { Plan } from '@typebot.io/prisma'
import { FeaturesList } from './FeaturesList'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { useI18n, useScopedI18n } from '@/locales'
import { formatPrice } from '@typebot.io/lib/billing/formatPrice'
import { prices } from '@typebot.io/lib/billing/constants'

type Props = {
  currentPlan: Plan
  currency?: 'eur' | 'usd'
  isLoading?: boolean
  onPayClick: () => void
}

export const StarterPlanPricingCard = ({
  currentPlan,
  isLoading,
  currency,
  onPayClick,
}: Props) => {
  const t = useI18n()
  const scopedT = useScopedI18n('billing.pricingCard')

  const getButtonLabel = () => {
    if (currentPlan === Plan.PRO) return t('downgrade')
    if (currentPlan === Plan.STARTER) return scopedT('upgradeButton.current')
    return t('upgrade')
  }

  return (
    <Stack
      spacing={6}
      p="6"
      rounded="lg"
      borderWidth="1px"
      flex="1"
      h="full"
      justifyContent="space-between"
      pt="8"
    >
      <Stack spacing="4">
        <Stack>
          <Stack spacing="4">
            <Heading fontSize="2xl">
              {scopedT('heading', {
                plan: <chakra.span color="orange.400">Starter</chakra.span>,
              })}
            </Heading>
            <Text>{scopedT('starter.description')}</Text>
          </Stack>
          <Heading>
            {formatPrice(prices.STARTER, { currency })}
            <chakra.span fontSize="md">{scopedT('perMonth')}</chakra.span>
          </Heading>
        </Stack>

        <FeaturesList
          features={[
            scopedT('starter.includedSeats'),
            <Stack key="starter-chats" spacing={0}>
              <HStack>
                <Text>2,000 {scopedT('chatsPerMonth')}</Text>
                <MoreInfoTooltip>{scopedT('chatsTooltip')}</MoreInfoTooltip>
              </HStack>
              <Text
                fontSize="sm"
                color={useColorModeValue('gray.500', 'gray.400')}
              >
                Extra chats: $10 per 500
              </Text>
            </Stack>,
            scopedT('starter.brandingRemoved'),
            scopedT('starter.fileUploadBlock'),
            scopedT('starter.createFolders'),
          ]}
        />
      </Stack>
      <Button
        colorScheme="orange"
        variant="outline"
        onClick={onPayClick}
        isLoading={isLoading}
        isDisabled={currentPlan === Plan.STARTER}
      >
        {getButtonLabel()}
      </Button>
    </Stack>
  )
}
