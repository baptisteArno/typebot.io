import { ORPCError } from "@orpc/server";
import { SpaceId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { SegmentCreateInputSchema } from "../../application/SegmentCreateInput";
import { SegmentsUsecases } from "../../application/SegmentsUsecases";

const CreateSegmentInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  spaceId: Schema.optional(SpaceId),
  name: SegmentCreateInputSchema.fields.name,
});

export const CreateSegmentInputStandardSchema = Schema.toStandardSchemaV1(
  CreateSegmentInputSchema,
);

export const handleCreateSegment = Effect.fn("handleCreateSegment")(
  function* ({
    input: { workspaceId, spaceId, name },
    context: { user },
  }: {
    input: typeof CreateSegmentInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const segmentsUsecases = yield* SegmentsUsecases;
    const userId = Schema.decodeSync(UserId)(user.id);
    const segment = yield* segmentsUsecases.create(
      {
        workspaceId,
        spaceId,
        userId,
      },
      { name },
    );
    return { segment };
  },
  Effect.catchTags({
    SegmentsAlreadyExistsError: () =>
      Effect.fail(
        new ORPCError("CONFLICT", {
          message: "A segment with this name already exists",
        }),
      ),
    SegmentsForbiddenError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Workspace not found",
        }),
      ),
  }),
  Effect.catchDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create segment",
        cause: defect,
      }),
    ),
  ),
);
