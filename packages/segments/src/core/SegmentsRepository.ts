import type { Name, SpaceId } from "@typebot.io/domain-primitives/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";
import type { Segment } from "./Segment";
import type { AlreadyExistsError } from "./SegmentsErrors";

export class SegmentsRepository extends Context.Tag(
  "@typebot.io/SegmentsRepository",
)<
  SegmentsRepository,
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
