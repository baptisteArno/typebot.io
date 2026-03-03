import { expect, it } from "@effect/vitest";
import { PgContainerPrismaLayer } from "@typebot.io/config/tests/PgContainer";
import {
  proTypebotId,
  userId,
} from "@typebot.io/config/tests/seedDatabaseForTest";
import { type CampaignId, Name } from "@typebot.io/domain-primitives/schemas";
import { PrismaTypebotAuthorization } from "@typebot.io/typebot/infrastructure/PrismaTypebotAuthorization";
import { Effect, Layer } from "effect";
import { describe } from "vitest";
import { Campaigns } from "../core/Campaigns";
import { PrismaCampaignsAuthorization } from "../infrastructure/PrismaCampaignsAuthorization";
import { PrismaCampaignsRepository } from "../infrastructure/PrismaCampaignsRepository";
import { handleCreateCampaign } from "./handleCreateCampaign";
import { handleDeleteCampaign } from "./handleDeleteCampaign";
import { handleGetCampaign } from "./handleGetCampaign";
import { handleListCampaigns } from "./handleListCampaigns";
import { handleUpdateCampaign } from "./handleUpdateCampaign";

const CampaignsInfrastructureLayer = Layer.mergeAll(
  PrismaCampaignsAuthorization,
  PrismaCampaignsRepository,
).pipe(
  Layer.provideMerge(PrismaTypebotAuthorization),
  Layer.provideMerge(PgContainerPrismaLayer),
);

export const CampaignsLiveLayer = Layer.provide(
  Campaigns.layer,
  CampaignsInfrastructureLayer,
);

let campaignId: CampaignId;

describe.skip("skipped suite", () => {
  it.layer(CampaignsLiveLayer, { timeout: "30 seconds" })(
    "CampaignsLayer",
    (it) => {
      it.effect(
        "should create campaign with valid data",
        Effect.fn(function* () {
          const campaign = yield* handleCreateCampaign({
            input: {
              typebotId: proTypebotId,
              channel: "WHATSAPP",
              name: Name.make("Test Campaign"),
            },
            context: {
              user: {
                id: userId,
              },
            },
          });
          campaignId = campaign.id;
          expect(campaign).toBeDefined();
          expect(campaign.name).toBe("Test Campaign");
          expect(campaign.channel).toBe("WHATSAPP");
          expect(campaign.status).toBe("DRAFT");
        }),
      );

      it.effect(
        "gets campaign",
        Effect.fn(function* () {
          const campaign = yield* handleGetCampaign({
            input: {
              typebotId: proTypebotId,
              campaignId,
            },
            context: {
              user: {
                id: userId,
              },
            },
          });
          expect(campaign).toBeDefined();
          expect(campaign.id).toBe(campaignId);
          expect(campaign.name).toBe("Test Campaign");
        }),
      );

      it.effect(
        "lists campaigns",
        Effect.fn(function* () {
          const { campaigns } = yield* handleListCampaigns({
            input: {
              typebotId: proTypebotId,
            },
            context: {
              user: {
                id: userId,
              },
            },
          });
          expect(campaigns.length).toBeGreaterThanOrEqual(1);
          expect(campaigns.some((c) => c.id === campaignId)).toBe(true);
        }),
      );

      it.effect(
        "updates campaign",
        Effect.fn(function* () {
          const campaign = yield* handleUpdateCampaign({
            input: {
              typebotId: proTypebotId,
              campaignId,
              status: "SCHEDULED",
            },
            context: {
              user: {
                id: userId,
              },
            },
          });
          expect(campaign.status).toBe("SCHEDULED");
        }),
      );

      it.effect(
        "deletes campaign",
        Effect.fn(function* () {
          yield* handleDeleteCampaign({
            input: {
              typebotId: proTypebotId,
              campaignId,
            },
            context: {
              user: {
                id: userId,
              },
            },
          });
        }),
      );
    },
  );
});
