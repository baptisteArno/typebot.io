import type { TableListItemProps } from "@/components/TableList";
import { AutocompleteInput } from "@/components/inputs/AutocompleteInput";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormControl, FormLabel, Stack } from "@chakra-ui/react";
import type { ResponseVariableMapping } from "@typebot.io/blocks-integrations/webhook/schema";
import type { Variable } from "@typebot.io/variables/schemas";

export const DataVariableInputs = ({
  item,
  onItemChange,
  dataItems,
}: TableListItemProps<ResponseVariableMapping> & { dataItems: string[] }) => {
  const handleBodyPathChange = (bodyPath: string) =>
    onItemChange({ ...item, bodyPath });
  const handleVariableChange = (variable?: Variable) =>
    onItemChange({ ...item, variableId: variable?.id });

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <FormControl>
        <FormLabel htmlFor="name">Data:</FormLabel>
        <AutocompleteInput
          items={dataItems}
          defaultValue={item.bodyPath}
          onChange={handleBodyPathChange}
          placeholder="Select the data"
          withVariableButton
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="value">Set variable:</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange}
          placeholder="Search for a variable"
          initialVariableId={item.variableId}
        />
      </FormControl>
    </Stack>
  );
};
