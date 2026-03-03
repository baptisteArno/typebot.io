import type { SpaceId } from "@typebot.io/domain-primitives/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";
import type { Contact, ContactCreateInput, ContactId } from "./Contact";
import type { AlreadyExistsError, NotFoundError } from "./ContactsErrors";

export class ContactsRepository extends Context.Tag(
  "@typebot.io/ContactsRepository",
)<
  ContactsRepository,
  {
    readonly listByWorkspaceAndSpace: (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      pagination: { limit: number; cursor?: number },
    ) => Effect.Effect<{
      contacts: readonly Contact[];
      nextCursor: number | undefined;
    }>;
    readonly create: (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      input: ContactCreateInput,
    ) => Effect.Effect<Contact, AlreadyExistsError>;
    readonly getById: (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      contactId: ContactId,
    ) => Effect.Effect<Contact, NotFoundError>;
  }
>() {}
