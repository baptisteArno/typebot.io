import { ORPCError } from "@orpc/server";
import { SpaceId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { SegmentsUsecases } from "../../application/SegmentsUsecases";

const ListSegmentsInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  spaceId: Schema.optional(SpaceId),
});
export const listSegmentsInputSchema = ListSegmentsInputSchema.pipe(
  Schema.standardSchemaV1,
);

export const handleListSegments = Effect.fn("handleListSegments")(
  function* ({
    input: { workspaceId, spaceId },
    context: { user },
  }: {
    input: typeof ListSegmentsInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const segmentsUsecases = yield* SegmentsUsecases;
    const segmentsList = yield* segmentsUsecases.list({
      workspaceId,
      spaceId,
      userId: UserId.make(user.id),
    });
    return { segments: segmentsList };
  },
  Effect.catchTags({
    SegmentsForbiddenError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Workspace not found",
        }),
      ),
  }),
  Effect.catchAllDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list segments",
        cause: defect,
      }),
    ),
  ),
);
