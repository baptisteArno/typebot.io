import type {
  CampaignId,
  TypebotId,
} from "@typebot.io/domain-primitives/schemas";
import type { UserId } from "@typebot.io/user/schemas";
import { Context, Effect, Layer } from "effect";
import type {
  Campaign,
  CampaignUpdateInput,
  WhatsAppCampaignInput,
} from "../core/Campaign";
import {
  ForbiddenError,
  type ForbiddenError as ForbiddenErrorType,
  type NotFoundError,
} from "../core/CampaignsErrors";
import { CampaignsAuthorization } from "./CampaignsAuthorization";
import { CampaignsRepo } from "./CampaignsRepo";

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
      ForbiddenErrorType
    >;
    readonly createWhatsAppCampaign: (
      resource: { typebotId: TypebotId; userId: UserId },
      input: WhatsAppCampaignInput,
    ) => Effect.Effect<Campaign, ForbiddenErrorType>;
    readonly get: (resource: {
      typebotId: TypebotId;
      campaignId: CampaignId;
      userId: UserId;
    }) => Effect.Effect<Campaign, ForbiddenErrorType | NotFoundError>;
    readonly update: (
      resource: {
        typebotId: TypebotId;
        campaignId: CampaignId;
        userId: UserId;
      },
      input: CampaignUpdateInput,
    ) => Effect.Effect<Campaign, ForbiddenErrorType | NotFoundError>;
    readonly delete: (resource: {
      typebotId: TypebotId;
      campaignId: CampaignId;
      userId: UserId;
    }) => Effect.Effect<void, ForbiddenErrorType | NotFoundError>;
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

        if (!canRead) return yield* new ForbiddenError();

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

        if (!canWrite) return yield* new ForbiddenError();

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

        if (!canRead) return yield* new ForbiddenError();

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

        if (!canWrite) return yield* new ForbiddenError();

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

        if (!canWrite) return yield* new ForbiddenError();

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
