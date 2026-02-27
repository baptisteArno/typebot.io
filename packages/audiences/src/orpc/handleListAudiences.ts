import { ORPCError } from "@orpc/server";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { Audiences } from "../core/Audiences";
import { runAudiencesEffect } from "../infrastructure/AudiencesLiveLayer";

const ListAudiencesInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
});
export const listAudiencesInputSchema = ListAudiencesInputSchema.pipe(
  Schema.standardSchemaV1,
);

export const handleListAudiences = async ({
  input: { workspaceId },
  context: { user },
}: {
  input: typeof ListAudiencesInputSchema.Type;
  context: { user: Pick<User, "id"> };
}) => {
  const response = await runAudiencesEffect(
    Effect.gen(function* () {
      const audiences = yield* Audiences;
      const response = yield* audiences.list({
        workspaceId,
        userId: UserId.make(user.id),
      });
      return { audiences: response };
    }).pipe(
      Effect.catchTags({
        AudiencesForbiddenError: () =>
          Effect.fail(
            new ORPCError("NOT_FOUND", {
              message: "Workspace not found",
            }),
          ),
      }),
      Effect.catchAllDefect((defect) =>
        Effect.fail(
          new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to list audiences",
            cause: defect,
          }),
        ),
      ),
    ),
  );

  return response;
};
