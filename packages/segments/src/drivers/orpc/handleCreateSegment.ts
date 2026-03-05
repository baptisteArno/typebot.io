import { ORPCError } from "@orpc/server";
import { SpaceId } from "@typebot.io/domain-primitives/schemas";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { SegmentsUsecases } from "../../application/SegmentsUsecases";
import { SegmentCreateInputSchema } from "../../core/Segment";

export const CreateSegmentInputSchema = SegmentCreateInputSchema.pipe(
  Schema.extend(
    Schema.Struct({
      workspaceId: WorkspaceId,
      spaceId: Schema.optional(SpaceId),
    }),
  ),
  Schema.standardSchemaV1,
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
    const segment = yield* segmentsUsecases.create(
      {
        workspaceId,
        spaceId,
        userId: UserId.make(user.id),
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
  Effect.catchAllDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create segment",
        cause: defect,
      }),
    ),
  ),
);
