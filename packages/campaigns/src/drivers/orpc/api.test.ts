import { expect, it } from "@effect/vitest";
import { PgContainerPrismaLayer } from "@typebot.io/config/tests/PgContainer";
import {
  proTypebotId,
  userId,
} from "@typebot.io/config/tests/seedDatabaseForTest";
import type { CampaignId } from "@typebot.io/shared-primitives/domain";
import { PrismaTypebotRepository } from "@typebot.io/typebot/infrastructure/PrismaTypebotRepository";
import { Effect, Layer, Schema } from "effect";
import { describe } from "vitest";
import { CampaignsUsecases } from "../../application/CampaignsUsecases";
import { WhatsAppCampaignInputSchema } from "../../application/WhatsAppCampaignInput";
import { CampaignName } from "../../domain/Campaign";
import { PrismaCampaignsRepository } from "../../infrastructure/PrismaCampaignsRepository";
import { handleCreateCampaign } from "./handleCreateCampaign";
import { handleDeleteCampaign } from "./handleDeleteCampaign";
import { handleGetCampaign } from "./handleGetCampaign";
import { handleListCampaigns } from "./handleListCampaigns";
import { handleUpdateCampaign } from "./handleUpdateCampaign";

const CampaignsInfrastructureLayer = Layer.mergeAll(
  PrismaCampaignsRepository,
  PrismaTypebotRepository,
).pipe(Layer.provideMerge(PgContainerPrismaLayer));

const CampaignsLiveLayer = Layer.provide(
  CampaignsUsecases.layer,
  CampaignsInfrastructureLayer,
);

let campaignId: CampaignId;

describe.skip("skipped suite", () => {
  it.layer(CampaignsLiveLayer, { timeout: "30 seconds" })(
    "CampaignsLayer",
    (it) => {
      it.effect("should create campaign with valid data", () =>
        Effect.gen(function* () {
          const campaign = yield* handleCreateCampaign({
            input: {
              typebotId: proTypebotId,
              channel: "WHATSAPP",
              name: Schema.decodeSync(CampaignName)("Test Campaign"),
              templateId: Schema.decodeSync(
                WhatsAppCampaignInputSchema.fields.templateId,
              )("template-id"),
              credentialsId: Schema.decodeSync(
                WhatsAppCampaignInputSchema.fields.credentialsId,
              )("credentials-id"),
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

      it.effect("gets campaign", () =>
        Effect.gen(function* () {
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

      it.effect("lists campaigns", () =>
        Effect.gen(function* () {
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
          expect(campaigns.some((campaign) => campaign.id === campaignId)).toBe(
            true,
          );
        }),
      );

      it.effect("updates campaign", () =>
        Effect.gen(function* () {
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

      it.effect("deletes campaign", () =>
        Effect.gen(function* () {
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
