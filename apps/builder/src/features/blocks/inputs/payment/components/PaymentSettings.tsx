import { useTranslate } from "@tolgee/react";
import {
  defaultPaymentInputOptions,
  PaymentProvider,
} from "@typebot.io/blocks-inputs/payment/constants";
import type {
  PaymentAddress,
  PaymentInputBlock,
} from "@typebot.io/blocks-inputs/payment/schema";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { useMemo } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
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
  const { isOpen, onOpen, onClose } = useOpenControls();
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p>{t("blocks.inputs.payment.settings.provider.label")}</p>
        <BasicSelect
          items={providers}
          onChange={updateProvider}
          value={options?.provider}
          defaultValue={defaultPaymentInputOptions.provider}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p>{t("blocks.inputs.payment.settings.account.label")}</p>
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
      </div>
      <div className="flex items-center gap-2">
        <Field.Root>
          <Field.Label>
            {t("blocks.inputs.payment.settings.priceAmount.label")}
          </Field.Label>
          <DebouncedTextInputWithVariablesButton
            onValueChange={updateAmount}
            defaultValue={options?.amount}
            placeholder="30.00"
          />
        </Field.Root>
        <div className="flex flex-col gap-2">
          <p>{t("blocks.inputs.payment.settings.currency.label")}</p>
          <BasicSelect
            items={currencies.map((currency) => currency.code)}
            onChange={updateCurrency}
            value={options?.currency}
            defaultValue={defaultPaymentInputOptions.currency}
          />
        </div>
      </div>
      <Field.Root>
        <Field.Label>{t("blocks.inputs.settings.button.label")}</Field.Label>
        <DebouncedTextInputWithVariablesButton
          onValueChange={updateButtonLabel}
          defaultValue={
            options?.labels?.button ?? defaultPaymentInputOptions.labels.button
          }
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.payment.settings.successMessage.label")}
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          onValueChange={updateSuccessLabel}
          defaultValue={
            options?.labels?.success ??
            defaultPaymentInputOptions.labels.success
          }
        />
      </Field.Root>
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>
            {t("blocks.inputs.payment.settings.additionalInformation.label")}
          </Accordion.Trigger>
          <Accordion.Panel>
            <Field.Root>
              <Field.Label>
                {t("blocks.inputs.settings.description.label")}
              </Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={options?.additionalInformation?.description}
                onValueChange={updateDescription}
                placeholder={t(
                  "blocks.inputs.payment.settings.additionalInformation.description.placeholder.label",
                )}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>
                {t(
                  "blocks.inputs.payment.settings.additionalInformation.name.label",
                )}
              </Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={options?.additionalInformation?.name}
                onValueChange={updateName}
                placeholder="John Smith"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>
                {t(
                  "blocks.inputs.payment.settings.additionalInformation.email.label",
                )}
              </Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={options?.additionalInformation?.email}
                onValueChange={updateEmail}
                placeholder="john@gmail.com"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>
                {t(
                  "blocks.inputs.payment.settings.additionalInformation.phone.label",
                )}
              </Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={options?.additionalInformation?.phoneNumber}
                onValueChange={updatePhoneNumber}
                placeholder="+33XXXXXXXXX"
              />
            </Field.Root>
            <PaymentAddressSettings
              address={options?.additionalInformation?.address}
              onAddressChange={updateAddress}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
      <CreateStripeCredentialsDialog
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={updateCredentials}
      />
    </div>
  );
};
