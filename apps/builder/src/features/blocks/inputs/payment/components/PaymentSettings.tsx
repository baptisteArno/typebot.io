import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import {
  defaultPaymentInputOptions,
  PaymentProvider,
} from "@typebot.io/blocks-inputs/payment/constants";
import type {
  PaymentAddress,
  PaymentInputBlock,
} from "@typebot.io/blocks-inputs/payment/schema";
import { useMemo } from "react";
import { TextInput } from "@/components/inputs";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CredentialsDropdown } from "@/features/credentials/components/CredentialsDropdown";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { currencies } from "../currencies";
import { CreateStripeCredentialsDialog } from "./CreateStripeCredentialsDialog";
import { PaymentAddressSettings } from "./PaymentAddressSettings";

type Props = {
  options: PaymentInputBlock["options"];
  onOptionsChange: (options: PaymentInputBlock["options"]) => void;
};

export const PaymentSettings = ({ options, onOptionsChange }: Props) => {
  const { workspace } = useWorkspace();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslate();

  const updateProvider = (provider: PaymentProvider | undefined) => {
    onOptionsChange({
      ...options,
      provider,
    });
  };

  const updateCredentials = (credentialsId?: string) => {
    onOptionsChange({
      ...options,
      credentialsId,
    });
  };

  const updateAmount = (amount?: string) =>
    onOptionsChange({
      ...options,
      amount,
    });

  const updateCurrency = (currency: string | undefined) =>
    onOptionsChange({
      ...options,
      currency,
    });

  const updateName = (name: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, name },
    });

  const updateEmail = (email: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, email },
    });

  const updatePhoneNumber = (phoneNumber: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, phoneNumber },
    });

  const updateButtonLabel = (button: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, button },
    });

  const updateSuccessLabel = (success: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, success },
    });

  const updateDescription = (description: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, description },
    });

  const updateAddress = (address: PaymentAddress) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, address },
    });

  const providers = useMemo(
    () =>
      Object.values(PaymentProvider).map((provider) => ({
        label: provider,
        value: provider,
      })),
    [],
  );

  return (
    <Stack spacing={4}>
      <Stack>
        <Text>{t("blocks.inputs.payment.settings.provider.label")}</Text>
        <BasicSelect
          items={providers}
          onChange={updateProvider}
          value={options?.provider}
          defaultValue={defaultPaymentInputOptions.provider}
        />
      </Stack>
      <Stack>
        <Text>{t("blocks.inputs.payment.settings.account.label")}</Text>
        {workspace && (
          <CredentialsDropdown
            type="stripe"
            scope={{ type: "workspace", workspaceId: workspace.id }}
            currentCredentialsId={options?.credentialsId}
            onCredentialsSelect={updateCredentials}
            onCreateNewClick={onOpen}
            credentialsName={t(
              "blocks.inputs.payment.settings.accountText.label",
              {
                provider: "Stripe",
              },
            )}
          />
        )}
      </Stack>
      <HStack>
        <TextInput
          label={t("blocks.inputs.payment.settings.priceAmount.label")}
          onChange={updateAmount}
          defaultValue={options?.amount}
          placeholder="30.00"
        />
        <Stack>
          <Text>{t("blocks.inputs.payment.settings.currency.label")}</Text>
          <BasicSelect
            items={currencies.map((currency) => currency.code)}
            onChange={updateCurrency}
            value={options?.currency}
            defaultValue={defaultPaymentInputOptions.currency}
          />
        </Stack>
      </HStack>
      <TextInput
        label={t("blocks.inputs.settings.button.label")}
        onChange={updateButtonLabel}
        defaultValue={
          options?.labels?.button ?? defaultPaymentInputOptions.labels.button
        }
      />
      <TextInput
        label={t("blocks.inputs.payment.settings.successMessage.label")}
        onChange={updateSuccessLabel}
        defaultValue={
          options?.labels?.success ?? defaultPaymentInputOptions.labels.success
        }
      />
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            {t("blocks.inputs.payment.settings.additionalInformation.label")}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel py={4} as={Stack} spacing="6">
            <TextInput
              label={t("blocks.inputs.settings.description.label")}
              defaultValue={options?.additionalInformation?.description}
              onChange={updateDescription}
              placeholder={t(
                "blocks.inputs.payment.settings.additionalInformation.description.placeholder.label",
              )}
            />
            <TextInput
              label={t(
                "blocks.inputs.payment.settings.additionalInformation.name.label",
              )}
              defaultValue={options?.additionalInformation?.name}
              onChange={updateName}
              placeholder="John Smith"
            />
            <TextInput
              label={t(
                "blocks.inputs.payment.settings.additionalInformation.email.label",
              )}
              defaultValue={options?.additionalInformation?.email}
              onChange={updateEmail}
              placeholder="john@gmail.com"
            />
            <TextInput
              label={t(
                "blocks.inputs.payment.settings.additionalInformation.phone.label",
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

      <CreateStripeCredentialsDialog
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={updateCredentials}
      />
    </Stack>
  );
};
