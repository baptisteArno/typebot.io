import { cardMappableFields } from "@typebot.io/blocks-inputs/cards/constants";
import type { CardsBlock } from "@typebot.io/blocks-inputs/cards/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { TableList, type TableListItemProps } from "@/components/TableList";

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
    <div className="flex flex-col gap-2">
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
    </div>
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
    valueToExtract: (typeof cardMappableFields)[number] | undefined,
  ) => {
    onItemChange({ ...item, field: valueToExtract });
  };

  const changeVariableId = (variable: Pick<Variable, "id"> | undefined) => {
    onItemChange({ ...item, variableId: variable ? variable.id : undefined });
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-md flex-1 border">
      <BasicSelect
        placeholder="Select a field"
        value={item.field}
        items={cardMappableFields}
        onChange={changeValueToExtract}
      />
      <VariablesCombobox
        initialVariableId={item.variableId}
        onSelectVariable={changeVariableId}
      />
    </div>
  );
};
