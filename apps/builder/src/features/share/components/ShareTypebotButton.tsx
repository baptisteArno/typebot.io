import { UsersIcon } from "@/components/icons";
import { useOpenControls } from "@/hooks/useOpenControls";
import { Button, chakra } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
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
          isLoading={isLoading}
          leftIcon={<UsersIcon fontSize="md" />}
          aria-label={t("share.button.popover.ariaLabel")}
          size="sm"
          iconSpacing={{ base: 0, xl: 2 }}
        >
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
