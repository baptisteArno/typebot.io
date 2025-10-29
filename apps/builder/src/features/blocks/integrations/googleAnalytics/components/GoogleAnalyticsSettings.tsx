import type { GoogleAnalyticsBlock } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";

type Props = {
  options?: GoogleAnalyticsBlock["options"];
  onOptionsChange: (options: GoogleAnalyticsBlock["options"]) => void;
};

export const GoogleAnalyticsSettings = ({
  options,
  onOptionsChange,
}: Props) => {
  const updateTrackingId = (trackingId: string) =>
    onOptionsChange({ ...options, trackingId });

  const updateCategory = (category: string) =>
    onOptionsChange({ ...options, category });

  const updateAction = (action: string) =>
    onOptionsChange({ ...options, action });

  const updateLabel = (label: string) => onOptionsChange({ ...options, label });

  const updateValue = (value: number | `{{${string}}}` | undefined) =>
    onOptionsChange({
      ...options,
      value,
    });

  const updateSendTo = (sendTo?: string) =>
    onOptionsChange({
      ...options,
      sendTo,
    });

  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>
          Measurement ID:
          <MoreInfoTooltip>
            Can be found by clicking on your data stream in Google Analytics
            dashboard
          </MoreInfoTooltip>
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={options?.trackingId}
          placeholder="G-123456..."
          onValueChange={updateTrackingId}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Event action:</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={options?.action}
          placeholder="Example: conversion"
          onValueChange={updateAction}
        />
      </Field.Root>
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>
            <div className="flex-1 text-left">Advanced</div>
          </Accordion.Trigger>
          <Accordion.Panel>
            <Field.Root>
              <Field.Label>Event category:</Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={options?.category}
                placeholder="Example: Typebot"
                onValueChange={updateCategory}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Event label:</Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={options?.label}
                placeholder="Example: Campaign Z"
                onValueChange={updateLabel}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Event value:</Field.Label>
              <BasicNumberInput
                defaultValue={options?.value}
                onValueChange={updateValue}
                placeholder="Example: 0"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>
                Send to:
                <MoreInfoTooltip>
                  Useful to send a conversion event to Google Ads
                </MoreInfoTooltip>
              </Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={options?.sendTo?.toString()}
                placeholder="Example: AW-123456789"
                onValueChange={updateSendTo}
              />
            </Field.Root>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};
