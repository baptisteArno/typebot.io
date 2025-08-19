import { CopyButton } from "@/components/CopyButton";
import { EditIcon } from "@/components/icons";
import {
  Button,
  type ButtonProps,
  Editable,
  EditableInput,
  EditablePreview,
  HStack,
  Text,
  useEditableControls,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import React, { useState } from "react";

type EditableUrlProps = {
  hostname: string;
  pathname?: string;
  isValid: (newPathname: string) => Promise<boolean> | boolean;
  onPathnameChange: (pathname: string) => void;
};

export const EditableUrl = ({
  hostname,
  pathname,
  isValid,
  onPathnameChange,
}: EditableUrlProps) => {
  const { t } = useTranslate();
  const [value, setValue] = useState(pathname);

  const handleSubmit = async (newPathname: string) => {
    if (newPathname === pathname) return;
    if (await isValid(newPathname)) return onPathnameChange(newPathname);
    setValue(pathname);
  };

  return (
    <Editable
      as={HStack}
      spacing={3}
      value={value}
      onChange={setValue}
      onSubmit={handleSubmit}
    >
      <HStack spacing={1}>
        <Text flexShrink={0}>{hostname}/</Text>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <EditablePreview
                mx={1}
                borderWidth="1px"
                px={3}
                rounded="md"
                cursor="text"
                display="flex"
                fontWeight="medium"
              />
            }
          />
          <Tooltip.Popup>{t("edit")}</Tooltip.Popup>
        </Tooltip.Root>

        <EditableInput px={2} />
      </HStack>

      <HStack>
        <EditButton size="xs" />
        <CopyButton size="xs" textToCopy={`${hostname}/${value ?? ""}`} />
      </HStack>
    </Editable>
  );
};

const EditButton = (props: ButtonProps) => {
  const { t } = useTranslate();
  const { isEditing, getEditButtonProps } = useEditableControls();

  return isEditing ? null : (
    <Button leftIcon={<EditIcon />} {...props} {...getEditButtonProps()}>
      {t("edit")}
    </Button>
  );
};
