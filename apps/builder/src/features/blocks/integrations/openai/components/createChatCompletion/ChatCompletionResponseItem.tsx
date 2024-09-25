import { DropdownList } from "@/components/DropdownList";
import type { TableListItemProps } from "@/components/TableList";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { Stack } from "@chakra-ui/react";
import {
  chatCompletionResponseValues,
  defaultOpenAIResponseMappingItem,
} from "@typebot.io/blocks-integrations/openai/constants";
import type { ChatCompletionOpenAIOptions } from "@typebot.io/blocks-integrations/openai/schema";
import type { Variable } from "@typebot.io/variables/schemas";

type Props = TableListItemProps<
  NonNullable<ChatCompletionOpenAIOptions["responseMapping"]>[number]
>;

export const ChatCompletionResponseItem = ({ item, onItemChange }: Props) => {
  const changeValueToExtract = (
    valueToExtract: (typeof chatCompletionResponseValues)[number],
  ) => {
    onItemChange({ ...item, valueToExtract });
  };

  const changeVariableId = (variable: Pick<Variable, "id"> | undefined) => {
    onItemChange({ ...item, variableId: variable ? variable.id : undefined });
  };

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <DropdownList
        currentItem={
          item.valueToExtract ?? defaultOpenAIResponseMappingItem.valueToExtract
        }
        items={chatCompletionResponseValues}
        onItemSelect={changeValueToExtract}
      />
      <VariableSearchInput
        onSelectVariable={changeVariableId}
        initialVariableId={item.variableId}
      />
    </Stack>
  );
};
