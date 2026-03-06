import { ORPCError } from "@orpc/server";
import { CampaignId, TypebotId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import { CampaignsUsecases } from "../../application/CampaignsUsecases";
import { CampaignUpdateInputSchema } from "../../application/CampaignUpdateInput";

export const UpdateCampaignInputStandardSchema = CampaignUpdateInputSchema.pipe(
  Schema.extend(
    Schema.Struct({ typebotId: TypebotId, campaignId: CampaignId }),
  ),
  Schema.standardSchemaV1,
);

export const handleUpdateCampaign = Effect.fn("handleUpdateCampaign")(
  function* ({
    input: { typebotId, campaignId, ...rest },
    context: { user },
  }: {
    input: typeof UpdateCampaignInputStandardSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const campaignsUsecases = yield* CampaignsUsecases;
    return yield* campaignsUsecases.update(
      {
        typebotId,
        campaignId,
        userId: UserId.make(user.id),
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
  Effect.catchAllDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update campaign",
        cause: defect,
      }),
    ),
  ),
);
