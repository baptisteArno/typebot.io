import { Box, chakra, Flex, Stack } from "@chakra-ui/react";
import { isSvgSrc } from "@typebot.io/lib/utils";
import type { AvatarProps } from "@typebot.io/theme/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import React from "react";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
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
        <Field.Root className="flex-row items-center">
          <Field.Label className="font-medium font-heading text-lg">
            {title}
          </Field.Label>
          <Switch
            checked={isChecked}
            id={title}
            onCheckedChange={handleOnCheck}
          />
        </Field.Root>
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
                  <img
                    src={avatarProps.url}
                    alt="Website image"
                    className="cursor-pointer transition-filter duration-200 rounded-md hover:brightness-90 size-10"
                  />
                ) : avatarProps?.url?.startsWith("http") ? (
                  <img
                    src={avatarProps.url}
                    alt="Website image"
                    className="cursor-pointer transition-filter duration-200 rounded-md hover:brightness-90 size-10 object-cover"
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
