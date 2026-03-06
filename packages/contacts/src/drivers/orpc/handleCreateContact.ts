import { ORPCError } from "@orpc/server";
import { SpaceId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Schema } from "effect";
import { ContactCreateInputSchema } from "../../application/ContactCreateInput";
import { ContactsUsecases } from "../../application/ContactsUsecases";

export const CreateContactInputStandardSchema = ContactCreateInputSchema.pipe(
  Schema.extend(
    Schema.Struct({
      workspaceId: WorkspaceId,
      spaceId: Schema.optional(SpaceId),
    }),
  ),
  Schema.standardSchemaV1,
);

export const handleCreateContact = Effect.fn("handleCreateContact")(
  function* ({
    input: {
      workspaceId,
      spaceId,
      firstName,
      lastName,
      email,
      phone,
      customAttributes,
    },
    context: { user },
  }: {
    input: typeof CreateContactInputStandardSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const contactsUsecases = yield* ContactsUsecases;
    const contact = yield* contactsUsecases.create(
      {
        workspaceId,
        spaceId,
        userId: UserId.make(user.id),
      },
      { firstName, lastName, email, phone, customAttributes },
    );
    return { contact };
  },
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
          message: "Workspace not found",
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
);
