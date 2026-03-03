import { ORPCError } from "@orpc/server";
import { CampaignId, TypebotId } from "@typebot.io/domain-primitives/schemas";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import { Campaigns } from "../core/Campaigns";

const DeleteCampaignInputSchema = Schema.Struct({
  typebotId: TypebotId,
  campaignId: CampaignId,
});
export const deleteCampaignInputSchema = DeleteCampaignInputSchema.pipe(
  Schema.standardSchemaV1,
);

export const handleDeleteCampaign = Effect.fn("handleDeleteCampaign")(
  function* ({
    input: { typebotId, campaignId },
    context: { user },
  }: {
    input: typeof DeleteCampaignInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const campaigns = yield* Campaigns;
    return yield* campaigns.delete({
      typebotId,
      campaignId,
      userId: UserId.make(user.id),
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
  Effect.catchAllDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete campaign",
        cause: defect,
      }),
    ),
  ),
);
