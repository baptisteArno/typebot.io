import { ORPCError } from "@orpc/server";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { SpaceCreateInputSchema } from "../../application/SpaceCreateInput";
import { SpacesUsecases } from "../../application/SpacesUsecases";

const CreateSpaceInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  name: SpaceCreateInputSchema.fields.name,
  icon: SpaceCreateInputSchema.fields.icon,
});

export const CreateSpaceInputStandardSchema = Schema.toStandardSchemaV1(
  CreateSpaceInputSchema,
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
    const userId = Schema.decodeSync(UserId)(user.id);
    const space = yield* spacesUsecases.create(
      {
        workspaceId,
        userId,
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
  Effect.catchDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create space",
        cause: defect,
      }),
    ),
  ),
);
