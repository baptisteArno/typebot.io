import type { TypebotId } from "@typebot.io/domain/shared-primitives";
import type { UserId } from "@typebot.io/user/schemas";
import { Context, type Effect } from "effect";

export class CampaignsAuthorization extends Context.Tag(
  "@typebot.io/CampaignsAuthorization",
)<
  CampaignsAuthorization,
  {
    readonly canReadCampaign: (
      typebotId: TypebotId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canWriteCampaign: (
      typebotId: TypebotId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
  }
>() {}
