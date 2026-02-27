import { ORPCError } from "@orpc/server";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { Spaces } from "../core/Spaces";
import { runSpacesEffect } from "../infrastructure/SpacesLiveLayer";

const ListSpacesInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
});
export const listSpacesInputSchema = ListSpacesInputSchema.pipe(
  Schema.standardSchemaV1,
);

export const handleListSpaces = async ({
  input: { workspaceId },
  context: { user },
}: {
  input: typeof ListSpacesInputSchema.Type;
  context: { user: Pick<User, "id"> };
}) => {
  const response = await runSpacesEffect(
    Effect.gen(function* () {
      const spaces = yield* Spaces;
      const response = yield* spaces.list({
        workspaceId,
        userId: UserId.make(user.id),
      });
      return { spaces: response };
    }).pipe(
      Effect.catchTags({
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
            message: "Failed to list spaces",
            cause: defect,
          }),
        ),
      ),
    ),
  );

  return response;
};
