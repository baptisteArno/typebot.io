import { ButtonLink } from "@/components/ButtonLink";
import {
  BuoyIcon,
  ExpandIcon,
  MinimizeIcon,
  VideoPopoverIcon,
} from "@/components/icons";
import { getHelpDocUrl } from "@/features/graph/helpers/getHelpDocUrl";
import { HStack, useColorModeValue } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { BlockWithOptions } from "@typebot.io/blocks-core/schemas/schema";
import type { TEventWithOptions } from "@typebot.io/events/schemas";
import type { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { Button } from "@typebot.io/ui/components/Button";
import { cn } from "@typebot.io/ui/lib/cn";

type Props = {
  nodeType: BlockWithOptions["type"] | TEventWithOptions["type"];
  blockDef?: (typeof forgedBlocks)[keyof typeof forgedBlocks];
  isVideoOnboardingItemDisplayed: boolean;
  isExpanded: boolean;
  onExpandClick: () => void;
  onVideoOnboardingClick: () => void;
};

export const SettingsHoverBar = ({
  nodeType,
  blockDef,
  isVideoOnboardingItemDisplayed,
  isExpanded,
  onExpandClick,
  onVideoOnboardingClick,
}: Props) => {
  const { t } = useTranslate();
  const helpDocUrl = getHelpDocUrl(nodeType, blockDef);
  return (
    <HStack
      rounded="md"
      spacing={0}
      borderWidth="1px"
      bgColor={useColorModeValue("white", "gray.900")}
      shadow="md"
    >
      <Button
        className="size-8 [&_svg]:size-4 border-r border-l-0 rounded-r-none"
        aria-label={"Duplicate group"}
        onClick={onExpandClick}
        size="icon"
        variant="ghost"
      >
        {isExpanded ? <MinimizeIcon /> : <ExpandIcon />}
      </Button>
      {helpDocUrl && (
        <ButtonLink
          className={cn(
            "rounded-l-none",
            isVideoOnboardingItemDisplayed && "rounded-r-none",
          )}
          size="sm"
          variant="ghost"
          href={helpDocUrl}
          target="_blank"
        >
          <BuoyIcon />
          {t("help")}
        </ButtonLink>
      )}
      {isVideoOnboardingItemDisplayed && (
        <Button
          aria-label={"Open Bubbles help video"}
          variant="ghost"
          onClick={onVideoOnboardingClick}
          className="rounded-l-none size-8 [&_svg]:size-4"
          size="icon"
        >
          <VideoPopoverIcon />
        </Button>
      )}
    </HStack>
  );
};
