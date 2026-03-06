import type { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { type Effect, ServiceMap } from "effect";
import type { SegmentsAlreadyExistsError } from "../domain/errors";
import type { Segment } from "../domain/Segment";
import type { SegmentCreateInput } from "./SegmentCreateInput";

export class SegmentsRepo extends ServiceMap.Service<
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
>()("@typebot.io/SegmentsRepo") {}
