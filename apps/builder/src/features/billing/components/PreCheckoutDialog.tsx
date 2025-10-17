import { FormControl, FormLabel, HStack, Stack } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { taxIdTypes } from "@typebot.io/billing/taxIdTypes";
import { isDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { useRouter } from "next/router";
import type { FormEvent } from "react";
import React, { useState } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { TextInput } from "@/components/inputs/TextInput";
import { trpc } from "@/lib/queryClient";

export type PreCheckoutDialogProps = {
  selectedSubscription:
    | {
        plan: "STARTER" | "PRO";
        workspaceId: string;
      }
    | undefined;
  existingCompany?: string;
  existingEmail?: string;
  onClose: () => void;
};

const vatCodeLabels = taxIdTypes.map((taxIdType) => ({
  label: (
    <span className="flex items-center gap-2">
      {taxIdType.name} ({taxIdType.code}) <span>{taxIdType.emoji}</span>
    </span>
  ),
  value: taxIdType.code,
}));

export const PreCheckoutDialog = ({
  selectedSubscription,
  existingCompany,
  existingEmail,
  onClose,
}: PreCheckoutDialogProps) => {
  const { t } = useTranslate();
  const vatValueInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { mutate: createCheckoutSession, status: createCheckoutSessionStatus } =
    useMutation(
      trpc.billing.createCheckoutSession.mutationOptions({
        onSuccess: ({ checkoutUrl }) => {
          router.push(checkoutUrl);
        },
      }),
    );

  const [customer, setCustomer] = useState({
    company: existingCompany ?? "",
    email: existingEmail ?? "",
    vat: {
      code: undefined as (typeof vatCodeLabels)[number]["value"] | undefined,
      value: "",
    },
  });
  const [vatValuePlaceholder, setVatValuePlaceholder] = useState("");

  const updateCustomerCompany = (company: string) => {
    setCustomer((customer) => ({ ...customer, company }));
  };

  const updateCustomerEmail = (email: string) => {
    setCustomer((customer) => ({ ...customer, email }));
  };

  const updateVatCode = (vatCode?: (typeof vatCodeLabels)[number]["value"]) => {
    setCustomer((customer) => ({
      ...customer,
      vat: {
        ...customer.vat,
        code: vatCode,
      },
    }));
    const vatPlaceholder = taxIdTypes.find(
      (taxIdType) => taxIdType.code === vatCode,
    )?.placeholder;
    if (vatPlaceholder) setVatValuePlaceholder(vatPlaceholder ?? "");
    vatValueInputRef.current?.focus();
  };

  const updateVatValue = (value: string) => {
    setCustomer((customer) => ({
      ...customer,
      vat: {
        ...customer.vat,
        value,
      },
    }));
  };

  const goToCheckout = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSubscription) return;
    const { email, company, vat } = customer;
    const vatType = taxIdTypes.find(
      (taxIdType) => taxIdType.code === vat.code,
    )?.type;
    if (!vatType) throw new Error("Could not find VAT type");
    createCheckoutSession({
      ...selectedSubscription,
      email,
      company,
      returnUrl: window.location.href,
      vat:
        vat.value && vat.code ? { type: vatType, value: vat.value } : undefined,
    });
  };

  return (
    <Dialog.Root isOpen={isDefined(selectedSubscription)} onClose={onClose}>
      <Dialog.Popup render={<form onSubmit={goToCheckout} />}>
        <Stack spacing="4">
          <TextInput
            isRequired
            label={t("billing.preCheckoutModal.companyInput.label")}
            defaultValue={customer.company}
            onChange={updateCustomerCompany}
            withVariableButton={false}
            debounceTimeout={0}
          />
          <TextInput
            isRequired
            type="email"
            label={t("billing.preCheckoutModal.emailInput.label")}
            defaultValue={customer.email}
            onChange={updateCustomerEmail}
            withVariableButton={false}
            debounceTimeout={0}
          />
          <FormControl>
            <FormLabel>{t("billing.preCheckoutModal.taxId.label")}</FormLabel>
            <HStack>
              <BasicSelect
                placeholder={t("billing.preCheckoutModal.taxId.placeholder")}
                value={customer.vat.code}
                items={vatCodeLabels}
                onChange={updateVatCode}
              />
              <TextInput
                ref={vatValueInputRef}
                onChange={updateVatValue}
                withVariableButton={false}
                debounceTimeout={0}
                placeholder={vatValuePlaceholder}
                flexShrink={0}
                className="flex-1"
              />
            </HStack>
          </FormControl>

          <Button
            type="submit"
            disabled={
              customer.company === "" ||
              customer.email === "" ||
              createCheckoutSessionStatus === "pending"
            }
          >
            {t("billing.preCheckoutModal.submitButton.label")}
          </Button>
        </Stack>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
