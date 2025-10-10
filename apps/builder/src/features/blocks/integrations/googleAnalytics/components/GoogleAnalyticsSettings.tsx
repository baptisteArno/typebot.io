import { Box, Stack } from "@chakra-ui/react";
import type { GoogleAnalyticsBlock } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { TextInput } from "@/components/inputs/TextInput";

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
    <Stack spacing={4}>
      <TextInput
        label="Measurement ID:"
        moreInfoTooltip="Can be found by clicking on your data stream in Google Analytics dashboard"
        defaultValue={options?.trackingId}
        placeholder="G-123456..."
        onChange={updateTrackingId}
      />
      <TextInput
        label="Event action:"
        defaultValue={options?.action}
        placeholder="Example: conversion"
        onChange={updateAction}
      />
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>
            <Box flex="1" textAlign="left">
              Advanced
            </Box>
          </Accordion.Trigger>
          <Accordion.Panel>
            <TextInput
              label="Event category:"
              defaultValue={options?.category}
              placeholder="Example: Typebot"
              onChange={updateCategory}
            />
            <TextInput
              label="Event label:"
              defaultValue={options?.label}
              placeholder="Example: Campaign Z"
              onChange={updateLabel}
            />
            <Field.Root>
              <Field.Label>Event value:</Field.Label>
              <BasicNumberInput
                defaultValue={options?.value}
                onValueChange={updateValue}
                placeholder="Example: 0"
              />
            </Field.Root>
            <TextInput
              label="Send to:"
              moreInfoTooltip="Useful to send a conversion event to Google Ads"
              defaultValue={options?.sendTo?.toString()}
              placeholder="Example: AW-123456789"
              onChange={updateSendTo}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
};
