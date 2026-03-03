import type { SpaceId } from "@typebot.io/domain-primitives/schemas";
import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";

export class ContactsAuthorization extends Context.Tag(
  "@typebot.io/ContactsAuthorization",
)<
  ContactsAuthorization,
  {
    readonly canListContacts: (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canCreateContact: (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canGetContact: (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      userId: UserId,
    ) => Effect.Effect<boolean>;
  }
>() {}
