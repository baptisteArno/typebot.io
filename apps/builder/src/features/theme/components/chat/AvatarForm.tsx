import { ImageUploadContent } from "@/components/ImageUploadContent";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import { useOpenControls } from "@/hooks/useOpenControls";
import {
  Box,
  Flex,
  HStack,
  Heading,
  Image,
  Stack,
  Switch,
  chakra,
} from "@chakra-ui/react";
import { isSvgSrc } from "@typebot.io/lib/utils";
import type { AvatarProps } from "@typebot.io/theme/schemas";
import { Popover } from "@typebot.io/ui/components/Popover";
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
  const controls = useOpenControls();
  const isChecked = avatarProps ? avatarProps.isEnabled : isDefaultCheck;
  const handleOnCheck = () =>
    onAvatarChange({ ...avatarProps, isEnabled: !isChecked });
  const handleImageUrl = (url: string) =>
    onAvatarChange({ isEnabled: isChecked, url });
  const popoverContainerRef = React.useRef<HTMLDivElement>(null);

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
            <Popover.Root {...controls}>
              <Popover.Trigger>
                {isDefaultAvatar ? (
                  <Box>
                    <DefaultAvatar
                      cursor="pointer"
                      _hover={{ filter: "brightness(.9)" }}
                    />
                  </Box>
                ) : isSvgSrc(avatarProps?.url) ? (
                  <Image
                    src={avatarProps.url}
                    alt="Website image"
                    cursor="pointer"
                    _hover={{ filter: "brightness(.9)" }}
                    transition="filter 200ms"
                    boxSize="40px"
                  />
                ) : avatarProps?.url?.startsWith("http") ? (
                  <Image
                    src={avatarProps.url}
                    alt="Website image"
                    cursor="pointer"
                    _hover={{ filter: "brightness(.9)" }}
                    transition="filter 200ms"
                    rounded="full"
                    boxSize="40px"
                    objectFit="cover"
                  />
                ) : (
                  <chakra.span
                    fontSize="40px"
                    lineHeight="1"
                    cursor="pointer"
                    _hover={{ filter: "brightness(.9)" }}
                    transition="filter 200ms"
                  >
                    {avatarProps?.url}
                  </chakra.span>
                )}
              </Popover.Trigger>
              <Popover.Popup className="w-[500px]">
                <ImageUploadContent
                  uploadFileProps={uploadFileProps}
                  defaultUrl={avatarProps?.url}
                  imageSize="thumb"
                  onSubmit={handleImageUrl}
                  additionalTabs={{
                    emoji: true,
                    giphy: true,
                    unsplash: true,
                    icon: true,
                  }}
                />
              </Popover.Popup>
            </Popover.Root>
          </Flex>
        )}
      </Flex>
    </Stack>
  );
};
