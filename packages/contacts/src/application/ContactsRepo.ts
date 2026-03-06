import type { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { type Effect, ServiceMap } from "effect";
import type { Contact, ContactId } from "../domain/Contact";
import type {
  ContactsAlreadyExistsError,
  ContactsNotFoundError,
} from "../domain/errors";
export type ContactRepoCreateInput = {
  readonly workspaceId: WorkspaceId;
  readonly spaceId?: SpaceId;
  readonly name?: string;
  readonly properties: readonly {
    readonly definitionId: number;
    readonly valueString: string | null;
    readonly valueNumber: number | null;
  }[];
};

export class ContactsRepo extends ServiceMap.Service<
  ContactsRepo,
  {
    readonly list: (
      pagination: { limit: number; cursor?: number; q?: string },
      scope: { workspaceId: WorkspaceId; spaceId?: SpaceId },
    ) => Effect.Effect<{
      contacts: readonly Contact[];
      nextCursor: number | undefined;
    }>;
    readonly existsContactWithUniquePropertyValues: (
      pairs: ReadonlyArray<{ definitionId: number; valueString: string }>,
      scope: { workspaceId: WorkspaceId; spaceId?: SpaceId },
    ) => Effect.Effect<boolean>;
    readonly create: (
      input: ContactRepoCreateInput,
    ) => Effect.Effect<Contact, ContactsAlreadyExistsError>;
    readonly getById: (
      contactId: ContactId,
      scope: { workspaceId: WorkspaceId; spaceId?: SpaceId },
    ) => Effect.Effect<Contact, ContactsNotFoundError>;
    readonly delete: (
      contactId: ContactId,
      scope: { workspaceId: WorkspaceId; spaceId?: SpaceId },
    ) => Effect.Effect<void, ContactsNotFoundError>;
    readonly deleteMany: (
      contactIds: readonly ContactId[],
      scope: { workspaceId: WorkspaceId; spaceId?: SpaceId },
    ) => Effect.Effect<void>;
  }
>()("@typebot.io/ContactsRepo") {}
