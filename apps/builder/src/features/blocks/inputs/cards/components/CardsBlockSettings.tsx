import { DropdownList } from "@/components/DropdownList";
import { TableList, type TableListItemProps } from "@/components/TableList";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormLabel, Stack } from "@chakra-ui/react";
import { cardMappableFields } from "@typebot.io/blocks-inputs/cards/constants";
import type { CardsBlock } from "@typebot.io/blocks-inputs/cards/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React from "react";

type Props = {
  options?: CardsBlock["options"];
  onOptionsChange: (options: CardsBlock["options"]) => void;
};

export const CardsBlockSettings = ({ options, onOptionsChange }: Props) => {
  const updateSaveResponseMapping = (
    saveResponseMapping: NonNullable<
      CardsBlock["options"]
    >["saveResponseMapping"],
  ) => {
    onOptionsChange({
      ...options,
      saveResponseMapping,
    });
  };

  return (
    <Stack>
      <TableList
        addLabel={
          (options?.saveResponseMapping?.length ?? 0) === 0
            ? "Save in variable"
            : undefined
        }
        initialItems={options?.saveResponseMapping}
        onItemsChange={updateSaveResponseMapping}
      >
        {(props) => <CardSaveResponseItem {...props} />}
      </TableList>
    </Stack>
  );
};

const CardSaveResponseItem = ({
  item,
  onItemChange,
}: TableListItemProps<{
  variableId?: string | undefined;
  field?: (typeof cardMappableFields)[number] | undefined;
}>) => {
  const changeValueToExtract = (
    valueToExtract: (typeof cardMappableFields)[number],
  ) => {
    onItemChange({ ...item, field: valueToExtract });
  };

  const changeVariableId = (variable: Pick<Variable, "id"> | undefined) => {
    onItemChange({ ...item, variableId: variable ? variable.id : undefined });
  };

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <DropdownList
        currentItem={item.field}
        items={cardMappableFields}
        onItemSelect={changeValueToExtract}
      />
      <VariableSearchInput
        initialVariableId={item.variableId}
        onSelectVariable={changeVariableId}
      />
    </Stack>
  );
};
