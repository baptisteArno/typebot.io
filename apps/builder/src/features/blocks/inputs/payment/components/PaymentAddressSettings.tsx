import {
  Stack,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react'
import React from 'react'
import { TextInput } from '@/components/inputs'
import { PaymentAddress } from '@typebot.io/schemas'

type Props = {
  address: PaymentAddress
  onAddressChange: (address: PaymentAddress) => void
}

export const PaymentAddressSettings = ({ address, onAddressChange }: Props) => {
  const updateCountry = (country: string) =>
    onAddressChange({
      ...address,
      country,
    })

  const updateLine1 = (line1: string) =>
    onAddressChange({
      ...address,
      line1,
    })

  const updateLine2 = (line2: string) =>
    onAddressChange({
      ...address,
      line2,
    })

  const updateCity = (city: string) =>
    onAddressChange({
      ...address,
      city,
    })

  const updateState = (state: string) =>
    onAddressChange({
      ...address,
      state,
    })

  const updatePostalCode = (postalCode: string) =>
    onAddressChange({
      ...address,
      postalCode,
    })

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton justifyContent="space-between">
          Address
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel py={4} as={Stack} spacing="4">
          <TextInput
            label="Country:"
            defaultValue={address?.country ?? ''}
            onChange={updateCountry}
          />
          <TextInput
            label="Line 1:"
            defaultValue={address?.line1 ?? ''}
            onChange={updateLine1}
          />
          <TextInput
            label="Line 2:"
            defaultValue={address?.line2 ?? ''}
            onChange={updateLine2}
          />
          <TextInput
            label="City:"
            defaultValue={address?.city ?? ''}
            onChange={updateCity}
          />
          <TextInput
            label="State:"
            defaultValue={address?.state ?? ''}
            onChange={updateState}
          />
          <TextInput
            label="Postal code:"
            defaultValue={address?.postalCode ?? ''}
            onChange={updatePostalCode}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
