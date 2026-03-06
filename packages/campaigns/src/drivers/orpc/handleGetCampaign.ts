import { ORPCError } from "@orpc/server";
import { CampaignId, TypebotId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import { CampaignsUsecases } from "../../application/CampaignsUsecases";

const GetCampaignInputSchema = Schema.Struct({
  typebotId: TypebotId,
  campaignId: CampaignId,
});
export const getCampaignInputSchema = GetCampaignInputSchema.pipe(
  Schema.standardSchemaV1,
);

export const handleGetCampaign = Effect.fn("handleGetCampaign")(
  function* ({
    input: { typebotId, campaignId },
    context: { user },
  }: {
    input: typeof GetCampaignInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const campaignsUsecases = yield* CampaignsUsecases;
    return yield* campaignsUsecases.get({
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
        message: "Failed to get campaign",
        cause: defect,
      }),
    ),
  ),
);
