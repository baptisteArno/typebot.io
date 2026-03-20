import { useTranslate } from "@tolgee/react";
import { EmojiOrImageIcon } from "@typebot.io/ui/components/EmojiOrImageIcon";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { cx } from "@typebot.io/ui/lib/cva";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import { ImageUploadContent } from "./ImageUploadContent";

type Props = {
  uploadFileProps: FilePathUploadProps;
  icon?: string | null;
  onChangeIcon: (icon: string) => void;
  size?: "sm" | "md" | "lg";
  defaultIcon: React.ReactNode;
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
                size === "lg" && "size-10",
                size === "md" && "size-9",
                size === "sm" && "size-8",
              )}
            >
              <EmojiOrImageIcon
                icon={icon}
                className={cx(
                  size === "lg" && "size-9 text-[2.25rem]",
                  size === "md" && "size-6.25 text-2xl",
                  size === "sm" && "size-4.5 text-xl",
                )}
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
