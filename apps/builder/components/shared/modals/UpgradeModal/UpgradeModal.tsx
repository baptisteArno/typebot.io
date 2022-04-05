import { useEffect, useState } from 'react'
import {
  Alert,
  AlertIcon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'
import { PricingCard } from './PricingCard'
import { ActionButton } from './ActionButton'
import { pay } from 'services/stripe'
import { useUser } from 'contexts/UserContext'

export enum LimitReached {
  BRAND = 'Remove branding',
  CUSTOM_DOMAIN = 'Custom domain',
  FOLDER = 'Create folders',
}

type UpgradeModalProps = {
  type?: LimitReached
  isOpen: boolean
  onClose: () => void
}

export const UpgradeModal = ({ type, onClose, isOpen }: UpgradeModalProps) => {
  const { user } = useUser()
  const [payLoading, setPayLoading] = useState(false)
  const [currency, setCurrency] = useState<'usd' | 'eur'>('usd')

  useEffect(() => {
    setCurrency(
      navigator.languages.find((l) => l.includes('fr')) ? 'eur' : 'usd'
    )
  }, [])

  let limitLabel
  switch (type) {
    case LimitReached.BRAND: {
      limitLabel = "You can't hide Typebot brand on the Basic plan"
      break
    }
    case LimitReached.CUSTOM_DOMAIN: {
      limitLabel = "You can't add your domain with the Basic plan"
      break
    }
    case LimitReached.FOLDER: {
      limitLabel = "You can't create folders with the basic plan"
    }
  }

  const handlePayClick = async () => {
    if (!user) return
    setPayLoading(true)
    await pay(user, currency)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upgrade to Pro plan</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing={6} alignItems="center">
          {limitLabel && (
            <Alert status="warning" rounded="md">
              <AlertIcon />
              {limitLabel}
            </Alert>
          )}
          <PricingCard
            data={{
              price: currency === 'eur' ? '25€' : '$30',
              name: 'Pro plan',
              features: [
                'Branding removed',
                'View incomplete submissions',
                'In-depth drop off analytics',
                'Custom domains',
                'Organize typebots in folders',
                'Unlimited uploads',
                'Custom Google Analytics events',
              ],
            }}
            button={
              <ActionButton onClick={handlePayClick} isLoading={payLoading}>
                Upgrade now
              </ActionButton>
            }
          />
        </ModalBody>

        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
