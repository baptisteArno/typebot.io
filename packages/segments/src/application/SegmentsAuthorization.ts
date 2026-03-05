import type { UserId } from "@typebot.io/user/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";

export class SegmentsAuthorization extends Context.Tag(
  "@typebot.io/SegmentsAuthorization",
)<
  SegmentsAuthorization,
  {
    readonly canReadSegments: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
    readonly canWriteSegments: (
      workspaceId: WorkspaceId,
      userId: UserId,
    ) => Effect.Effect<boolean>;
  }
>() {}
