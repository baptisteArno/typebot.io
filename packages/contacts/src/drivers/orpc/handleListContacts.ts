import { ORPCError } from "@orpc/server";
import { SpaceId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { ContactsUsecases } from "../../application/ContactsUsecases";

const MAX_LIMIT = 500;
const LimitSchema = Schema.Number.pipe(
  Schema.int(),
  Schema.between(1, MAX_LIMIT),
);

const ListContactsInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  spaceId: Schema.optional(SpaceId),
  limit: Schema.optional(LimitSchema),
  cursor: Schema.optional(Schema.Number),
});
export const listContactsInputSchema = ListContactsInputSchema.pipe(
  Schema.standardSchemaV1,
);

export const handleListContacts = Effect.fn("handleListContacts")(
  function* ({
    input: { workspaceId, spaceId, limit, cursor },
    context: { user },
  }: {
    input: typeof ListContactsInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const contactsUsecases = yield* ContactsUsecases;
    return yield* contactsUsecases.list(
      {
        workspaceId,
        spaceId,
        userId: UserId.make(user.id),
      },
      { limit: limit ?? 50, cursor },
    );
  },
  Effect.catchTags({
    ContactsForbiddenError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Workspace not found",
        }),
      ),
  }),
  Effect.catchAllDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list contacts",
        cause: defect,
      }),
    ),
  ),
);
