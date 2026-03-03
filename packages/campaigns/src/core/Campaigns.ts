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
} from "./Campaign";
import { CampaignsAuthorization } from "./CampaignsAuthorization";
import {
  ForbiddenError,
  type ForbiddenError as ForbiddenErrorType,
  type NotFoundError,
} from "./CampaignsErrors";
import { CampaignsRepository } from "./CampaignsRepository";

export class Campaigns extends Context.Tag("@typebot.io/Campaigns")<
  Campaigns,
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
    Campaigns,
    Effect.gen(function* () {
      const campaignsRepository = yield* CampaignsRepository;
      const campaignsAuthorization = yield* CampaignsAuthorization;

      const list = Effect.fn("Campaigns.list")(function* (
        { typebotId, userId }: { typebotId: TypebotId; userId: UserId },
        pagination: { limit: number; cursor?: string },
      ) {
        const canRead = yield* campaignsAuthorization.canReadCampaign(
          typebotId,
          userId,
        );

        if (!canRead) return yield* new ForbiddenError();

        return yield* campaignsRepository.listByTypebotId(
          typebotId,
          pagination,
        );
      });

      const createWhatsAppCampaign = Effect.fn(
        "Campaigns.createWhatsAppCampaign",
      )(function* (
        { typebotId, userId }: { typebotId: TypebotId; userId: UserId },
        input: WhatsAppCampaignInput,
      ) {
        const canWrite = yield* campaignsAuthorization.canWriteCampaign(
          typebotId,
          userId,
        );

        if (!canWrite) return yield* new ForbiddenError();

        return yield* campaignsRepository.create(typebotId, input);
      });

      const get = Effect.fn("Campaigns.get")(function* ({
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

        return yield* campaignsRepository.getById(typebotId, campaignId);
      });

      const update = Effect.fn("Campaigns.update")(function* (
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

        return yield* campaignsRepository.update(typebotId, campaignId, input);
      });

      const delete_ = Effect.fn("Campaigns.delete")(function* ({
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

        return yield* campaignsRepository.delete(typebotId, campaignId);
      });

      return Campaigns.of({
        list,
        createWhatsAppCampaign,
        get,
        update,
        delete: delete_,
      });
    }),
  );
}
