import { ORPCError } from "@orpc/server";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { SpacesUsecases } from "../../application/SpacesUsecases";

const ListSpacesInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
});
export const listSpacesInputSchema = ListSpacesInputSchema.pipe(
  Schema.toStandardSchemaV1,
);

export const handleListSpaces = Effect.fn("handleListSpaces")(
  function* ({
    input: { workspaceId },
    context: { user },
  }: {
    input: typeof ListSpacesInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const spacesUsecases = yield* SpacesUsecases;
    const userId = Schema.decodeSync(UserId)(user.id);
    const spacesList = yield* spacesUsecases.list({
      workspaceId,
      userId,
    });
    return { spaces: spacesList };
  },
  Effect.catchTags({
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
        message: "Failed to list spaces",
        cause: defect,
      }),
    ),
  ),
);
