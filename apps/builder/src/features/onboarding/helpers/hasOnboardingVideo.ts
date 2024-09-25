import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { isDefined } from "@typebot.io/lib/utils";
import { onboardingVideos } from "../data";

type Props = {
  blockType: Block["type"];
  blockDef?: ForgedBlockDefinition;
};
export const hasOnboardingVideo = ({ blockType, blockDef }: Props) =>
  isDefined(
    blockDef?.onboarding?.youtubeId ?? onboardingVideos[blockType]?.youtubeId,
  );
