import { ORPCError } from "@orpc/server";
import { Name } from "@typebot.io/domain-primitives/schemas";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { AudienceCreateInputSchema } from "../core/Audience";
import { Audiences } from "../core/Audiences";
import { runAudiencesEffect } from "../infrastructure/AudiencesLiveLayer";

export const CreateAudienceInputSchema = AudienceCreateInputSchema.pipe(
  Schema.extend(
    Schema.Struct({
      workspaceId: WorkspaceId,
    }),
  ),
  Schema.standardSchemaV1,
);

export const handleCreateAudience = async ({
  input: { workspaceId, name },
  context: { user },
}: {
  input: typeof CreateAudienceInputSchema.Type;
  context: { user: Pick<User, "id"> };
}) => {
  const response = await runAudiencesEffect(
    Effect.gen(function* () {
      const audiences = yield* Audiences;
      const response = yield* audiences.create(
        {
          workspaceId,
          userId: UserId.make(user.id),
        },
        { name: Name.make(name) },
      );
      return response;
    }).pipe(
      Effect.catchTags({
        AudiencesAlreadyExistsError: () =>
          Effect.fail(
            new ORPCError("CONFLICT", {
              message: "An audience with this name already exists",
            }),
          ),
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
            message: "Failed to create audience",
            cause: defect,
          }),
        ),
      ),
    ),
  );

  return { audience: response };
};
