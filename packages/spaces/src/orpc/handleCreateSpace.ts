import { ORPCError } from "@orpc/server";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { SpaceCreateInputSchema } from "../core/Space";
import { Spaces } from "../core/Spaces";

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
    const spaces = yield* Spaces;
    const space = yield* spaces.create(
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
