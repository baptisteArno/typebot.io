import { useTranslate } from "@tolgee/react";
import type { PaymentAddress } from "@typebot.io/blocks-inputs/payment/schema";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";

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
    <Accordion.Root>
      <Accordion.Item>
        <Accordion.Trigger>
          {t("blocks.inputs.payment.settings.address.label")}
        </Accordion.Trigger>
        <Accordion.Panel>
          <Field.Root>
            <Field.Label>
              {t("blocks.inputs.payment.settings.address.country.label")}
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={address?.country ?? ""}
              onValueChange={updateCountry}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>
              {t("blocks.inputs.payment.settings.address.line.label", {
                line: "1",
              })}
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={address?.line1 ?? ""}
              onValueChange={updateLine1}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>
              {t("blocks.inputs.payment.settings.address.line.label", {
                line: "2",
              })}
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={address?.line2 ?? ""}
              onValueChange={updateLine2}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>
              {t("blocks.inputs.payment.settings.address.city.label")}
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={address?.city ?? ""}
              onValueChange={updateCity}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>
              {t("blocks.inputs.payment.settings.address.state.label")}
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={address?.state ?? ""}
              onValueChange={updateState}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>
              {t("blocks.inputs.payment.settings.address.postalCode.label")}
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={address?.postalCode ?? ""}
              onValueChange={updatePostalCode}
            />
          </Field.Root>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
};
