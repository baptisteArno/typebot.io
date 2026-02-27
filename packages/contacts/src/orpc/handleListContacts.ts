import { ORPCError } from "@orpc/server";
import { AudienceId } from "@typebot.io/audiences/core";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import { Contacts } from "../core/Contacts";
import { runContactsEffect } from "../infrastructure/ContactsLiveLayer";

const MAX_LIMIT = 500;
const LimitSchema = Schema.Number.pipe(
  Schema.int(),
  Schema.between(1, MAX_LIMIT),
);

const ListContactsInputSchema = Schema.Struct({
  audienceId: AudienceId,
  limit: Schema.optional(LimitSchema),
  cursor: Schema.optional(Schema.Number),
});
export const listContactsInputSchema = ListContactsInputSchema.pipe(
  Schema.standardSchemaV1,
);

export const handleListContacts = async ({
  input: { audienceId, limit, cursor },
  context: { user },
}: {
  input: typeof ListContactsInputSchema.Type;
  context: { user: Pick<User, "id"> };
}) => {
  const response = await runContactsEffect(
    Effect.gen(function* () {
      const contacts = yield* Contacts;
      return yield* contacts.list(
        {
          audienceId,
          userId: UserId.make(user.id),
        },
        { limit: limit ?? 50, cursor },
      );
    }).pipe(
      Effect.catchTags({
        ContactsForbiddenError: () =>
          Effect.fail(
            new ORPCError("NOT_FOUND", {
              message: "Audience not found",
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
    ),
  );

  return response;
};
