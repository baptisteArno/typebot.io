import { ORPCError } from "@orpc/server";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { SpacesUsecases } from "../../application/SpacesUsecases";
import { SpaceCreateInputSchema } from "../../core/Space";

export const CreateSpaceInputSchema = SpaceCreateInputSchema.pipe(
  Schema.extend(
    Schema.Struct({
      workspaceId: WorkspaceId,
    }),
  ),
  Schema.standardSchemaV1,
);

export const handleCreateSpace = Effect.fn("handleCreateSpace")(
  function* ({
    input: { workspaceId, name, icon },
    context: { user },
  }: {
    input: typeof CreateSpaceInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const spacesUsecases = yield* SpacesUsecases;
    const space = yield* spacesUsecases.create(
      {
        workspaceId,
        userId: UserId.make(user.id),
      },
      {
        name,
        icon,
      },
    );
    return { space };
  },
  Effect.catchTags({
    SpacesAlreadyExistsError: () =>
      Effect.fail(
        new ORPCError("CONFLICT", {
          message: "A space with this name already exists",
        }),
      ),
    SpacesForbiddenError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Workspace not found",
        }),
      ),
  }),
  Effect.catchAllDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create space",
        cause: defect,
      }),
    ),
  ),
);
