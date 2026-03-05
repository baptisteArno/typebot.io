import type { Name, SpaceId } from "@typebot.io/domain-primitives/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";
import type { Segment } from "../core/Segment";
import type { AlreadyExistsError } from "../core/SegmentsErrors";

export class SegmentsRepo extends Context.Tag("@typebot.io/SegmentsRepo")<
  SegmentsRepo,
  {
    readonly listByWorkspaceAndSpace: (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
    ) => Effect.Effect<readonly Segment[]>;
    readonly create: (
      workspaceId: WorkspaceId,
      spaceId: SpaceId | undefined,
      input: { name: Name },
    ) => Effect.Effect<Segment, AlreadyExistsError>;
  }
>() {}
