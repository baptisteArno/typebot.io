import { CopyIcon } from "@/components/icons";
import { isMac } from "@/helpers/isMac";
import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";

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
        <CopyIcon />
        Duplicate
      </ContextMenu.Item>
      <ContextMenu.Item onClick={handleDeleteClick} className="text-red-10">
        <TrashIcon />
        Delete
      </ContextMenu.Item>
    </ContextMenu.Popup>
  );
};
