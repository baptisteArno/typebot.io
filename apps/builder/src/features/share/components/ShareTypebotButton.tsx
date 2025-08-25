import { UsersIcon } from "@/components/icons";
import { useOpenControls } from "@/hooks/useOpenControls";
import { chakra } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import React from "react";
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
          <UsersIcon fontSize="md" />
          <chakra.span display={{ base: "none", xl: "inline" }}>
            {t("share.button.label")}
          </chakra.span>
        </Button>
      </Popover.Trigger>
      <Popover.Popup className="w-[430px]" side="bottom" align="end">
        <SharePopoverContent />
      </Popover.Popup>
    </Popover.Root>
  );
};
