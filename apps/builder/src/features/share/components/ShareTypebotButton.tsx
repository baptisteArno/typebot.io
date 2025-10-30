import { useTranslate } from "@tolgee/react";
import { Popover } from "@typebot.io/ui/components/Popover";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { UsersIcon } from "@typebot.io/ui/icons/UsersIcon";
import { SharePopoverContent } from "./SharePopoverContent";

export const ShareTypebotButton = ({ isLoading }: { isLoading: boolean }) => {
  const controls = useOpenControls();
  const { t } = useTranslate();

  return (
    <Popover.Root {...controls}>
      <Popover.TriggerButton
        disabled={isLoading}
        aria-label={t("share.button.popover.ariaLabel")}
        variant="secondary"
        size="sm"
      >
        <UsersIcon />
        <span className="hidden xl:inline">{t("share.button.label")}</span>
      </Popover.TriggerButton>
      <Popover.Popup className="w-[430px]" side="bottom" align="end">
        <SharePopoverContent />
      </Popover.Popup>
    </Popover.Root>
  );
};
