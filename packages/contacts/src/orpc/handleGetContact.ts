import { ORPCError } from "@orpc/server";
import { AudienceId } from "@typebot.io/audiences/core/Audience";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import { ContactId } from "../core/Contact";
import { Contacts } from "../core/Contacts";
import { runContactsEffect } from "../infrastructure/ContactsLiveLayer";

const GetContactInputSchema = Schema.Struct({
  audienceId: AudienceId,
  contactId: ContactId,
});
export const getContactInputSchema = GetContactInputSchema.pipe(
  Schema.standardSchemaV1,
);

export const handleGetContact = async ({
  input: { audienceId, contactId },
  context: { user },
}: {
  input: typeof GetContactInputSchema.Type;
  context: { user: Pick<User, "id"> };
}) => {
  const response = await runContactsEffect(
    Effect.gen(function* () {
      const contacts = yield* Contacts;
      return yield* contacts.get({
        audienceId: AudienceId.make(audienceId),
        contactId,
        userId: UserId.make(user.id),
      });
    }).pipe(
      Effect.catchTags({
        ContactsForbiddenError: () =>
          Effect.fail(
            new ORPCError("NOT_FOUND", {
              message: "Audience not found",
            }),
          ),
        ContactsNotFoundError: () =>
          Effect.fail(
            new ORPCError("NOT_FOUND", {
              message: "Contact not found",
            }),
          ),
      }),
      Effect.catchAllDefect((defect) =>
        Effect.fail(
          new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to get contact",
            cause: defect,
          }),
        ),
      ),
    ),
  );

  return { contact: response };
};
