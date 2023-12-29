import {
  Stack,
  useDisclosure,
  Text,
  Select,
  HStack,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { PaymentAddress, PaymentInputBlock } from '@typebot.io/schemas'
import React, { ChangeEvent } from 'react'
import { currencies } from '../currencies'
import { StripeConfigModal } from './StripeConfigModal'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { TextInput } from '@/components/inputs'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { PaymentAddressSettings } from './PaymentAddressSettings'
import {
  PaymentProvider,
  defaultPaymentInputOptions,
} from '@typebot.io/schemas/features/blocks/inputs/payment/constants'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: PaymentInputBlock['options']
  onOptionsChange: (options: PaymentInputBlock['options']) => void
}

export const PaymentSettings = ({ options, onOptionsChange }: Props) => {
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslate()

  const updateProvider = (provider: PaymentProvider) => {
    onOptionsChange({
      ...options,
      provider,
    })
  }

  const updateCredentials = (credentialsId?: string) => {
    onOptionsChange({
      ...options,
      credentialsId,
    })
  }

  const updateAmount = (amount?: string) =>
    onOptionsChange({
      ...options,
      amount,
    })

  const updateCurrency = (e: ChangeEvent<HTMLSelectElement>) =>
    onOptionsChange({
      ...options,
      currency: e.target.value,
    })

  const updateName = (name: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, name },
    })

  const updateEmail = (email: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, email },
    })

  const updatePhoneNumber = (phoneNumber: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, phoneNumber },
    })

  const updateButtonLabel = (button: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, button },
    })

  const updateSuccessLabel = (success: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, success },
    })

  const updateDescription = (description: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, description },
    })

  const updateAddress = (address: PaymentAddress) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, address },
    })

  return (
    <Stack spacing={4}>
      <Stack>
        <Text>{t('blocks.inputs.payment.settings.provider.label')}</Text>
        <DropdownList
          onItemSelect={updateProvider}
          items={Object.values(PaymentProvider)}
          currentItem={options?.provider ?? defaultPaymentInputOptions.provider}
        />
      </Stack>
      <Stack>
        <Text>{t('blocks.inputs.payment.settings.account.label')}</Text>
        {workspace && (
          <CredentialsDropdown
            type="stripe"
            workspaceId={workspace.id}
            currentCredentialsId={options?.credentialsId}
            onCredentialsSelect={updateCredentials}
            onCreateNewClick={onOpen}
            credentialsName={t(
              'blocks.inputs.payment.settings.accountText.label',
              {
                provider: 'Stripe',
              }
            )}
          />
        )}
      </Stack>
      <HStack>
        <TextInput
          label={t('blocks.inputs.payment.settings.priceAmount.label')}
          onChange={updateAmount}
          defaultValue={options?.amount}
          placeholder="30.00"
        />
        <Stack>
          <Text>{t('blocks.inputs.payment.settings.currency.label')}</Text>
          <Select
            placeholder="Select option"
            value={options?.currency ?? defaultPaymentInputOptions.currency}
            onChange={updateCurrency}
          >
            {currencies.map((currency) => (
              <option value={currency.code} key={currency.code}>
                {currency.code}
              </option>
            ))}
          </Select>
        </Stack>
      </HStack>
      <TextInput
        label={t('blocks.inputs.settings.button.label')}
        onChange={updateButtonLabel}
        defaultValue={
          options?.labels?.button ?? defaultPaymentInputOptions.labels.button
        }
      />
      <TextInput
        label={t('blocks.inputs.payment.settings.successMessage.label')}
        onChange={updateSuccessLabel}
        defaultValue={
          options?.labels?.success ?? defaultPaymentInputOptions.labels.success
        }
      />
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            {t('blocks.inputs.payment.settings.additionalInformation.label')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel py={4} as={Stack} spacing="6">
            <TextInput
              label={t('blocks.inputs.settings.description.label')}
              defaultValue={options?.additionalInformation?.description}
              onChange={updateDescription}
              placeholder={t(
                'blocks.inputs.payment.settings.additionalInformation.description.placeholder.label'
              )}
            />
            <TextInput
              label={t(
                'blocks.inputs.payment.settings.additionalInformation.name.label'
              )}
              defaultValue={options?.additionalInformation?.name}
              onChange={updateName}
              placeholder="John Smith"
            />
            <TextInput
              label={t(
                'blocks.inputs.payment.settings.additionalInformation.email.label'
              )}
              defaultValue={options?.additionalInformation?.email}
              onChange={updateEmail}
              placeholder="john@gmail.com"
            />
            <TextInput
              label={t(
                'blocks.inputs.payment.settings.additionalInformation.phone.label'
              )}
              defaultValue={options?.additionalInformation?.phoneNumber}
              onChange={updatePhoneNumber}
              placeholder="+33XXXXXXXXX"
            />
            <PaymentAddressSettings
              address={options?.additionalInformation?.address}
              onAddressChange={updateAddress}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <StripeConfigModal
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={updateCredentials}
      />
    </Stack>
  )
}
