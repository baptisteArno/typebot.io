import { useTranslate } from "@tolgee/react";
import type {
  Item,
  ItemIndices,
} from "@typebot.io/blocks-core/schemas/items/schema";
import type { ButtonItem } from "@typebot.io/blocks-inputs/choice/schema";
import { convertStrToList } from "@typebot.io/lib/convertStrToList";
import { isEmpty } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Settings01Icon } from "@typebot.io/ui/icons/Settings01Icon";
import { cx } from "@typebot.io/ui/lib/cva";
import { useState } from "react";
import { SingleLineEditable } from "@/components/SingleLineEditable";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { ButtonsItemSettings } from "./ButtonsItemSettings";

type Props = {
  item: ButtonItem;
  indices: ItemIndices;
  isMouseOver: boolean;
};

export const ButtonsItemNode = ({ item, indices, isMouseOver }: Props) => {
  const { t } = useTranslate();
  const { deleteItem, updateItem, createItem } = useTypebot();
  const { openedNodeId, setOpenedNodeId } = useGraph();
  const [itemValue, setItemValue] = useState(
    item.content ??
      (indices.itemIndex === 0
        ? t("blocks.inputs.button.clickToEdit.label")
        : ""),
  );

  const handleInputSubmit = () => {
    if (itemValue === "") deleteItem(indices);
    else
      updateItem(indices, {
        content: itemValue === "" ? undefined : itemValue,
      } as Item);
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === "Escape" &&
      (itemValue === t("blocks.inputs.button.clickToEdit.label") ||
        itemValue === "")
    )
      deleteItem(indices);
    if (
      e.key === "Enter" &&
      itemValue !== "" &&
      itemValue !== t("blocks.inputs.button.clickToEdit.label")
    )
      appendButton();
  };

  const handleEditableChange = (val: string) => {
    if (
      itemValue !== "" &&
      itemValue !== t("blocks.inputs.button.clickToEdit.label")
    )
      return setItemValue(val);
    const values = convertStrToList(val);
    if (values.length === 1) {
      setItemValue(values[0]);
    } else {
      setItemValue(values[0]);
      values.slice(1).forEach((v, i) => {
        createItem(
          { content: v },
          { ...indices, itemIndex: indices.itemIndex + i + 1 },
        );
      });
    }
  };

  const appendButton = () => {
    const itemIndex = indices.itemIndex + 1;
    createItem({}, { ...indices, itemIndex });
  };

  const updateItemSettings = (settings: Omit<ButtonItem, "content">) => {
    updateItem(indices, { ...item, ...settings });
  };

  return (
    <Popover.Root
      isOpen={openedNodeId === item.id}
      onClose={() => {
        setOpenedNodeId(undefined);
      }}
    >
      <Popover.Trigger
        render={(props) => (
          <div className="flex px-4 py-2 justify-center w-full" {...props}>
            <SingleLineEditable
              defaultEdit={
                isEmpty(item.content) ||
                item.content === t("blocks.inputs.button.clickToEdit.label")
              }
              value={itemValue}
              input={{
                onValueChange: handleEditableChange,
                onKeyDownCapture: handleKeyPress,
                onMouseDownCapture: (e) => e.stopPropagation(),
                onWheelCapture: (e) => e.stopPropagation(),
              }}
              className="max-w-[180px] w-full"
              onValueCommit={handleInputSubmit}
              preview={{
                className: cx(
                  "hover:bg-transparent",
                  item.content !== t("blocks.inputs.button.clickToEdit.label")
                    ? "inherit"
                    : "text-gray-9",
                ),
              }}
            />
            {isMouseOver && (
              <div className="flex rounded-md bg-gray-1 absolute -right-1 -top-1 z-10 animate-in fade-in-0">
                <Button
                  aria-label={t("blocks.inputs.button.openSettings.ariaLabel")}
                  variant="ghost"
                  size="icon"
                  className="shadow-md"
                  onClick={() => setOpenedNodeId(item.id)}
                >
                  <Settings01Icon />
                </Button>
              </div>
            )}
          </div>
        )}
      />
      <Popover.Popup side="right" className="p-4">
        <ButtonsItemSettings
          item={item}
          onSettingsChange={updateItemSettings}
        />
      </Popover.Popup>
    </Popover.Root>
  );
};
