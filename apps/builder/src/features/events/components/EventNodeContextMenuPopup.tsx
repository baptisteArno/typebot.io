import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import { Copy01Icon } from "@typebot.io/ui/icons/Copy01Icon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { isMac } from "@/helpers/isMac";

export const EventNodeContextMenuPopup = () => {
  const handleDeleteClick = () =>
    dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));

  const handleDuplicateClick = () =>
    dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "c",
        [isMac() ? "metaKey" : "ctrlKey"]: true,
      }),
    );

  return (
    <ContextMenu.Popup>
      <ContextMenu.Item onClick={handleDuplicateClick}>
        <Copy01Icon />
        Duplicate
      </ContextMenu.Item>
      <ContextMenu.Item onClick={handleDeleteClick} className="text-red-10">
        <TrashIcon />
        Delete
      </ContextMenu.Item>
    </ContextMenu.Popup>
  );
};
