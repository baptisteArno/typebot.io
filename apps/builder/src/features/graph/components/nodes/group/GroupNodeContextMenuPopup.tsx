import { CopyIcon } from "@/components/icons";
import { isMac } from "@/helpers/isMac";
import { useTranslate } from "@tolgee/react";
import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";

export const GroupNodeContextMenuPopup = () => {
  const { t } = useTranslate();

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
        {t("copy")}
      </ContextMenu.Item>
      <ContextMenu.Item onClick={handleDeleteClick} className="text-red-10">
        <TrashIcon />
        {t("delete")}
      </ContextMenu.Item>
    </ContextMenu.Popup>
  );
};
