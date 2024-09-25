import { UsersIcon } from "@/components/icons";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  chakra,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import React from "react";
import { SharePopoverContent } from "./SharePopoverContent";

export const ShareTypebotButton = ({ isLoading }: { isLoading: boolean }) => {
  const { t } = useTranslate();

  return (
    <Popover isLazy placement="bottom-end">
      <PopoverTrigger>
        <Button
          isLoading={isLoading}
          leftIcon={<UsersIcon />}
          aria-label={t("share.button.popover.ariaLabel")}
          size="sm"
          iconSpacing={{ base: 0, xl: 2 }}
        >
          <chakra.span display={{ base: "none", xl: "inline" }}>
            {t("share.button.label")}
          </chakra.span>
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          shadow="lg"
          width="430px"
          rootProps={{ style: { transform: "scale(0)" } }}
        >
          <SharePopoverContent />
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
