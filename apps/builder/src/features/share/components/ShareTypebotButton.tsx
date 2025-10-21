import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { UsersIcon } from "@typebot.io/ui/icons/UsersIcon";
import { SharePopoverContent } from "./SharePopoverContent";

export const ShareTypebotButton = ({ isLoading }: { isLoading: boolean }) => {
  const controls = useOpenControls();
  const { t } = useTranslate();

  return (
    <Popover.Root {...controls}>
      <Popover.Trigger>
        <Button
          disabled={isLoading}
          aria-label={t("share.button.popover.ariaLabel")}
          variant="secondary"
          size="sm"
        >
          <UsersIcon />
          <span className="hidden xl:inline">{t("share.button.label")}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Popup className="w-[430px]" side="bottom" align="end">
        <SharePopoverContent />
      </Popover.Popup>
    </Popover.Root>
  );
};
