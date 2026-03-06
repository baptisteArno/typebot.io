import { ORPCError } from "@orpc/server";
import { CampaignId, TypebotId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import { CampaignsUsecases } from "../../application/CampaignsUsecases";

const DeleteCampaignInputSchema = Schema.Struct({
  typebotId: TypebotId,
  campaignId: CampaignId,
});
export const deleteCampaignInputSchema = DeleteCampaignInputSchema.pipe(
  Schema.toStandardSchemaV1,
);

export const handleDeleteCampaign = Effect.fn("handleDeleteCampaign")(
  function* ({
    input: { typebotId, campaignId },
    context: { user },
  }: {
    input: typeof DeleteCampaignInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const campaignsUsecases = yield* CampaignsUsecases;
    const userId = Schema.decodeSync(UserId)(user.id);
    return yield* campaignsUsecases.delete({
      typebotId,
      campaignId,
      userId,
    });
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
        message: "Failed to delete campaign",
        cause: defect,
      }),
    ),
  ),
);
