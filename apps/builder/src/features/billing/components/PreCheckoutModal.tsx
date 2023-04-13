import { TextInput } from '@/components/inputs'
import { Select } from '@/components/inputs/Select'
import { useParentModal } from '@/features/graph/providers/ParentModalProvider'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'
import { isDefined } from '@typebot.io/lib'
import { taxIdTypes } from '../taxIdTypes'
import { useScopedI18n } from '@/locales'

export type PreCheckoutModalProps = {
  selectedSubscription:
    | {
        plan: 'STARTER' | 'PRO'
        workspaceId: string
        additionalChats: number
        additionalStorage: number
        currency: 'eur' | 'usd'
        isYearly: boolean
      }
    | undefined
  existingCompany?: string
  existingEmail?: string
  onClose: () => void
}

const vatCodeLabels = taxIdTypes.map((taxIdType) => ({
  label: `${taxIdType.emoji} ${taxIdType.name} (${taxIdType.code})`,
  value: taxIdType.type,
  extras: {
    placeholder: taxIdType.placeholder,
  },
}))

export const PreCheckoutModal = ({
  selectedSubscription,
  existingCompany,
  existingEmail,
  onClose,
}: PreCheckoutModalProps) => {
  const scopedT = useScopedI18n('billing.preCheckoutModal')
  const { ref } = useParentModal()
  const vatValueInputRef = React.useRef<HTMLInputElement>(null)
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
    vat: {
      type: undefined as string | undefined,
      value: '',
    },
  })
  const [vatValuePlaceholder, setVatValuePlaceholder] = useState('')

  const updateCustomerCompany = (company: string) => {
    setCustomer((customer) => ({ ...customer, company }))
  }

  const updateCustomerEmail = (email: string) => {
    setCustomer((customer) => ({ ...customer, email }))
  }

  const updateVatType = (
    type: string | undefined,
    vatCode?: (typeof vatCodeLabels)[number]
  ) => {
    setCustomer((customer) => ({
      ...customer,
      vat: {
        ...customer.vat,
        type,
      },
    }))
    setVatValuePlaceholder(vatCode?.extras?.placeholder ?? '')
    vatValueInputRef.current?.focus()
  }

  const updateVatValue = (value: string) => {
    setCustomer((customer) => ({
      ...customer,
      vat: {
        ...customer.vat,
        value,
      },
    }))
  }

  const goToCheckout = (e: FormEvent) => {
    e.preventDefault()
    if (!selectedSubscription) return
    const { email, company, vat } = customer
    createCheckoutSession({
      ...selectedSubscription,
      email,
      company,
      returnUrl: window.location.href,
      vat:
        vat.value && vat.type
          ? { type: vat.type, value: vat.value }
          : undefined,
    })
  }

  return (
    <Modal isOpen={isDefined(selectedSubscription)} onClose={onClose}>
      <ModalOverlay />
      <ModalContent ref={ref}>
        <ModalBody py="8">
          <Stack as="form" spacing="4" onSubmit={goToCheckout}>
            <TextInput
              isRequired
              label={scopedT('companyInput.label')}
              defaultValue={customer.company}
              onChange={updateCustomerCompany}
              withVariableButton={false}
              debounceTimeout={0}
            />
            <TextInput
              isRequired
              type="email"
              label={scopedT('emailInput.label')}
              defaultValue={customer.email}
              onChange={updateCustomerEmail}
              withVariableButton={false}
              debounceTimeout={0}
            />
            <FormControl>
              <FormLabel>{scopedT('taxId.label')}</FormLabel>
              <HStack>
                <Select
                  placeholder={scopedT('taxId.placeholder')}
                  items={vatCodeLabels}
                  isPopoverMatchingInputWidth={false}
                  onSelect={updateVatType}
                />
                <TextInput
                  ref={vatValueInputRef}
                  onChange={updateVatValue}
                  withVariableButton={false}
                  debounceTimeout={0}
                  placeholder={vatValuePlaceholder}
                />
              </HStack>
            </FormControl>

            <Button
              type="submit"
              isLoading={isCreatingCheckout}
              colorScheme="blue"
              isDisabled={customer.company === '' || customer.email === ''}
            >
              {scopedT('submitButton.label')}
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
