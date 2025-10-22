import { createId } from "@typebot.io/lib/createId";
import { byId } from "@typebot.io/lib/utils";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { Combobox } from "@typebot.io/ui/components/Combobox";
import type { InputProps } from "@typebot.io/ui/components/Input";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";
import { Settings01Icon } from "@typebot.io/ui/icons/Settings01Icon";
import type { Variable } from "@typebot.io/variables/schemas";
import { useState } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useRightPanel } from "@/hooks/useRightPanel";

type Props = {
  onSelectVariable: (variable: Variable | undefined) => void;
  initialVariableId: string | undefined;
  size?: InputProps["size"];
  className?: string;
  placeholder?: string;
  defaultOpen?: boolean;
};

export const VariablesCombobox = ({
  onSelectVariable,
  initialVariableId,
  className,
  size,
  placeholder = "Select a variable",
  defaultOpen,
}: Props) => {
  const [, setRightPanel] = useRightPanel();
  const { typebot, createVariable } = useTypebot();
  const selectedVariable =
    typebot?.variables.find(byId(initialVariableId)) ?? null;
  const [query, setQuery] = useState(selectedVariable?.name ?? "");

  const variableItems = typebot?.variables ?? [];
  const exactExists = typebot?.variables.some(
    (variable) => variable.name.trim() === query.trim(),
  );
  const items: VariableItem[] =
    query.trim() !== "" && !exactExists
      ? [
          ...variableItems,
          {
            isCreating: true,
            name: query,
            id: `create:${query.trim().toLowerCase()}`,
          },
        ]
      : variableItems;

  const selectItem = (item: VariableItem | null) => {
    if (!item) {
      onSelectVariable(undefined);
      return;
    }
    if (!item.isCreating) {
      onSelectVariable(item);
      return;
    }
    const id = `v${createId()}`;
    createVariable({
      id,
      name: item.name,
      isSessionVariable: true,
    });
    onSelectVariable({ id, name: item.name });
  };

  return (
    <Combobox.Root
      items={items}
      onValueChange={selectItem}
      value={selectedVariable}
      inputValue={query}
      onInputValueChange={setQuery}
      autoHighlight
      defaultOpen={defaultOpen}
      itemToStringLabel={(item: VariableItem) => item.name}
    >
      <div className="relative flex-1">
        <Combobox.Input
          className={className}
          size={size}
          placeholder={placeholder}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-1/2 -translate-y-1/2 right-1 size-7"
          onClick={() => setRightPanel("variables")}
        >
          <Settings01Icon className="opacity-50" />
        </Button>
      </div>
      <Combobox.Popup>
        <Combobox.List>
          {(item: VariableItem) => (
            <Combobox.Item key={item.id} value={item}>
              {item.isCreating ? (
                <div className="flex items-center gap-2">
                  <PlusSignIcon className="size-3" />
                  Create{" "}
                  <Badge colorScheme="purple" variant="solid">
                    {item.name}
                  </Badge>
                </div>
              ) : (
                <Badge colorScheme="purple" variant="solid">
                  {item.name}
                </Badge>
              )}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Root>
  );
};

type VariableItem = Pick<Variable, "id" | "name"> & {
  isCreating?: boolean;
};
