import { SetVariableLabel } from "@/components/SetVariableLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Stack, Tag, Text, chakra } from "@chakra-ui/react";
import type { SetVariableBlock } from "@typebot.io/blocks-logic/setVariable/schema";
import { byId } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";

export const SetVariableContent = ({ block }: { block: SetVariableBlock }) => {
  const { typebot } = useTypebot();
  const variableName =
    typebot?.variables.find(byId(block.options?.variableId))?.name ?? "";
  return (
    <Text color={"gray.500"} noOfLines={4}>
      {variableName === "" ? (
        "Click to edit..."
      ) : (
        <Expression
          options={block.options}
          variables={typebot?.variables ?? []}
        />
      )}
    </Text>
  );
};

const Expression = ({
  options,
  variables,
}: {
  options: SetVariableBlock["options"];
  variables: Variable[];
}): JSX.Element | null => {
  const variableName = variables.find(byId(options?.variableId))?.name ?? "";
  switch (options?.type) {
    case "Custom":
    case undefined:
      return (
        <Stack maxH="60vh">
          <Text as="span">
            <CustomExpression
              variableName={variableName}
              expressionDescription={options?.expressionDescription}
              isCode={options?.isCode ?? false}
              expression={options?.expressionToEvaluate}
            />
          </Text>
          {options?.saveErrorInVariableId && (
            <SetVariableLabel
              variables={variables}
              variableId={options?.saveErrorInVariableId}
            />
          )}
        </Stack>
      );
    case "Map item with same index": {
      const baseItemVariable = variables.find(
        byId(options.mapListItemParams?.baseItemVariableId),
      );
      const baseListVariable = variables.find(
        byId(options.mapListItemParams?.baseListVariableId),
      );
      const targetListVariable = variables.find(
        byId(options.mapListItemParams?.targetListVariableId),
      );
      return (
        <Text as="span">
          {variableName} = item in ${targetListVariable?.name} with same index
          as ${baseItemVariable?.name} in ${baseListVariable?.name}
        </Text>
      );
    }
    case "Append value(s)": {
      return (
        <Text as="span">
          Append {options.item} in {variableName}
        </Text>
      );
    }
    case "Empty":
      return <Text as="span">Reset {variableName} </Text>;
    case "Shift":
    case "Pop": {
      const itemVariableName = variables.find(
        byId(options.saveItemInVariableId),
      )?.name;
      return (
        <Text as="span">
          {options.type} {variableName}
          {itemVariableName ? ` into ${itemVariableName}` : ""}
        </Text>
      );
    }
    case "Random ID":
    case "Today":
    case "Now":
    case "Tomorrow":
    case "User ID":
    case "Result ID":
    case "Moment of the day":
    case "Environment name":
    case "Device type":
    case "Transcript":
    case "Yesterday": {
      return (
        <Text as="span">
          {variableName} = <Tag colorScheme="purple">System.{options.type}</Tag>
        </Text>
      );
    }
    case "Contact name":
    case "Phone number":
    case "Referral Click ID":
    case "Referral Source ID":
      return (
        <Text as="span">
          {variableName} ={" "}
          <Tag colorScheme="purple">WhatsApp.{options.type}</Tag>
        </Text>
      );
  }
};

const CustomExpression = ({
  expressionDescription,
  isCode,
  expression,
  variableName,
}: {
  expressionDescription?: string;
  isCode: boolean;
  expression?: string;
  variableName: string;
}) => {
  if (!expression) return null;
  if (expressionDescription)
    return (
      <Text as="span">
        {variableName} = <Tag colorScheme="gray">{expressionDescription}</Tag>
      </Text>
    );
  if (isCode)
    return (
      <Stack spacing={1}>
        <Text>{variableName} =</Text>
        <chakra.pre bgColor="gray.100" rounded="md" p="2" noOfLines={6}>
          {expression}
        </chakra.pre>
      </Stack>
    );
  return (
    <Text as="span" noOfLines={5}>
      {variableName} = {expression}
    </Text>
  );
};
