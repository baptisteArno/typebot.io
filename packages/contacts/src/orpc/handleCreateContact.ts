import { ORPCError } from "@orpc/server";
import { AudienceId } from "@typebot.io/audiences/core/Audience";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import {
  type ContactCreateInput,
  ContactCreateInputSchema,
} from "../core/Contact";
import { Contacts } from "../core/Contacts";
import { runContactsEffect } from "../infrastructure/ContactsLiveLayer";

export const CreateContactInputStandardSchema = ContactCreateInputSchema.pipe(
  Schema.extend(Schema.Struct({ audienceId: AudienceId })),
  Schema.standardSchemaV1,
);

export const handleCreateContact = async ({
  input: { audienceId, firstName, lastName, email, phone, customAttributes },
  context: { user },
}: {
  input: { audienceId: string } & ContactCreateInput;
  context: { user: Pick<User, "id"> };
}) => {
  const response = await runContactsEffect(
    Effect.gen(function* () {
      const contacts = yield* Contacts;
      return yield* contacts.create(
        {
          audienceId: AudienceId.make(audienceId),
          userId: UserId.make(user.id),
        },
        { firstName, lastName, email, phone, customAttributes },
      );
    }).pipe(
      Effect.catchTags({
        ContactsAlreadyExistsError: () =>
          Effect.fail(
            new ORPCError("CONFLICT", {
              message: "A contact with this email or phone already exists",
            }),
          ),
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
            message: "Failed to create contact",
            cause: defect,
          }),
        ),
      ),
    ),
  );

  return { contact: response };
};
