import type { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";
import type { SegmentsAlreadyExistsError } from "../domain/errors";
import type { Segment } from "../domain/Segment";
import type { SegmentCreateInput } from "./SegmentCreateInput";

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
      input: SegmentCreateInput,
    ) => Effect.Effect<Segment, SegmentsAlreadyExistsError>;
  }
>() {}
