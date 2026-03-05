import type {
  CampaignId,
  TypebotId,
} from "@typebot.io/domain/shared-primitives";
import { PrismaService } from "@typebot.io/prisma/effect";
import { Effect, Layer, Schema } from "effect";
import { CampaignsRepo } from "../application/CampaignsRepo";
import {
  Campaign,
  type CampaignUpdateInput,
  type WhatsAppCampaignInput,
} from "../core/Campaign";
import { NotFoundError } from "../core/CampaignsErrors";

export const PrismaCampaignsRepository = Layer.effect(
  CampaignsRepo,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const listByTypebotId = Effect.fn(
      "PrismaCampaignsRepository.listByTypebotId",
    )(function* (
      typebotId: TypebotId,
      pagination: { limit: number; cursor?: string },
    ) {
      const { limit, cursor } = pagination;

      const campaigns = yield* prisma.campaign
        .findMany({
          where: { typebotId },
          orderBy: { createdAt: "desc" },
          take: limit + 1,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          include: { whatsAppConfig: true },
        })
        .pipe(Effect.orDie);

      const hasMore = campaigns.length > limit;
      const paginatedCampaigns = hasMore
        ? campaigns.slice(0, limit)
        : campaigns;
      const nextCursor = hasMore ? paginatedCampaigns.at(-1)?.id : undefined;

      const decoded = yield* Effect.all(
        paginatedCampaigns.map((c) =>
          Schema.decodeUnknown(Campaign)(c).pipe(Effect.orDie),
        ),
      );

      return { campaigns: decoded, nextCursor };
    });

    const create = Effect.fn("PrismaCampaignsRepository.create")(function* (
      typebotId: TypebotId,
      input: WhatsAppCampaignInput,
    ) {
      const campaign = yield* prisma.campaign
        .create({
          data: {
            typebotId,
            status: "DRAFT",
            channel: input.channel,
            name: input.name,
          },
          include: { whatsAppConfig: true },
        })
        .pipe(Effect.orDie);

      return yield* Schema.decodeUnknown(Campaign)(campaign).pipe(Effect.orDie);
    });

    const getById = Effect.fn("PrismaCampaignsRepository.getById")(function* (
      typebotId: TypebotId,
      campaignId: CampaignId,
    ) {
      const campaign = yield* prisma.campaign
        .findFirst({
          where: { id: campaignId, typebotId },
          include: { whatsAppConfig: true },
        })
        .pipe(Effect.orDie);

      if (!campaign) return yield* new NotFoundError();

      return yield* Schema.decodeUnknown(Campaign)(campaign).pipe(Effect.orDie);
    });

    const update = Effect.fn("PrismaCampaignsRepository.update")(function* (
      typebotId: TypebotId,
      campaignId: CampaignId,
      input: CampaignUpdateInput,
    ) {
      const campaign = yield* prisma.campaign
        .findFirst({
          where: { id: campaignId, typebotId },
          include: { whatsAppConfig: true },
        })
        .pipe(Effect.orDie);

      if (!campaign) return yield* new NotFoundError();

      if (input.templateId !== undefined) {
        if (campaign.whatsAppConfig) {
          yield* prisma.whatsAppCampaignConfig
            .update({
              where: { campaignId },
              data: { templateId: input.templateId },
            })
            .pipe(Effect.orDie);
        } else if (input.templateId != null) {
          yield* prisma.whatsAppCampaignConfig
            .create({
              data: {
                campaignId,
                templateId: input.templateId,
              },
            })
            .pipe(Effect.orDie);
        }
      }

      const updated = yield* prisma.campaign
        .update({
          where: { id: campaignId },
          data: {
            ...(input.status != null && { status: input.status }),
            ...(input.recipientSegmentId !== undefined && {
              recipientSegmentId: input.recipientSegmentId,
            }),
          },
          include: { whatsAppConfig: true },
        })
        .pipe(Effect.orDie);

      return yield* Schema.decodeUnknown(Campaign)(updated).pipe(Effect.orDie);
    });

    const delete_ = Effect.fn("PrismaCampaignsRepository.delete")(function* (
      typebotId: TypebotId,
      campaignId: CampaignId,
    ) {
      const campaign = yield* prisma.campaign
        .findFirst({
          where: { id: campaignId, typebotId },
        })
        .pipe(Effect.orDie);

      if (!campaign) return yield* new NotFoundError();

      yield* prisma.campaign
        .delete({
          where: { id: campaignId },
        })
        .pipe(Effect.orDie);

      return undefined;
    });

    return CampaignsRepo.of({
      listByTypebotId,
      create,
      getById,
      update,
      delete: delete_,
    });
  }),
);
