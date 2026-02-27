import { ORPCError } from "@orpc/server";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { SpaceCreateInputSchema } from "../core/Space";
import { Spaces } from "../core/Spaces";
import { runSpacesEffect } from "../infrastructure/SpacesLiveLayer";

export const CreateSpaceInputSchema = SpaceCreateInputSchema.pipe(
  Schema.extend(
    Schema.Struct({
      workspaceId: WorkspaceId,
    }),
  ),
  Schema.standardSchemaV1,
);

export const handleCreateSpace = async ({
  input: { workspaceId, name, icon, audienceId },
  context: { user },
}: {
  input: typeof CreateSpaceInputSchema.Type;
  context: { user: Pick<User, "id"> };
}) => {
  const response = await runSpacesEffect(
    Effect.gen(function* () {
      const spaces = yield* Spaces;
      const response = yield* spaces.create(
        {
          workspaceId,
          userId: UserId.make(user.id),
        },
        {
          name,
          icon,
          audienceId,
        },
      );
      return response;
    }).pipe(
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
    ),
  );

  return { space: response };
};
