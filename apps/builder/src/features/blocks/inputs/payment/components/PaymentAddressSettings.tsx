import { TextInput } from "@/components/inputs";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { PaymentAddress } from "@typebot.io/blocks-inputs/payment/schema";
import React from "react";

type Props = {
  address: PaymentAddress;
  onAddressChange: (address: PaymentAddress) => void;
};

export const PaymentAddressSettings = ({ address, onAddressChange }: Props) => {
  const { t } = useTranslate();

  const updateCountry = (country: string) =>
    onAddressChange({
      ...address,
      country,
    });

  const updateLine1 = (line1: string) =>
    onAddressChange({
      ...address,
      line1,
    });

  const updateLine2 = (line2: string) =>
    onAddressChange({
      ...address,
      line2,
    });

  const updateCity = (city: string) =>
    onAddressChange({
      ...address,
      city,
    });

  const updateState = (state: string) =>
    onAddressChange({
      ...address,
      state,
    });

  const updatePostalCode = (postalCode: string) =>
    onAddressChange({
      ...address,
      postalCode,
    });

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton justifyContent="space-between">
          {t("blocks.inputs.payment.settings.address.label")}
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel py={4} as={Stack} spacing="4">
          <TextInput
            label={t("blocks.inputs.payment.settings.address.country.label")}
            defaultValue={address?.country ?? ""}
            onChange={updateCountry}
          />
          <TextInput
            label={t("blocks.inputs.payment.settings.address.line.label", {
              line: "1",
            })}
            defaultValue={address?.line1 ?? ""}
            onChange={updateLine1}
          />
          <TextInput
            label={t("blocks.inputs.payment.settings.address.line.label", {
              line: "2",
            })}
            defaultValue={address?.line2 ?? ""}
            onChange={updateLine2}
          />
          <TextInput
            label={t("blocks.inputs.payment.settings.address.city.label")}
            defaultValue={address?.city ?? ""}
            onChange={updateCity}
          />
          <TextInput
            label={t("blocks.inputs.payment.settings.address.state.label")}
            defaultValue={address?.state ?? ""}
            onChange={updateState}
          />
          <TextInput
            label={t("blocks.inputs.payment.settings.address.postalCode.label")}
            defaultValue={address?.postalCode ?? ""}
            onChange={updatePostalCode}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
