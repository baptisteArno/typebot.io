import { TextInput } from "@/components/inputs";
import { Select } from "@/components/inputs/Select";
import { useParentModal } from "@/features/graph/providers/ParentModalProvider";
import { trpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
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
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { taxIdTypes } from "@typebot.io/billing/taxIdTypes";
import { isDefined } from "@typebot.io/lib/utils";
import { useRouter } from "next/router";
import type { FormEvent } from "react";
import React, { useState } from "react";

export type PreCheckoutModalProps = {
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
  label: `${taxIdType.emoji} ${taxIdType.name} (${taxIdType.code})`,
  value: taxIdType.type,
  extras: {
    placeholder: taxIdType.placeholder,
  },
}));

export const PreCheckoutModal = ({
  selectedSubscription,
  existingCompany,
  existingEmail,
  onClose,
}: PreCheckoutModalProps) => {
  const { t } = useTranslate();
  const { ref } = useParentModal();
  const vatValueInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { mutate: createCheckoutSession, status: createCheckoutSessionStatus } =
    useMutation(
      trpc.billing.createCheckoutSession.mutationOptions({
        onError: (error) => {
          toast({
            description: error.message,
          });
        },
        onSuccess: ({ checkoutUrl }) => {
          router.push(checkoutUrl);
        },
      }),
    );

  const [customer, setCustomer] = useState({
    company: existingCompany ?? "",
    email: existingEmail ?? "",
    vat: {
      type: undefined as string | undefined,
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

  const updateVatType = (
    type: string | undefined,
    vatCode?: (typeof vatCodeLabels)[number],
  ) => {
    setCustomer((customer) => ({
      ...customer,
      vat: {
        ...customer.vat,
        type,
      },
    }));
    setVatValuePlaceholder(vatCode?.extras?.placeholder ?? "");
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
    createCheckoutSession({
      ...selectedSubscription,
      email,
      company,
      returnUrl: window.location.href,
      vat:
        vat.value && vat.type
          ? { type: vat.type, value: vat.value }
          : undefined,
    });
  };

  return (
    <Modal isOpen={isDefined(selectedSubscription)} onClose={onClose}>
      <ModalOverlay />
      <ModalContent ref={ref}>
        <ModalBody py="8">
          <Stack as="form" spacing="4" onSubmit={goToCheckout}>
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
                <Select
                  placeholder={t("billing.preCheckoutModal.taxId.placeholder")}
                  items={vatCodeLabels}
                  onSelect={updateVatType}
                />
                <TextInput
                  ref={vatValueInputRef}
                  onChange={updateVatValue}
                  withVariableButton={false}
                  debounceTimeout={0}
                  placeholder={vatValuePlaceholder}
                  flexShrink={0}
                />
              </HStack>
            </FormControl>

            <Button
              type="submit"
              isLoading={createCheckoutSessionStatus === "pending"}
              colorScheme="blue"
              isDisabled={customer.company === "" || customer.email === ""}
            >
              {t("billing.preCheckoutModal.submitButton.label")}
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
