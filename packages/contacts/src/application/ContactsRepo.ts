import type { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";
import type { Contact, ContactId } from "../domain/Contact";
import type {
  ContactsAlreadyExistsError,
  ContactsNotFoundError,
} from "../domain/errors";
import type { ContactCreateInput } from "./ContactCreateInput";

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
    ) => Effect.Effect<Contact, ContactsAlreadyExistsError>;
    readonly getById: (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      contactId: ContactId,
    ) => Effect.Effect<Contact, ContactsNotFoundError>;
  }
>() {}
