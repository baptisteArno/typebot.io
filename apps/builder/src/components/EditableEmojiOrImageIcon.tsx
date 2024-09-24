import { useParentModal } from "@/features/graph/providers/ParentModalProvider";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import {
  Flex,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Tooltip,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { RefObject } from "react";
import React from "react";
import { EmojiOrImageIcon } from "./EmojiOrImageIcon";
import { ImageUploadContent } from "./ImageUploadContent";

type Props = {
  uploadFileProps: FilePathUploadProps;
  icon?: string | null;
  parentModalRef?: RefObject<HTMLElement | null> | undefined;
  onChangeIcon: (icon: string) => void;
  boxSize?: string;
};

export const EditableEmojiOrImageIcon = ({
  uploadFileProps,
  icon,
  onChangeIcon,
  boxSize,
}: Props) => {
  const { t } = useTranslate();
  const { ref: parentModalRef } = useParentModal();
  const bg = useColorModeValue("gray.100", "gray.700");

  return (
    <Popover isLazy>
      {({ onClose }: { onClose: () => void }) => (
        <>
          <Tooltip label={t("editor.header.tooltip.changeIcon.label")}>
            <Flex
              cursor="pointer"
              p="2"
              rounded="md"
              _hover={{
                bg,
              }}
              transition="background-color 0.2s"
              data-testid="editable-icon"
            >
              <PopoverTrigger>
                <chakra.span>
                  <EmojiOrImageIcon
                    icon={icon}
                    emojiFontSize="2xl"
                    boxSize={boxSize}
                  />
                </chakra.span>
              </PopoverTrigger>
            </Flex>
          </Tooltip>
          <Portal containerRef={parentModalRef}>
            <PopoverContent p="2">
              <ImageUploadContent
                uploadFileProps={uploadFileProps}
                defaultUrl={icon ?? ""}
                onSubmit={onChangeIcon}
                excludedTabs={["giphy", "unsplash"]}
                onClose={onClose}
                initialTab="icon"
                linkWithVariableButton={false}
              />
            </PopoverContent>
          </Portal>
        </>
      )}
    </Popover>
  );
};
