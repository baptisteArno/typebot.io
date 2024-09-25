import { TextInput, Textarea } from "@/components/inputs";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { RadioButtons } from "@/components/inputs/RadioButtons";
import { Select } from "@/components/inputs/Select";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { WhatsAppLogo } from "@/components/logos/WhatsAppLogo";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  Alert,
  AlertIcon,
  FormLabel,
  Stack,
  Tag,
  Text,
} from "@chakra-ui/react";
import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import {
  defaultSetVariableOptions,
  hiddenTypes,
  sessionOnlySetVariableOptions,
  valueTypes,
} from "@typebot.io/blocks-logic/setVariable/constants";
import type { SetVariableBlock } from "@typebot.io/blocks-logic/setVariable/schema";
import { isDefined } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";

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
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="variable-search">
          Search or create variable:
        </FormLabel>
        <VariableSearchInput
          onSelectVariable={updateVariableId}
          initialVariableId={options?.variableId}
          id="variable-search"
        />
      </Stack>

      <Stack spacing="4">
        <Stack>
          <Text mb="0" fontWeight="medium">
            Value:
          </Text>
          <Select
            selectedItem={options?.type ?? defaultSetVariableOptions.type}
            items={setVarTypes.map((type) => ({
              label: type,
              value: type,
              icon:
                type === "Contact name" || type === "Phone number" ? (
                  <WhatsAppLogo />
                ) : undefined,
            }))}
            onSelect={updateValueType}
          />
        </Stack>

        {selectedVariable && !isSessionOnly && !isLinkedToAnswer && (
          <SwitchWithLabel
            key={selectedVariable.id}
            label="Save in results?"
            moreInfoContent="By default, the variable is saved only for the user chat session. Check this option if you want to also store the variable in the typebot Results table."
            initialValue={!selectedVariable.isSessionVariable}
            onCheckChange={updateIsSessionVariable}
          />
        )}
        <SetVariableValue options={options} onOptionsChange={onOptionsChange} />
      </Stack>
    </Stack>
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
      isCode: radio === "Code",
    });
  };

  switch (options?.type) {
    case "Custom":
    case undefined:
      return (
        <>
          <SwitchWithLabel
            label="Execute on client?"
            moreInfoContent="Check this if you need access to client-only variables like `window` or `document`."
            initialValue={
              options?.isExecutedOnClient ??
              defaultSetVariableOptions.isExecutedOnClient
            }
            onCheckChange={updateClientExecution}
          />
          <Stack>
            <RadioButtons
              size="sm"
              options={["Text", "Code"]}
              defaultValue={
                (options?.isCode ?? defaultSetVariableOptions.isCode)
                  ? "Code"
                  : "Text"
              }
              onSelect={updateIsCode}
            />
            {options?.isCode ? (
              <CodeEditor
                defaultValue={options?.expressionToEvaluate ?? ""}
                onChange={updateExpression}
                lang="javascript"
              />
            ) : (
              <Textarea
                defaultValue={options?.expressionToEvaluate ?? ""}
                onChange={updateExpression}
                width="full"
              />
            )}
          </Stack>
        </>
      );
    case "Pop":
    case "Shift":
      return (
        <VariableSearchInput
          initialVariableId={options.saveItemInVariableId}
          onSelectVariable={updateListVariableId}
          placeholder={
            options.type === "Shift" ? "Shifted item" : "Popped item"
          }
        />
      );
    case "Map item with same index": {
      return (
        <Stack p="2" rounded="md" borderWidth={1}>
          <VariableSearchInput
            initialVariableId={options.mapListItemParams?.baseItemVariableId}
            onSelectVariable={updateItemVariableId}
            placeholder="Base item"
          />
          <VariableSearchInput
            initialVariableId={options.mapListItemParams?.baseListVariableId}
            onSelectVariable={updateBaseListVariableId}
            placeholder="Base list"
          />
          <VariableSearchInput
            initialVariableId={options.mapListItemParams?.targetListVariableId}
            onSelectVariable={updateTargetListVariableId}
            placeholder="Target list"
          />
        </Stack>
      );
    }
    case "Append value(s)": {
      return <Textarea defaultValue={options.item} onChange={updateItem} />;
    }
    case "Moment of the day": {
      return (
        <Alert fontSize="sm">
          <AlertIcon />
          <Text>
            Will return either <Tag size="sm">morning</Tag>,{" "}
            <Tag size="sm">afternoon</Tag>,<Tag size="sm">evening</Tag> or{" "}
            <Tag size="sm">night</Tag> based on the current user time.
          </Text>
        </Alert>
      );
    }
    case "Environment name": {
      return (
        <Alert fontSize="sm">
          <AlertIcon />
          <Text>
            Will return either <Tag size="sm">web</Tag> or{" "}
            <Tag size="sm">whatsapp</Tag>.
          </Text>
        </Alert>
      );
    }
    case "Now":
    case "Yesterday":
    case "Tomorrow": {
      return (
        <TextInput
          direction="row"
          label="Timezone"
          onChange={(timeZone) => onOptionsChange({ ...options, timeZone })}
          defaultValue={options.timeZone}
          placeholder="Europe/Paris"
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
      return null;
  }
};
