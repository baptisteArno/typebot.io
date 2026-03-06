import type {
  CampaignId,
  TypebotId,
} from "@typebot.io/shared-primitives/domain";
import type { UserId } from "@typebot.io/user/schemas";
import { Context, Effect, Layer } from "effect";
import type { Campaign } from "../domain/Campaign";
import {
  CampaignsForbiddenError,
  type CampaignsForbiddenError as CampaignsForbiddenErrorType,
  type CampaignsNotFoundError,
} from "../domain/errors";
import { CampaignsAuthorization } from "./CampaignsAuthorization";
import { CampaignsRepo } from "./CampaignsRepo";
import type { CampaignUpdateInput } from "./CampaignUpdateInput";
import type { WhatsAppCampaignInput } from "./WhatsAppCampaignInput";

export class CampaignsUsecases extends Context.Tag(
  "@typebot.io/CampaignsUsecases",
)<
  CampaignsUsecases,
  {
    readonly list: (
      resource: { typebotId: TypebotId; userId: UserId },
      pagination: { limit: number; cursor?: string },
    ) => Effect.Effect<
      { campaigns: readonly Campaign[]; nextCursor: string | undefined },
      CampaignsForbiddenErrorType
    >;
    readonly createWhatsAppCampaign: (
      resource: { typebotId: TypebotId; userId: UserId },
      input: WhatsAppCampaignInput,
    ) => Effect.Effect<Campaign, CampaignsForbiddenErrorType>;
    readonly get: (resource: {
      typebotId: TypebotId;
      campaignId: CampaignId;
      userId: UserId;
    }) => Effect.Effect<
      Campaign,
      CampaignsForbiddenErrorType | CampaignsNotFoundError
    >;
    readonly update: (
      resource: {
        typebotId: TypebotId;
        campaignId: CampaignId;
        userId: UserId;
      },
      input: CampaignUpdateInput,
    ) => Effect.Effect<
      Campaign,
      CampaignsForbiddenErrorType | CampaignsNotFoundError
    >;
    readonly delete: (resource: {
      typebotId: TypebotId;
      campaignId: CampaignId;
      userId: UserId;
    }) => Effect.Effect<
      void,
      CampaignsForbiddenErrorType | CampaignsNotFoundError
    >;
  }
>() {
  static readonly layer = Layer.effect(
    CampaignsUsecases,
    Effect.gen(function* () {
      const campaignsRepo = yield* CampaignsRepo;
      const campaignsAuthorization = yield* CampaignsAuthorization;

      const list = Effect.fn("CampaignsUsecases.list")(function* (
        { typebotId, userId }: { typebotId: TypebotId; userId: UserId },
        pagination: { limit: number; cursor?: string },
      ) {
        const canRead = yield* campaignsAuthorization.canReadCampaign(
          typebotId,
          userId,
        );

        if (!canRead) return yield* new CampaignsForbiddenError();

        return yield* campaignsRepo.listByTypebotId(typebotId, pagination);
      });

      const createWhatsAppCampaign = Effect.fn(
        "CampaignsUsecases.createWhatsAppCampaign",
      )(function* (
        { typebotId, userId }: { typebotId: TypebotId; userId: UserId },
        input: WhatsAppCampaignInput,
      ) {
        const canWrite = yield* campaignsAuthorization.canWriteCampaign(
          typebotId,
          userId,
        );

        if (!canWrite) return yield* new CampaignsForbiddenError();

        return yield* campaignsRepo.create(typebotId, input);
      });

      const get = Effect.fn("CampaignsUsecases.get")(function* ({
        typebotId,
        campaignId,
        userId,
      }: {
        typebotId: TypebotId;
        campaignId: CampaignId;
        userId: UserId;
      }) {
        const canRead = yield* campaignsAuthorization.canReadCampaign(
          typebotId,
          userId,
        );

        if (!canRead) return yield* new CampaignsForbiddenError();

        return yield* campaignsRepo.getById(typebotId, campaignId);
      });

      const update = Effect.fn("CampaignsUsecases.update")(function* (
        {
          typebotId,
          campaignId,
          userId,
        }: {
          typebotId: TypebotId;
          campaignId: CampaignId;
          userId: UserId;
        },
        input: CampaignUpdateInput,
      ) {
        const canWrite = yield* campaignsAuthorization.canWriteCampaign(
          typebotId,
          userId,
        );

        if (!canWrite) return yield* new CampaignsForbiddenError();

        return yield* campaignsRepo.update(typebotId, campaignId, input);
      });

      const delete_ = Effect.fn("CampaignsUsecases.delete")(function* ({
        typebotId,
        campaignId,
        userId,
      }: {
        typebotId: TypebotId;
        campaignId: CampaignId;
        userId: UserId;
      }) {
        const canWrite = yield* campaignsAuthorization.canWriteCampaign(
          typebotId,
          userId,
        );

        if (!canWrite) return yield* new CampaignsForbiddenError();

        return yield* campaignsRepo.delete(typebotId, campaignId);
      });

      return CampaignsUsecases.of({
        list,
        createWhatsAppCampaign,
        get,
        update,
        delete: delete_,
      });
    }),
  );
}
