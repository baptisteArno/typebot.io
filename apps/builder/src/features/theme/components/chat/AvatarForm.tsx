import { ImageUploadContent } from "@/components/ImageUploadContent";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  Box,
  Flex,
  HStack,
  Heading,
  Image,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Portal,
  Stack,
  Switch,
  useDisclosure,
} from "@chakra-ui/react";
import type { AvatarProps } from "@typebot.io/theme/schemas";
import React from "react";
import { DefaultAvatar } from "../DefaultAvatar";

type Props = {
  uploadFileProps: FilePathUploadProps;
  title: string;
  avatarProps?: AvatarProps;
  isDefaultCheck?: boolean;
  onAvatarChange: (avatarProps: AvatarProps) => void;
};

export const AvatarForm = ({
  uploadFileProps,
  title,
  avatarProps,
  isDefaultCheck = false,
  onAvatarChange,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isChecked = avatarProps ? avatarProps.isEnabled : isDefaultCheck;
  const handleOnCheck = () =>
    onAvatarChange({ ...avatarProps, isEnabled: !isChecked });
  const handleImageUrl = (url: string) =>
    onAvatarChange({ isEnabled: isChecked, url });
  const popoverContainerRef = React.useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: popoverContainerRef,
    handler: onClose,
    isEnabled: isOpen,
  });

  const isDefaultAvatar = !avatarProps?.url || avatarProps.url.includes("{{");
  return (
    <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
      <Flex justifyContent="space-between">
        <HStack>
          <Heading as="label" fontSize="lg" htmlFor={title} mb="1">
            {title}
          </Heading>
          <Switch isChecked={isChecked} id={title} onChange={handleOnCheck} />
        </HStack>
        {isChecked && (
          <Flex ref={popoverContainerRef}>
            <Popover isLazy isOpen={isOpen}>
              <PopoverAnchor>
                {isDefaultAvatar ? (
                  <Box onClick={onOpen}>
                    <DefaultAvatar
                      cursor="pointer"
                      _hover={{ filter: "brightness(.9)" }}
                    />
                  </Box>
                ) : (
                  <Image
                    onClick={onOpen}
                    src={avatarProps.url}
                    alt="Website image"
                    cursor="pointer"
                    _hover={{ filter: "brightness(.9)" }}
                    transition="filter 200ms"
                    rounded="full"
                    boxSize="40px"
                    objectFit="cover"
                  />
                )}
              </PopoverAnchor>
              <Portal>
                <PopoverContent
                  p="4"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  w="500px"
                >
                  <ImageUploadContent
                    uploadFileProps={uploadFileProps}
                    defaultUrl={avatarProps?.url}
                    imageSize="thumb"
                    onSubmit={handleImageUrl}
                  />
                </PopoverContent>
              </Portal>
            </Popover>
          </Flex>
        )}
      </Flex>
    </Stack>
  );
};
