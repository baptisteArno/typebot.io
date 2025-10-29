import {
  chatCompletionResponseValues,
  defaultOpenAIResponseMappingItem,
} from "@typebot.io/blocks-integrations/openai/constants";
import type { ChatCompletionOpenAIOptions } from "@typebot.io/blocks-integrations/openai/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import type { TableListItemProps } from "@/components/TableList";

type Props = TableListItemProps<
  NonNullable<ChatCompletionOpenAIOptions["responseMapping"]>[number]
>;

export const ChatCompletionResponseItem = ({ item, onItemChange }: Props) => {
  const changeValueToExtract = (
    valueToExtract: (typeof chatCompletionResponseValues)[number] | undefined,
  ) => {
    if (!valueToExtract) return;
    onItemChange({ ...item, valueToExtract });
  };

  const changeVariableId = (variable: Pick<Variable, "id"> | undefined) => {
    onItemChange({ ...item, variableId: variable ? variable.id : undefined });
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-md flex-1 border">
      <BasicSelect
        value={item.valueToExtract}
        defaultValue={defaultOpenAIResponseMappingItem.valueToExtract}
        items={chatCompletionResponseValues}
        onChange={changeValueToExtract}
      />
      <VariablesCombobox
        onSelectVariable={changeVariableId}
        initialVariableId={item.variableId}
      />
    </div>
  );
};
