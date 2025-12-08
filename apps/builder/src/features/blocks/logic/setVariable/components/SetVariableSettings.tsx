import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import {
  defaultSetVariableOptions,
  hiddenTypes,
  sessionOnlySetVariableOptions,
  valueTypes,
  whatsAppSetVariableTypes,
} from "@typebot.io/blocks-logic/setVariable/constants";
import type { SetVariableBlock } from "@typebot.io/blocks-logic/setVariable/schema";
import { timeZones } from "@typebot.io/lib/timeZones";
import { isDefined } from "@typebot.io/lib/utils";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Field } from "@typebot.io/ui/components/Field";
import { Label } from "@typebot.io/ui/components/Label";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Radio, RadioGroup } from "@typebot.io/ui/components/RadioGroup";
import { Switch } from "@typebot.io/ui/components/Switch";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import type { Variable } from "@typebot.io/variables/schemas";
import type { JSX } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { WhatsAppLogo } from "@/components/logos/WhatsAppLogo";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { UnsafeScriptAlert } from "../../script/components/UnsafeScriptAlert";

type Props = {
  options: SetVariableBlock["options"];
  onOptionsChange: (options: SetVariableBlock["options"]) => void;
};

const setVarTypes = valueTypes.filter(
  (type) => !hiddenTypes.includes(type as (typeof hiddenTypes)[number]),
);

export const SetVariableSettings = ({ options, onOptionsChange }: Props) => {
  const { typebot, updateVariable } = useTypebot();
  const selectedVariable = typebot?.variables.find(
    (variable) => variable.id === options?.variableId,
  );

  const updateVariableId = (variable?: Pick<Variable, "id">) =>
    onOptionsChange({
      ...options,
      variableId: variable?.id,
    });

  const updateValueType = (type?: string) =>
    onOptionsChange({
      ...options,
      type: type as NonNullable<SetVariableBlock["options"]>["type"],
    });

  const updateIsSessionVariable = (isSavingInResults: boolean) => {
    if (!selectedVariable?.id) return;
    updateVariable(selectedVariable.id, {
      isSessionVariable: !isSavingInResults,
    });
  };

  const isSessionOnly =
    options?.type &&
    sessionOnlySetVariableOptions.includes(
      options.type as (typeof sessionOnlySetVariableOptions)[number],
    );

  const isLinkedToAnswer =
    options?.variableId &&
    typebot?.groups.some((g) =>
      g.blocks.some(
        (b) => isInputBlock(b) && b.options?.variableId === options.variableId,
      ),
    );

  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>Search or create variable:</Field.Label>
        <VariablesCombobox
          onSelectVariable={updateVariableId}
          initialVariableId={options?.variableId}
        />
      </Field.Root>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="mb-0 font-medium">Value:</p>
          <BasicSelect
            value={options?.type ?? defaultSetVariableOptions.type}
            items={setVarTypes.map((type) => ({
              label: type,
              value: type,
              icon: whatsAppSetVariableTypes.includes(type as any) ? (
                <WhatsAppLogo />
              ) : undefined,
            }))}
            onChange={updateValueType}
          />
        </div>

        {selectedVariable && !isSessionOnly && !isLinkedToAnswer && (
          <Field.Root className="flex-row items-center">
            <Switch
              checked={!selectedVariable.isSessionVariable}
              onCheckedChange={updateIsSessionVariable}
            />
            <Field.Label>
              Save in results{" "}
              <MoreInfoTooltip>
                By default, the variable is saved only for the user chat
                session. Check this option if you want to also store the
                variable in the typebot Results table.
              </MoreInfoTooltip>
            </Field.Label>
          </Field.Root>
        )}
        <SetVariableValue options={options} onOptionsChange={onOptionsChange} />
      </div>
    </div>
  );
};

const SetVariableValue = ({
  options,
  onOptionsChange,
}: {
  options: SetVariableBlock["options"];
  onOptionsChange: (options: SetVariableBlock["options"]) => void;
}): JSX.Element | null => {
  const updateExpression = (expressionToEvaluate: string) =>
    onOptionsChange({
      ...options,
      type: isDefined(options?.type) ? "Custom" : undefined,
      expressionToEvaluate,
    });

  const updateClientExecution = (isExecutedOnClient: boolean) =>
    onOptionsChange({
      ...options,
      isExecutedOnClient,
    });

  const updateListVariableId = (variable?: Pick<Variable, "id">) => {
    if (!options || (options.type !== "Pop" && options.type !== "Shift"))
      return;
    onOptionsChange({
      ...options,
      saveItemInVariableId: variable?.id,
    });
  };

  const updateItemVariableId = (variable?: Pick<Variable, "id">) => {
    if (!options || options.type !== "Map item with same index") return;
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        baseItemVariableId: variable?.id,
      },
    });
  };

  const updateBaseListVariableId = (variable?: Pick<Variable, "id">) => {
    if (!options || options.type !== "Map item with same index") return;
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        baseListVariableId: variable?.id,
      },
    });
  };

  const updateTargetListVariableId = (variable?: Pick<Variable, "id">) => {
    if (!options || options.type !== "Map item with same index") return;
    onOptionsChange({
      ...options,
      mapListItemParams: {
        ...options.mapListItemParams,
        targetListVariableId: variable?.id,
      },
    });
  };

  const updateItem = (item: string) => {
    if (!options || options.type !== "Append value(s)") return;
    onOptionsChange({
      ...options,
      item,
    });
  };

  const updateIsCode = (radio: "Text" | "Code") => {
    if (options?.type && options.type !== "Custom") return;
    onOptionsChange({
      ...options,
      expressionDescription:
        radio !== "Code" ? undefined : options?.expressionDescription,
      isCode: radio === "Code",
    });
  };

  const updateSaveErrorInVariableId = (variable?: Pick<Variable, "id">) => {
    if (options?.type && options.type !== "Custom") return;
    onOptionsChange({
      ...options,
      saveErrorInVariableId: variable?.id,
    });
  };

  const updateExpressionDescription = (description: string) => {
    if (options?.type && options.type !== "Custom") return;
    onOptionsChange({
      ...options,
      expressionDescription: description,
    });
  };

  const updateIsUnsafe = () => onOptionsChange({ ...options, isUnsafe: false });

  switch (options?.type) {
    case "Custom":
    case undefined:
      return (
        <div className="flex flex-col gap-2">
          <RadioGroup
            onValueChange={(value) => updateIsCode(value as "Text" | "Code")}
            defaultValue={
              (options?.isCode ?? defaultSetVariableOptions.isCode)
                ? "Code"
                : "Text"
            }
          >
            <Label className="hover:bg-gray-2/50 rounded-md p-2 border flex-1 flex justify-center">
              <Radio value="Text" className="hidden" />
              Text
            </Label>
            <Label className="hover:bg-gray-2/50 rounded-md p-2 border flex-1 flex justify-center">
              <Radio value="Code" className="hidden" />
              Code
            </Label>
          </RadioGroup>
          {options?.isCode ? (
            <div className="flex flex-col gap-2">
              <DebouncedTextInput
                placeholder="Code description"
                defaultValue={options?.expressionDescription}
                onValueChange={updateExpressionDescription}
              />
              <CodeEditor
                defaultValue={options?.expressionToEvaluate ?? ""}
                onChange={updateExpression}
                lang="javascript"
                withLineNumbers={true}
              />
              <Field.Root className="flex-row items-center">
                <Switch
                  checked={
                    options?.isExecutedOnClient ??
                    defaultSetVariableOptions.isExecutedOnClient
                  }
                  onCheckedChange={updateClientExecution}
                />
                <Field.Label>
                  Execute on client{" "}
                  <MoreInfoTooltip>
                    Check this if you need access to client-only variables like
                    `window` or `document`.
                  </MoreInfoTooltip>
                </Field.Label>
              </Field.Root>
              {options?.isUnsafe === true &&
                options?.isExecutedOnClient === true &&
                options.isCode && (
                  <UnsafeScriptAlert onTrustClick={updateIsUnsafe} />
                )}
              <Field.Root>
                <Field.Label>Save error</Field.Label>
                <VariablesCombobox
                  initialVariableId={options.saveErrorInVariableId}
                  onSelectVariable={updateSaveErrorInVariableId}
                />
              </Field.Root>
            </div>
          ) : (
            <DebouncedTextareaWithVariablesButton
              defaultValue={options?.expressionToEvaluate ?? ""}
              onValueChange={updateExpression}
            />
          )}
        </div>
      );
    case "Pop":
    case "Shift":
      return (
        <VariablesCombobox
          initialVariableId={options.saveItemInVariableId}
          onSelectVariable={updateListVariableId}
          placeholder={
            options.type === "Shift" ? "Shifted item" : "Popped item"
          }
        />
      );
    case "Map item with same index": {
      return (
        <div className="flex flex-col gap-2 p-2 rounded-md border">
          <VariablesCombobox
            initialVariableId={options.mapListItemParams?.baseItemVariableId}
            onSelectVariable={updateItemVariableId}
            placeholder="Base item"
          />
          <VariablesCombobox
            initialVariableId={options.mapListItemParams?.baseListVariableId}
            onSelectVariable={updateBaseListVariableId}
            placeholder="Base list"
          />
          <VariablesCombobox
            initialVariableId={options.mapListItemParams?.targetListVariableId}
            onSelectVariable={updateTargetListVariableId}
            placeholder="Target list"
          />
        </div>
      );
    }
    case "Append value(s)": {
      return (
        <DebouncedTextareaWithVariablesButton
          defaultValue={options.item}
          onValueChange={updateItem}
        />
      );
    }
    case "Moment of the day": {
      return (
        <Alert.Root>
          <InformationSquareIcon />
          <Alert.Description>
            Will return either <Badge>morning</Badge>, <Badge>afternoon</Badge>,
            <Badge>evening</Badge> or <Badge>night</Badge> based on the current
            user time.
          </Alert.Description>
        </Alert.Root>
      );
    }

    case "Environment name": {
      return (
        <Alert.Root>
          <InformationSquareIcon />
          <Alert.Description>
            Will return either <Badge>web</Badge> or <Badge>whatsapp</Badge>.
          </Alert.Description>
        </Alert.Root>
      );
    }
    case "Device type": {
      return (
        <Alert.Root>
          <InformationSquareIcon />
          <Alert.Description>
            Will return either <Badge>desktop</Badge>, <Badge>tablet</Badge> or{" "}
            <Badge>mobile</Badge>.
          </Alert.Description>
        </Alert.Root>
      );
    }
    case "Now":
    case "Yesterday":
    case "Tomorrow": {
      return (
        <BasicSelect
          items={timeZones}
          onChange={(timeZone) => onOptionsChange({ ...options, timeZone })}
          placeholder="Select time zone"
          value={options?.timeZone}
        />
      );
    }
    case "Contact name":
    case "Phone number":
    case "Random ID":
    case "User ID":
    case "Today":
    case "Result ID":
    case "Empty":
    case "Transcript":
    case "Referral Click ID":
    case "Referral Source ID":
      return null;
  }
};
