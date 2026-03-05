import type { SpaceId } from "@typebot.io/domain/shared-primitives";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";
import type { Contact, ContactCreateInput, ContactId } from "../core/Contact";
import type { AlreadyExistsError, NotFoundError } from "../core/ContactsErrors";

export class ContactsRepo extends Context.Tag("@typebot.io/ContactsRepo")<
  ContactsRepo,
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
