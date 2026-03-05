import type { TypebotId } from "@typebot.io/domain-primitives/schemas";
import { TypebotAuthorization } from "@typebot.io/typebot/core/TypebotAuthorization";
import type { UserId } from "@typebot.io/user/schemas";
import { Effect, Layer } from "effect";
import { CampaignsAuthorization } from "../application/CampaignsAuthorization";

export const PrismaCampaignsAuthorization = Layer.effect(
  CampaignsAuthorization,
  Effect.gen(function* () {
    const typebotAuthorization = yield* TypebotAuthorization;

    const canReadCampaign = Effect.fn(
      "PrismaCampaignsAuthorization.canReadCampaign",
    )(function* (typebotId: TypebotId, userId: UserId) {
      return yield* typebotAuthorization.canReadTypebot(typebotId, userId);
    });

    const canWriteCampaign = Effect.fn(
      "PrismaCampaignsAuthorization.canWriteCampaign",
    )(function* (typebotId: TypebotId, userId: UserId) {
      return yield* typebotAuthorization.canWriteTypebot(typebotId, userId);
    });

    return CampaignsAuthorization.of({
      canReadCampaign,
      canWriteCampaign,
    });
  }),
);
