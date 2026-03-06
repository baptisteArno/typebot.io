import { ORPCError } from "@orpc/server";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import type { ContactCreateInput } from "../../application/ContactsUsecases";
import { ContactsUsecases } from "../../application/ContactsUsecases";

export const handleCreateContact = Effect.fn("handleCreateContact")(
  function* ({
    input,
    context: { user },
  }: {
    input: ContactCreateInput;
    context: { user: Pick<User, "id"> };
  }) {
    const contactsUsecases = yield* ContactsUsecases;
    const userId = Schema.decodeSync(UserId)(user.id);
    const contact = yield* contactsUsecases.create(input, {
      userId,
    });
    return { contact };
  },
  Effect.catchTags({
    ContactsAlreadyExistsError: () =>
      Effect.fail(
        new ORPCError("CONFLICT", {
          message:
            "A contact with one of these unique property values already exists",
        }),
      ),
    ContactsForbiddenError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Workspace not found",
        }),
      ),
  }),
  Effect.catchDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create contact",
        cause: defect,
      }),
    ),
  ),
);
