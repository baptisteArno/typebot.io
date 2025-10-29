import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import {
  BackgroundType,
  defaultBackgroundColor,
  defaultButtonsBackgroundColor,
  defaultGuestAvatarIsEnabled,
  defaultGuestBubblesBackgroundColor,
  defaultHostAvatarIsEnabled,
  defaultHostBubblesBackgroundColor,
} from "@typebot.io/theme/constants";
import type { Theme, ThemeTemplate } from "@typebot.io/theme/schemas";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { Menu } from "@typebot.io/ui/components/Menu";
import { Edit03Icon } from "@typebot.io/ui/icons/Edit03Icon";
import { MoreHorizontalIcon } from "@typebot.io/ui/icons/MoreHorizontalIcon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import { useState } from "react";
import { queryClient, trpc } from "@/lib/queryClient";
import { DefaultAvatar } from "./DefaultAvatar";

export const ThemeTemplateCard = ({
  workspaceId,
  themeTemplate,
  isSelected,
  typebotVersion,
  onClick,
  onRenameClick,
  onDeleteSuccess,
}: {
  workspaceId: string;
  typebotVersion: TypebotV6["version"];
  themeTemplate: Pick<ThemeTemplate, "name" | "theme" | "id">;
  isSelected: boolean;
  onRenameClick?: () => void;
  onClick: () => void;
  onDeleteSuccess?: () => void;
}) => {
  const { t } = useTranslate();
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate } = useMutation(
    trpc.theme.deleteThemeTemplate.mutationOptions({
      onMutate: () => setIsDeleting(true),
      onSettled: () => setIsDeleting(false),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.theme.listThemeTemplates.queryKey(),
        });
        if (onDeleteSuccess) onDeleteSuccess();
      },
    }),
  );

  const deleteThemeTemplate = () => {
    mutate({ themeTemplateId: themeTemplate.id, workspaceId });
  };

  const hostAvatar = {
    isEnabled:
      themeTemplate.theme.chat?.hostAvatar?.isEnabled ??
      defaultHostAvatarIsEnabled,
    url: themeTemplate.theme.chat?.hostAvatar?.url,
  };

  const hostBubbleBgColor =
    themeTemplate.theme.chat?.hostBubbles?.backgroundColor ??
    defaultHostBubblesBackgroundColor[typebotVersion];

  const guestAvatar = {
    isEnabled:
      themeTemplate.theme.chat?.guestAvatar?.isEnabled ??
      defaultGuestAvatarIsEnabled,
    url: themeTemplate.theme.chat?.guestAvatar?.url,
  };

  const guestBubbleBgColor =
    themeTemplate.theme.chat?.guestBubbles?.backgroundColor ??
    defaultGuestBubblesBackgroundColor[typebotVersion];

  const buttonBgColor =
    themeTemplate.theme.chat?.buttons?.backgroundColor ??
    defaultButtonsBackgroundColor[typebotVersion];

  return (
    <div
      style={
        {
          "--tw-shadow": isSelected
            ? `rgb(var(--orange-8)) 0 0 0 2px`
            : `rgba(0, 0, 0, 0.08) 0px 2px 2px`,
          "--rounded":
            themeTemplate.theme.chat?.roundness === "large"
              ? "md"
              : themeTemplate.theme.chat?.roundness === "none"
                ? "none"
                : "sm",
        } as React.CSSProperties
      }
      className={cx(
        "flex flex-col gap-0 rounded-md border cursor-pointer shadow-md transition-shadow",
        isDeleting ? "opacity-50 pointer-events-none" : "opacity-100",
      )}
      onClick={onClick}
    >
      <div
        style={{ ...parseBackground(themeTemplate.theme.general?.background) }}
        className="rounded-t-md bg-cover"
      >
        <div className="flex mt-4 ml-4 gap-0.5 items-end">
          <AvatarPreview avatar={hostAvatar} />
          <div
            style={{ backgroundColor: hostBubbleBgColor }}
            className="rounded-sm w-[80px] h-[16px]"
          />
        </div>

        <div className="flex gap-2 mt-1 mr-4 ml-auto justify-end items-end">
          <div
            className="rounded-sm w-[80px] h-[16px]"
            style={{ backgroundColor: guestBubbleBgColor }}
          />
          <AvatarPreview avatar={guestAvatar} />
        </div>

        <div className="flex mt-1 ml-4 gap-0.5 items-end">
          <AvatarPreview avatar={hostAvatar} />
          <div
            className="rounded-sm w-[80px] h-[16px]"
            style={{ backgroundColor: hostBubbleBgColor }}
          />
        </div>
        <div className="flex mt-1 mb-4 pr-4 ml-auto w-full justify-end gap-1">
          <div
            className="w-[20px] h-[10px] rounded-(--rounded)"
            style={{ backgroundColor: buttonBgColor }}
          />
          <div
            className="w-[20px] h-[10px] rounded-(--rounded)"
            style={{ backgroundColor: buttonBgColor }}
          />
          <div
            className="w-[20px] h-[10px] rounded-(--rounded)"
            style={{ backgroundColor: buttonBgColor }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 p-2 justify-between">
        <p className="text-sm truncate">{themeTemplate.name}</p>
        {onDeleteSuccess && onRenameClick && (
          <Menu.Root>
            <Menu.TriggerButton
              aria-label={t(
                "theme.sideMenu.template.myTemplates.menu.ariaLabel",
              )}
              variant="outline-secondary"
              size="icon"
              className="size-7"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontalIcon />
            </Menu.TriggerButton>
            <Menu.Popup align="end">
              {isSelected && (
                <Menu.Item onClick={onRenameClick}>
                  <Edit03Icon />
                  {t("rename")}
                </Menu.Item>
              )}
              <Menu.Item className="text-red-10" onClick={deleteThemeTemplate}>
                <TrashIcon />
                {t("delete")}
              </Menu.Item>
            </Menu.Popup>
          </Menu.Root>
        )}
      </div>
    </div>
  );
};

const parseBackground = (
  background: NonNullable<Theme["general"]>["background"],
) => {
  switch (background?.type) {
    case undefined:
    case BackgroundType.COLOR:
      return {
        backgroundColor: background?.content ?? defaultBackgroundColor["6.1"],
      };
    case BackgroundType.IMAGE:
      return { backgroundImage: `url(${background.content})` };
    case BackgroundType.NONE:
      return;
  }
};

const AvatarPreview = ({
  avatar,
}: {
  avatar: NonNullable<Theme["chat"]>["hostAvatar"];
}) => {
  const { t } = useTranslate();
  if (!avatar?.isEnabled) return null;
  return avatar?.url ? (
    <img
      className="size-3 rounded-full"
      src={avatar.url}
      alt={t("theme.sideMenu.template.gallery.avatarPreview.alt")}
    />
  ) : (
    <DefaultAvatar className="size-3" />
  );
};
