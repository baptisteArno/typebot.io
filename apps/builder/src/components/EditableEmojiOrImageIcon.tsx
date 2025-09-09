import type { IconProps } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { cx } from "@typebot.io/ui/lib/cva";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import { useOpenControls } from "@/hooks/useOpenControls";
import { EmojiOrImageIcon } from "./EmojiOrImageIcon";
import { ImageUploadContent } from "./ImageUploadContent";

type Props = {
  uploadFileProps: FilePathUploadProps;
  icon?: string | null;
  onChangeIcon: (icon: string) => void;
  size?: "sm" | "md" | "lg";
  defaultIcon: (props: IconProps) => JSX.Element;
};

export const EditableEmojiOrImageIcon = ({
  uploadFileProps,
  icon,
  onChangeIcon,
  size = "md",
  defaultIcon,
}: Props) => {
  const { t } = useTranslate();
  const controls = useOpenControls();

  return (
    <Popover.Root {...controls}>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Popover.TriggerButton
              size="icon"
              variant="ghost"
              className={cx(
                size === "lg" && "size-10 [&_svg]:size-8",
                size === "md" && "size-9 [&_svg]:size-6",
                size === "sm" && "size-8 [&_svg]:size-5",
              )}
            >
              <EmojiOrImageIcon
                icon={icon}
                size={size}
                defaultIcon={defaultIcon}
              />
            </Popover.TriggerButton>
          }
        />
        <Tooltip.Popup>
          {t("editor.header.tooltip.changeIcon.label")}
        </Tooltip.Popup>
      </Tooltip.Root>
      <Popover.Popup className="max-w-sm">
        <ImageUploadContent
          uploadFileProps={uploadFileProps}
          defaultUrl={icon ?? ""}
          onSubmit={onChangeIcon}
          additionalTabs={{
            emoji: true,
            icon: true,
          }}
          onClose={controls.onClose}
          initialTab="link"
          linkWithVariableButton={false}
        />
      </Popover.Popup>
    </Popover.Root>
  );
};
