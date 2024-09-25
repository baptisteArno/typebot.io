import {
  Editable,
  EditableInput,
  EditablePreview,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import React, { useState } from "react";

type EditableProps = {
  defaultName: string;
  onNewName: (newName: string) => void;
};
export const EditableTypebotName = ({
  defaultName,
  onNewName,
}: EditableProps) => {
  const { t } = useTranslate();
  const emptyNameBg = useColorModeValue("gray.100", "gray.700");
  const [currentName, setCurrentName] = useState(defaultName);

  const submitNewName = (newName: string) => {
    if (newName === "") return setCurrentName(defaultName);
    if (newName === defaultName) return;
    onNewName(newName);
  };

  return (
    <Tooltip label={t("rename")}>
      <Editable
        value={currentName}
        onChange={setCurrentName}
        onSubmit={submitNewName}
      >
        <EditablePreview
          noOfLines={2}
          cursor="pointer"
          maxW="150px"
          overflow="hidden"
          fontSize="14px"
          minW="30px"
          minH="20px"
          bgColor={currentName === "" ? emptyNameBg : "inherit"}
        />
        <EditableInput fontSize="14px" />
      </Editable>
    </Tooltip>
  );
};
