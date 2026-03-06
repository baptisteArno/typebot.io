import { ORPCError } from "@orpc/server";
import { TypebotId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import { CampaignsUsecases } from "../../application/CampaignsUsecases";

const MAX_LIMIT = 500;
const LimitSchema = Schema.Int.pipe(
  Schema.check(Schema.isBetween({ minimum: 1, maximum: MAX_LIMIT })),
);

const ListCampaignsInputSchema = Schema.Struct({
  typebotId: TypebotId,
  limit: Schema.optional(LimitSchema),
  cursor: Schema.optional(Schema.String),
});
export const listCampaignsInputSchema = ListCampaignsInputSchema.pipe(
  Schema.toStandardSchemaV1,
);

export const handleListCampaigns = Effect.fn("handleListCampaigns")(
  function* ({
    input: { typebotId, limit, cursor },
    context: { user },
  }: {
    input: typeof ListCampaignsInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const campaignsUsecases = yield* CampaignsUsecases;
    const userId = Schema.decodeSync(UserId)(user.id);
    return yield* campaignsUsecases.list(
      {
        typebotId,
        userId,
      },
      { limit: limit ?? 50, cursor },
    );
  },
  Effect.catchTags({
    CampaignsForbiddenError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Typebot not found",
        }),
      ),
  }),
  Effect.catchDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list campaigns",
        cause: defect,
      }),
    ),
  ),
);
