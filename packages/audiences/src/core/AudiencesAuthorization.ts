import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";

export class AudiencesAuthorization extends Context.Tag(
  "@typebot.io/AudiencesAuthorization",
)<
  AudiencesAuthorization,
  {
    readonly canListAudiences: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canCreateAudience: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
  }
>() {}
