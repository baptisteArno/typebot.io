import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import type { TEventWithOptions } from "@typebot.io/events/schemas";

type Feature =
  | "editor"
  | "groupTitlesAutoGeneration"
  | Block["type"]
  | TEventWithOptions["type"];

export const onboardingVideos: Partial<
  Record<
    Feature,
    | {
        key: string;
        youtubeId: string;
        deployedAt?: Date;
      }
    | undefined
  >
> = {
  editor: {
    key: "editor",
    youtubeId: "jp3ggg_42-M",
    deployedAt: new Date("2024-06-04"),
  },
  groupTitlesAutoGeneration: {
    key: "groupTitlesAutoGeneration",
    youtubeId: "Lt7UliKv0xQ",
  },
  [IntegrationBlockType.ZAPIER]: {
    key: IntegrationBlockType.ZAPIER,
    youtubeId: "2ZskGItI_Zo",
    deployedAt: new Date("2024-06-04"),
  },
  [IntegrationBlockType.MAKE_COM]: {
    key: IntegrationBlockType.MAKE_COM,
    youtubeId: "V-y1Orys_kY",
    deployedAt: new Date("2024-06-04"),
  },
};
