import { useEffect, useState } from 'react'
import {
  Heading,
  Modal,
  ModalBody,
  Text,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Stack,
  ListItem,
  UnorderedList,
  ListIcon,
  chakra,
  Tooltip,
  ListProps,
  Button,
  HStack,
} from '@chakra-ui/react'
import { pay } from 'services/stripe'
import { useUser } from 'contexts/UserContext'
import { Plan } from 'db'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { TypebotLogo } from 'assets/logos'
import { CheckIcon } from 'assets/icons'

export enum LimitReached {
  BRAND = 'Remove branding',
  CUSTOM_DOMAIN = 'Custom domain',
  FOLDER = 'Create folders',
}

type UpgradeModalProps = {
  type?: LimitReached
  isOpen: boolean
  onClose: () => void
  plan?: Plan
}

export const UpgradeModal = ({
  onClose,
  isOpen,
  plan = Plan.PRO,
}: UpgradeModalProps) => {
  const { user } = useUser()
  const { workspace } = useWorkspace()
  const [payLoading, setPayLoading] = useState(false)
  const [currency, setCurrency] = useState<'usd' | 'eur'>('usd')

  useEffect(() => {
    setCurrency(
      navigator.languages.find((l) => l.includes('fr')) ? 'eur' : 'usd'
    )
  }, [])

  const handlePayClick = async () => {
    if (!user || !workspace) return
    setPayLoading(true)
    await pay({
      user,
      currency,
      plan: plan === Plan.TEAM ? 'team' : 'pro',
      workspaceId: workspace.id,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody as={Stack} pt="10">
          {plan === Plan.PRO ? (
            <PersonalProPlanContent currency={currency} />
          ) : (
            <TeamPlanContent currency={currency} />
          )}
        </ModalBody>

        <ModalFooter>
          <HStack>
            <Button colorScheme="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handlePayClick}
              isLoading={payLoading}
              colorScheme="blue"
            >
              Upgrade
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const PersonalProPlanContent = ({ currency }: { currency: 'eur' | 'usd' }) => {
  return (
    <Stack spacing="4">
      <TypebotLogo boxSize="30px" />
      <Heading fontSize="2xl">
        Upgrade to <chakra.span color="orange.400">Personal Pro</chakra.span>{' '}
        plan
      </Heading>
      <Text>For solo creator who want to do even more.</Text>
      <Heading>
        {currency === 'eur' ? '39€' : '$39'}
        <chakra.span fontSize="md">/ month</chakra.span>
      </Heading>
      <Text fontWeight="bold">Everything in Personal, plus:</Text>
      <FeatureList
        features={[
          'Branding removed',
          'View incomplete submissions',
          'In-depth drop off analytics',
          'Unlimited custom domains',
          'Organize typebots in folders',
          'Unlimited uploads',
        ]}
      />
    </Stack>
  )
}

const TeamPlanContent = ({ currency }: { currency: 'eur' | 'usd' }) => {
  return (
    <Stack spacing="4">
      <TypebotLogo boxSize="30px" />
      <Heading fontSize="2xl">
        Upgrade to <chakra.span color="purple.400">Team</chakra.span> plan
      </Heading>
      <Text>For teams to build typebots together in one spot.</Text>
      <Heading>
        {currency === 'eur' ? '99€' : '$99'}
        <chakra.span fontSize="md">/ month</chakra.span>
      </Heading>
      <Text fontWeight="bold">
        <Tooltip
          label={
            <FeatureList
              features={[
                'Branding removed',
                'View incomplete submissions',
                'In-depth drop off analytics',
                'Custom domains',
                'Organize typebots in folders',
                'Unlimited uploads',
              ]}
              spacing="0"
            />
          }
          hasArrow
          placement="top"
        >
          <chakra.span textDecoration="underline" cursor="pointer">
            Everything in Pro
          </chakra.span>
        </Tooltip>
        , plus:
      </Text>
      <FeatureList
        features={[
          'Unlimited team members',
          'Collaborative workspace',
          'Custom roles',
        ]}
      />
    </Stack>
  )
}

const FeatureList = ({
  features,
  ...props
}: { features: string[] } & ListProps) => (
  <UnorderedList listStyleType="none" spacing={2} {...props}>
    {features.map((feat) => (
      <ListItem key={feat}>
        <ListIcon as={CheckIcon} />
        {feat}
      </ListItem>
    ))}
  </UnorderedList>
)
