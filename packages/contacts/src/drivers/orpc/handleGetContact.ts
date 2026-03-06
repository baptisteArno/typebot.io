import { ORPCError } from "@orpc/server";
import { SpaceId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { ContactsUsecases } from "../../application/ContactsUsecases";
import { ContactId } from "../../domain/Contact";

const GetContactInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  spaceId: Schema.optional(SpaceId),
  contactId: ContactId,
});
export const getContactInputSchema = GetContactInputSchema.pipe(
  Schema.toStandardSchemaV1,
);

export const handleGetContact = Effect.fn("handleGetContact")(
  function* ({
    input: { workspaceId, spaceId, contactId },
    context: { user },
  }: {
    input: typeof GetContactInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const contactsUsecases = yield* ContactsUsecases;
    const userId = Schema.decodeSync(UserId)(user.id);
    const contact = yield* contactsUsecases.get({
      workspaceId,
      spaceId,
      contactId,
      userId,
    });
    return { contact };
  },
  Effect.catchTags({
    ContactsForbiddenError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Workspace not found",
        }),
      ),
    ContactsNotFoundError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Contact not found",
        }),
      ),
  }),
  Effect.catchDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to get contact",
        cause: defect,
      }),
    ),
  ),
);
