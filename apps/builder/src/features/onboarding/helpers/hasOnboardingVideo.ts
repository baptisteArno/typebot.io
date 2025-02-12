import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { TEventWithOptions } from "@typebot.io/events/schemas";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { isDefined } from "@typebot.io/lib/utils";
import { onboardingVideos } from "../data";

type Props = {
  nodeType: Block["type"] | TEventWithOptions["type"];
  blockDef?: ForgedBlockDefinition;
};
export const hasOnboardingVideo = ({ nodeType, blockDef }: Props) =>
  isDefined(
    blockDef?.onboarding?.youtubeId ?? onboardingVideos[nodeType]?.youtubeId,
  );
