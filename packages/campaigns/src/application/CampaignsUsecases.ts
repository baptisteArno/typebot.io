import type {
  CampaignId,
  TypebotId,
} from "@typebot.io/shared-primitives/domain";
import { TypebotRepo } from "@typebot.io/typebot/application/TypebotRepo";
import type { UserId } from "@typebot.io/user/schemas";
import { Effect, Layer, ServiceMap } from "effect";
import type { Campaign } from "../domain/Campaign";
import {
  CampaignsForbiddenError,
  type CampaignsForbiddenError as CampaignsForbiddenErrorType,
  type CampaignsNotFoundError,
} from "../domain/errors";
import { CampaignsRepo } from "./CampaignsRepo";
import type { CampaignUpdateInput } from "./CampaignUpdateInput";
import type { WhatsAppCampaignInput } from "./WhatsAppCampaignInput";

export class CampaignsUsecases extends ServiceMap.Service<
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
>()("@typebot.io/CampaignsUsecases") {
  static readonly layer = Layer.effect(
    CampaignsUsecases,
    Effect.gen(function* () {
      const campaignsRepo = yield* CampaignsRepo;
      const typebotRepo = yield* TypebotRepo;

      const list = Effect.fn("CampaignsUsecases.list")(function* (
        { typebotId, userId }: { typebotId: TypebotId; userId: UserId },
        pagination: { limit: number; cursor?: string },
      ): Effect.fn.Return<
        { campaigns: readonly Campaign[]; nextCursor: string | undefined },
        CampaignsForbiddenErrorType
      > {
        const canRead = yield* typebotRepo.canReadTypebot(typebotId, userId);

        if (!canRead) return yield* new CampaignsForbiddenError();

        return yield* campaignsRepo.listByTypebotId(typebotId, pagination);
      });

      const createWhatsAppCampaign = Effect.fn(
        "CampaignsUsecases.createWhatsAppCampaign",
      )(function* (
        { typebotId, userId }: { typebotId: TypebotId; userId: UserId },
        input: WhatsAppCampaignInput,
      ): Effect.fn.Return<Campaign, CampaignsForbiddenErrorType> {
        const canWrite = yield* typebotRepo.canWriteTypebot(typebotId, userId);

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
      }): Effect.fn.Return<
        Campaign,
        CampaignsForbiddenErrorType | CampaignsNotFoundError
      > {
        const canRead = yield* typebotRepo.canReadTypebot(typebotId, userId);

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
      ): Effect.fn.Return<
        Campaign,
        CampaignsForbiddenErrorType | CampaignsNotFoundError
      > {
        const canWrite = yield* typebotRepo.canWriteTypebot(typebotId, userId);

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
      }): Effect.fn.Return<
        void,
        CampaignsForbiddenErrorType | CampaignsNotFoundError
      > {
        const canWrite = yield* typebotRepo.canWriteTypebot(typebotId, userId);

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
