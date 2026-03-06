import type {
  CampaignId,
  TypebotId,
} from "@typebot.io/shared-primitives/domain";
import { Context, type Effect } from "effect";
import type { Campaign } from "../domain/Campaign";
import type { CampaignsNotFoundError } from "../domain/errors";
import type { CampaignUpdateInput } from "./CampaignUpdateInput";
import type { WhatsAppCampaignInput } from "./WhatsAppCampaignInput";

export class CampaignsRepo extends Context.Tag("@typebot.io/CampaignsRepo")<
  CampaignsRepo,
  {
    readonly listByTypebotId: (
      typebotId: TypebotId,
      pagination: { limit: number; cursor?: string },
    ) => Effect.Effect<{
      campaigns: readonly Campaign[];
      nextCursor: string | undefined;
    }>;
    readonly create: (
      typebotId: TypebotId,
      input: WhatsAppCampaignInput,
    ) => Effect.Effect<Campaign>;
    readonly getById: (
      typebotId: TypebotId,
      campaignId: CampaignId,
    ) => Effect.Effect<Campaign, CampaignsNotFoundError>;
    readonly update: (
      typebotId: TypebotId,
      campaignId: CampaignId,
      input: CampaignUpdateInput,
    ) => Effect.Effect<Campaign, CampaignsNotFoundError>;
    readonly delete: (
      typebotId: TypebotId,
      campaignId: CampaignId,
    ) => Effect.Effect<void, CampaignsNotFoundError>;
  }
>() {}
