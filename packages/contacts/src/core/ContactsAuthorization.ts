import type { AudienceId } from "@typebot.io/audiences/core";
import type { UserId } from "@typebot.io/user/schemas";
import { Context, type Effect } from "effect";

export class ContactsAuthorization extends Context.Tag(
  "@typebot.io/ContactsAuthorization",
)<
  ContactsAuthorization,
  {
    readonly canListContacts: (
      audienceId: AudienceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canCreateContact: (
      audienceId: AudienceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canGetContact: (
      audienceId: AudienceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
  }
>() {}
