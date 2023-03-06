import { TextInput } from '@/components/inputs'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'
import { isDefined } from 'utils'

export type PreCheckoutModalProps = {
  selectedSubscription:
    | {
        plan: 'STARTER' | 'PRO'
        workspaceId: string
        additionalChats: number
        additionalStorage: number
        currency: 'eur' | 'usd'
      }
    | undefined
  existingCompany?: string
  existingEmail?: string
  onClose: () => void
}

export const PreCheckoutModal = ({
  selectedSubscription,
  existingCompany,
  existingEmail,
  onClose,
}: PreCheckoutModalProps) => {
  const router = useRouter()
  const { showToast } = useToast()
  const { mutate: createCheckoutSession, isLoading: isCreatingCheckout } =
    trpc.billing.createCheckoutSession.useMutation({
      onError: (error) => {
        showToast({
          description: error.message,
        })
      },
      onSuccess: ({ checkoutUrl }) => {
        router.push(checkoutUrl)
      },
    })

  const [customer, setCustomer] = useState({
    company: existingCompany ?? '',
    email: existingEmail ?? '',
  })

  const updateCustomerCompany = (company: string) => {
    setCustomer((customer) => ({ ...customer, company }))
  }

  const updateCustomerEmail = (email: string) => {
    setCustomer((customer) => ({ ...customer, email }))
  }

  const createCustomer = (e: FormEvent) => {
    e.preventDefault()
    if (!selectedSubscription) return
    createCheckoutSession({
      ...selectedSubscription,
      email: customer.email,
      company: customer.company,
      returnUrl: window.location.href,
    })
  }

  return (
    <Modal isOpen={isDefined(selectedSubscription)} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody py="8">
          <Stack as="form" onSubmit={createCustomer} spacing="4">
            <TextInput
              isRequired
              label="Company name"
              defaultValue={customer.company}
              onChange={updateCustomerCompany}
              withVariableButton={false}
              debounceTimeout={0}
            />
            <TextInput
              isRequired
              type="email"
              label="Email"
              defaultValue={customer.email}
              onChange={updateCustomerEmail}
              withVariableButton={false}
              debounceTimeout={0}
            />
            <Button
              type="submit"
              isLoading={isCreatingCheckout}
              colorScheme="blue"
              isDisabled={customer.company === '' || customer.email === ''}
            >
              Go to checkout
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
