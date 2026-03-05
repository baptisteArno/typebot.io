import type {
  CampaignId,
  TypebotId,
} from "@typebot.io/domain-primitives/schemas";
import { Context, type Effect } from "effect";
import type {
  Campaign,
  CampaignUpdateInput,
  WhatsAppCampaignInput,
} from "../core/Campaign";
import type { NotFoundError } from "../core/CampaignsErrors";

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
    ) => Effect.Effect<Campaign, NotFoundError>;
    readonly update: (
      typebotId: TypebotId,
      campaignId: CampaignId,
      input: CampaignUpdateInput,
    ) => Effect.Effect<Campaign, NotFoundError>;
    readonly delete: (
      typebotId: TypebotId,
      campaignId: CampaignId,
    ) => Effect.Effect<void, NotFoundError>;
  }
>() {}
