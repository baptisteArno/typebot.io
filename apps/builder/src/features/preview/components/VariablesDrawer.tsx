import { createId } from "@paralleldrive/cuid2";
import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { sessionOnlySetVariableOptions } from "@typebot.io/blocks-logic/setVariable/constants";
import type { SetVariableBlock } from "@typebot.io/blocks-logic/setVariable/schema";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { Cancel01Icon } from "@typebot.io/ui/icons/Cancel01Icon";
import { MoreHorizontalIcon } from "@typebot.io/ui/icons/MoreHorizontalIcon";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import type { Variable } from "@typebot.io/variables/schemas";
import { useDrag } from "@use-gesture/react";
import { type FormEvent, useState } from "react";
import { SingleLineEditable } from "@/components/SingleLineEditable";
import { toast } from "@/lib/toast";
import { headerHeight } from "../../editor/constants";
import { useTypebot } from "../../editor/providers/TypebotProvider";
import { ResizeHandle } from "./ResizeHandle";

type Props = {
  onClose: () => void;
};

export const VariablesDrawer = ({ onClose }: Props) => {
  const { typebot, createVariable, updateVariable, deleteVariable } =
    useTypebot();
  const [width, setWidth] = useState(500);
  const [isResizeHandleVisible, setIsResizeHandleVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const filteredVariables = typebot?.variables.filter((v) =>
    isNotEmpty(searchValue)
      ? v.name.toLowerCase().includes(searchValue.toLowerCase())
      : true,
  );

  const useResizeHandleDrag = useDrag(
    (state) => {
      setWidth(-state.offset[0]);
    },
    {
      from: () => [-width, 0],
    },
  );

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast({ description: "Variable created", type: "success" });
    setSearchValue("");
    createVariable({
      id: createId(),
      isSessionVariable: true,
      name: searchValue,
    });
  };

  const setVariableAndInputBlocks =
    typebot?.groups.flatMap(
      (g) =>
        g.blocks.filter(
          (b) => b.type === LogicBlockType.SET_VARIABLE || isInputBlock(b),
        ) as (InputBlock | SetVariableBlock)[],
    ) ?? [];

  return (
    <div
      className="flex absolute border-l shadow-md p-6 right-0 top-0 h-full bg-gray-1 rounded-l-lg"
      onMouseOver={() => setIsResizeHandleVisible(true)}
      onFocus={() => setIsResizeHandleVisible(true)}
      onBlur={() => setIsResizeHandleVisible(false)}
      onMouseLeave={() => setIsResizeHandleVisible(false)}
      style={{ width: `${width}px` }}
    >
      {isResizeHandleVisible && (
        <ResizeHandle
          {...useResizeHandleDrag()}
          className="animate-in fade-in-0 absolute left-[-7.5px]"
          style={{ top: `calc(50% - ${headerHeight}px)` }}
        />
      )}
      <div className="flex flex-col w-full gap-4">
        <Button
          className="absolute right-2 top-2"
          onClick={onClose}
          variant="secondary"
          size="icon"
        >
          <Cancel01Icon />
        </Button>
        <h2 className="text-md font-medium">Variables</h2>
        <form className="flex items-center gap-2" onSubmit={handleCreateSubmit}>
          <Input
            placeholder="Search or create..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          {filteredVariables &&
            searchValue.length > 0 &&
            !filteredVariables.some((v) => v.name === searchValue) && (
              <Button
                aria-label="Create"
                type="submit"
                size="icon"
                className="animate-in fade-in-0"
              >
                <PlusSignIcon />
              </Button>
            )}
        </form>

        <div className="flex flex-col gap-2 overflow-y-auto py-1">
          {filteredVariables?.map((variable) => (
            <VariableItem
              key={variable.id}
              variable={variable}
              onChange={(changes) => updateVariable(variable.id, changes)}
              onDelete={() => deleteVariable(variable.id)}
              setVariableAndInputBlocks={setVariableAndInputBlocks}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const VariableItem = ({
  variable,
  onChange,
  onDelete,
  setVariableAndInputBlocks,
}: {
  variable: Variable;
  onChange: (variable: Partial<Variable>) => void;
  onDelete: () => void;
  setVariableAndInputBlocks: (InputBlock | SetVariableBlock)[];
}) => {
  const settingsPopoverControls = useOpenControls();
  const isSessionOnly = setVariableAndInputBlocks.some(
    (b) =>
      b.type === LogicBlockType.SET_VARIABLE &&
      sessionOnlySetVariableOptions.includes(
        b.options?.type as (typeof sessionOnlySetVariableOptions)[number],
      ) &&
      b.options?.variableId === variable.id,
  );

  const isLinkedToAnswer = setVariableAndInputBlocks.some(
    (b) => isInputBlock(b) && b.options?.variableId === variable.id,
  );

  return (
    <div className="flex items-center gap-2 justify-between pl-1">
      <SingleLineEditable
        defaultValue={variable.name}
        onValueCommit={(name) => onChange({ name })}
      />
      <div className="flex items-center gap-2">
        {!isSessionOnly && !isLinkedToAnswer && (
          <Popover.Root {...settingsPopoverControls}>
            <Popover.TriggerButton
              aria-label={"Settings"}
              size="icon"
              variant="secondary"
              className="size-7"
            >
              <MoreHorizontalIcon />
            </Popover.TriggerButton>
            <Popover.Popup>
              <Field.Root className="flex-row items-center">
                <Switch
                  checked={!variable.isSessionVariable}
                  onCheckedChange={() =>
                    onChange({
                      ...variable,
                      isSessionVariable: !variable.isSessionVariable,
                    })
                  }
                />
                <Field.Label>
                  Save in results{" "}
                  <MoreInfoTooltip>
                    Check this option if you want to save the variable value in
                    the typebot Results table.
                  </MoreInfoTooltip>
                </Field.Label>
              </Field.Root>
            </Popover.Popup>
          </Popover.Root>
        )}
        <Button
          aria-label="Delete"
          size="icon"
          variant="secondary"
          onClick={onDelete}
          className="size-7"
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
};
