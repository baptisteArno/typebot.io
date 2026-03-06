import { ORPCError } from "@orpc/server";
import { CampaignId, TypebotId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import { CampaignsUsecases } from "../../application/CampaignsUsecases";
import { CampaignUpdateInputSchema } from "../../application/CampaignUpdateInput";

const UpdateCampaignInputSchema = Schema.Struct({
  typebotId: TypebotId,
  campaignId: CampaignId,
  status: CampaignUpdateInputSchema.fields.status,
  recipientSegmentId: CampaignUpdateInputSchema.fields.recipientSegmentId,
  templateId: CampaignUpdateInputSchema.fields.templateId,
});

export const UpdateCampaignInputStandardSchema = Schema.toStandardSchemaV1(
  UpdateCampaignInputSchema,
);

export const handleUpdateCampaign = Effect.fn("handleUpdateCampaign")(
  function* ({
    input: { typebotId, campaignId, ...rest },
    context: { user },
  }: {
    input: typeof UpdateCampaignInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const campaignsUsecases = yield* CampaignsUsecases;
    const userId = Schema.decodeSync(UserId)(user.id);
    return yield* campaignsUsecases.update(
      {
        typebotId,
        campaignId,
        userId,
      },
      rest,
    );
  },
  Effect.catchTags({
    CampaignsForbiddenError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Typebot not found",
        }),
      ),
    CampaignsNotFoundError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Campaign not found",
        }),
      ),
  }),
  Effect.catchDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update campaign",
        cause: defect,
      }),
    ),
  ),
);
