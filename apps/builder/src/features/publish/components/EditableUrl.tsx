import { CopyButton } from "@/components/CopyButton";
import {
  Editable,
  EditableInput,
  EditablePreview,
  HStack,
  Text,
  useEditableControls,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { EditIcon } from "@typebot.io/ui/icons/EditIcon";
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
        <CopyButton textToCopy={`${hostname}/${value ?? ""}`} />
      </HStack>
    </Editable>
  );
};

const EditButton = (props: ButtonProps) => {
  const { t } = useTranslate();
  const { isEditing, getEditButtonProps } = useEditableControls();

  return isEditing ? null : (
    <Button {...props} {...getEditButtonProps()} variant="secondary">
      <EditIcon />
      {t("edit")}
    </Button>
  );
};
