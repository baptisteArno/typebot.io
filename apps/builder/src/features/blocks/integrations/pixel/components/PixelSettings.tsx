import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { TableList } from "@/components/TableList";
import { TextLink } from "@/components/TextLink";
import { TextInput } from "@/components/inputs";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { Stack, Text } from "@chakra-ui/react";
import {
  defaultPixelOptions,
  pixelEventTypes,
  pixelObjectProperties,
} from "@typebot.io/blocks-integrations/pixel/constants";
import type { PixelBlock } from "@typebot.io/blocks-integrations/pixel/schema";
import { isDefined, isEmpty } from "@typebot.io/lib/utils";
import React from "react";

const pixelReferenceUrl =
  "https://developers.facebook.com/docs/meta-pixel/reference#standard-events";

type Props = {
  options?: PixelBlock["options"];
  onOptionsChange: (options: PixelBlock["options"]) => void;
};

type Item = NonNullable<NonNullable<PixelBlock["options"]>["params"]>[number];

export const PixelSettings = ({ options, onOptionsChange }: Props) => {
  const updateIsInitSkipped = (isChecked: boolean) =>
    onOptionsChange({
      ...options,
      isInitSkip: isChecked,
    });

  const updatePixelId = (pixelId: string) =>
    onOptionsChange({
      ...options,
      pixelId: isEmpty(pixelId) ? undefined : pixelId,
    });

  const updateIsTrackingEventEnabled = (isChecked: boolean) =>
    onOptionsChange({
      ...options,
      params: isChecked && !options?.params ? [] : undefined,
    });

  const updateEventType = (
    eventType: (typeof pixelEventTypes)[number] | "Custom" | undefined,
  ) =>
    onOptionsChange({
      ...options,
      params: [],
      eventType,
    });

  const updateParams = (params: NonNullable<PixelBlock["options"]>["params"]) =>
    onOptionsChange({
      ...options,
      params,
    });

  const updateEventName = (name: string) => {
    if (options?.eventType !== "Custom") return;
    onOptionsChange({
      ...options,
      name: isEmpty(name) ? undefined : name,
    });
  };

  return (
    <Stack spacing={4}>
      <TextInput
        defaultValue={options?.pixelId ?? ""}
        onChange={updatePixelId}
        withVariableButton={false}
        placeholder='Pixel ID (e.g. "123456789")'
      />
      <SwitchWithLabel
        label={"Skip initialization"}
        moreInfoContent="Check this if the bot is embedded in your website and the pixel is already initialized."
        initialValue={options?.isInitSkip ?? defaultPixelOptions.isInitSkip}
        onCheckChange={updateIsInitSkipped}
      />
      <SwitchWithRelatedSettings
        label={"Track event"}
        initialValue={isDefined(options?.params)}
        onCheckChange={updateIsTrackingEventEnabled}
      >
        <Text fontSize="sm" color="gray.500">
          Read the{" "}
          <TextLink href={pixelReferenceUrl} isExternal>
            reference
          </TextLink>{" "}
          to better understand the available options.
        </Text>
        <BasicSelect
          items={["Custom", ...pixelEventTypes]}
          value={options?.eventType}
          placeholder="Select event type"
          onChange={updateEventType}
        />
        {options?.eventType === "Custom" && (
          <TextInput
            defaultValue={options.name ?? ""}
            onChange={updateEventName}
            placeholder="Event name"
          />
        )}
        {options?.eventType &&
          (options.eventType === "Custom" ||
            pixelObjectProperties.filter((prop) =>
              prop.associatedEvents.includes(options.eventType),
            ).length > 0) && (
            <TableList
              initialItems={options?.params ?? []}
              onItemsChange={updateParams}
              addLabel="Add parameter"
            >
              {(props) => (
                <ParamItem {...props} eventType={options?.eventType} />
              )}
            </TableList>
          )}
      </SwitchWithRelatedSettings>
    </Stack>
  );
};

type ParamItemProps = {
  item: Item;
  eventType: "Custom" | (typeof pixelEventTypes)[number] | undefined;
  onItemChange: (item: Item) => void;
};

const ParamItem = ({ item, eventType, onItemChange }: ParamItemProps) => {
  const possibleObjectProps =
    eventType && eventType !== "Custom"
      ? pixelObjectProperties.filter((prop) =>
          prop.associatedEvents.includes(eventType),
        )
      : [];

  const currentObject = possibleObjectProps.find(
    (prop) => prop.key === item.key,
  );

  const updateKey = (key: string | undefined) =>
    onItemChange({
      ...item,
      key,
    });

  const updateValue = (value: string) =>
    onItemChange({
      ...item,
      value,
    });

  if (!eventType) return null;

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      {eventType === "Custom" ? (
        <TextInput
          defaultValue={item.key}
          onChange={updateKey}
          placeholder="Key"
        />
      ) : (
        <BasicSelect
          value={item.key}
          items={possibleObjectProps.map((prop) => prop.key)}
          onChange={updateKey}
          placeholder="Select key"
        />
      )}
      {currentObject?.type === "code" ? (
        <CodeEditor
          lang={"javascript"}
          defaultValue={item.value}
          onChange={updateValue}
        />
      ) : (
        <TextInput
          defaultValue={item.value}
          onChange={updateValue}
          placeholder="Value"
        />
      )}
    </Stack>
  );
};
