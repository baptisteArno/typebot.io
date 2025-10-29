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
    <div className="flex flex-col border rounded-md p-4 gap-4">
      <div className="flex justify-between">
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
          <div className="flex" ref={popoverContainerRef}>
            <Popover.Root {...controls}>
              <Popover.Trigger>
                {isDefaultAvatar ? (
                  <div>
                    <DefaultAvatar
                      cursor="pointer"
                      className="hover:brightness-90"
                    />
                  </div>
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
                  <span className="text-4xl leading-none cursor-pointer transition-filter hover:brightness-90">
                    {avatarProps?.url}
                  </span>
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
          </div>
        )}
      </div>
    </div>
  );
};
