import { CopyIcon, TrashIcon } from "@/components/icons";
import { MenuItem, MenuList } from "@chakra-ui/react";

export const EventNodeContextMenu = () => {
  const handleDeleteClick = () =>
    dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));

  const handleDuplicateClick = () => {
    dispatchEvent(new KeyboardEvent("keydown", { key: "c", metaKey: true }));
  };
  return (
    <MenuList>
      <MenuItem icon={<CopyIcon />} onClick={handleDuplicateClick}>
        Duplicate
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Delete
      </MenuItem>
    </MenuList>
  );
};
