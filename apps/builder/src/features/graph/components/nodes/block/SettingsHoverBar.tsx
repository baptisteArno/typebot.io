import { HStack, useColorModeValue } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { BlockWithOptions } from "@typebot.io/blocks-core/schemas/schema";
import type { TEventWithOptions } from "@typebot.io/events/schemas";
import type { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { Button } from "@typebot.io/ui/components/Button";
import { ArrowExpand01Icon } from "@typebot.io/ui/icons/ArrowExpand01Icon";
import { ArrowShrink02Icon } from "@typebot.io/ui/icons/ArrowShrink02Icon";
import { CustomerSupportIcon } from "@typebot.io/ui/icons/CustomerSupportIcon";
import { VideoAiIcon } from "@typebot.io/ui/icons/VideoAiIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { ButtonLink } from "@/components/ButtonLink";
import { getHelpDocUrl } from "@/features/graph/helpers/getHelpDocUrl";

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
        className="size-6 border-r border-l-0 rounded-r-none [&_svg]:size-3"
        aria-label={"Duplicate group"}
        onClick={onExpandClick}
        size="icon"
        variant="ghost"
      >
        {isExpanded ? <ArrowShrink02Icon /> : <ArrowExpand01Icon />}
      </Button>
      {helpDocUrl && (
        <ButtonLink
          className={cn(
            "rounded-l-none h-6",
            isVideoOnboardingItemDisplayed && "rounded-r-none",
          )}
          size="xs"
          variant="ghost"
          href={helpDocUrl}
          target="_blank"
          iconStyle="none"
        >
          <CustomerSupportIcon />
          {t("help")}
        </ButtonLink>
      )}
      {isVideoOnboardingItemDisplayed && (
        <Button
          aria-label={"Open Bubbles help video"}
          variant="ghost"
          onClick={onVideoOnboardingClick}
          className="rounded-l-none size-6 [&_svg]:size-3"
          size="icon"
        >
          <VideoAiIcon />
        </Button>
      )}
    </HStack>
  );
};
