import { CopyIcon, TrashIcon } from "@/components/icons";
import { MenuItem, MenuList } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";

export const GroupNodeContextMenu = () => {
  const { t } = useTranslate();

  const handleDeleteClick = () =>
    dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));

  const handleDuplicateClick = () => {
    dispatchEvent(new KeyboardEvent("keydown", { key: "c", metaKey: true }));
  };

  return (
    <MenuList>
      <MenuItem icon={<CopyIcon />} onClick={handleDuplicateClick}>
        {t("copy")}
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        {t("delete")}
      </MenuItem>
    </MenuList>
  );
};
