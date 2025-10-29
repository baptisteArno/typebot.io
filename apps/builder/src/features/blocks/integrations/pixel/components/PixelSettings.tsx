import {
  defaultPixelOptions,
  pixelEventTypes,
  pixelObjectProperties,
} from "@typebot.io/blocks-integrations/pixel/constants";
import type { PixelBlock } from "@typebot.io/blocks-integrations/pixel/schema";
import { isDefined, isEmpty } from "@typebot.io/lib/utils";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import {
  DebouncedTextInput,
  DebouncedTextInputWithVariablesButton,
} from "@/components/inputs/DebouncedTextInput";
import { TableList } from "@/components/TableList";
import { TextLink } from "@/components/TextLink";

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
    <div className="flex flex-col gap-4">
      <DebouncedTextInput
        defaultValue={options?.pixelId ?? ""}
        onValueChange={updatePixelId}
        placeholder='Pixel ID (e.g. "123456789")'
      />
      <Field.Root className="flex-row items-center">
        <Switch
          checked={options?.isInitSkip ?? defaultPixelOptions.isInitSkip}
          onCheckedChange={updateIsInitSkipped}
        />
        <Field.Label>
          Skip initialization{" "}
          <MoreInfoTooltip>
            Check this if the bot is embedded in your website and the pixel is
            already initialized.
          </MoreInfoTooltip>
        </Field.Label>
      </Field.Root>
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={isDefined(options?.params)}
            onCheckedChange={updateIsTrackingEventEnabled}
          />
          <Field.Label>Track event</Field.Label>
        </Field.Root>
        {isDefined(options?.params) && (
          <>
            <p className="text-sm" color="gray.500">
              Read the{" "}
              <TextLink href={pixelReferenceUrl} isExternal>
                reference
              </TextLink>{" "}
              to better understand the available options.
            </p>
            <BasicSelect
              items={["Custom", ...pixelEventTypes]}
              value={options?.eventType}
              placeholder="Select event type"
              onChange={updateEventType}
            />
            {options?.eventType === "Custom" && (
              <DebouncedTextInputWithVariablesButton
                defaultValue={options.name ?? ""}
                onValueChange={updateEventName}
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
          </>
        )}
      </Field.Container>
    </div>
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
    <div className="flex flex-col gap-2 p-4 rounded-md flex-1 border">
      {eventType === "Custom" ? (
        <DebouncedTextInputWithVariablesButton
          defaultValue={item.key}
          onValueChange={updateKey}
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
        <DebouncedTextInputWithVariablesButton
          defaultValue={item.value}
          onValueChange={updateValue}
          placeholder="Value"
        />
      )}
    </div>
  );
};
