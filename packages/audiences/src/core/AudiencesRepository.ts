import type { Name } from "@typebot.io/domain-primitives/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";
import type { Audience } from "./Audience";
import type { AlreadyExistsError } from "./AudiencesErrors";

export class AudiencesRepository extends Context.Tag(
  "@typebot.io/AudiencesRepository",
)<
  AudiencesRepository,
  {
    readonly listByWorkspaceId: (
      workspaceId: WorkspaceId,
    ) => Effect.Effect<readonly Audience[]>;
    readonly create: (
      workspaceId: WorkspaceId,
      input: { name: Name },
    ) => Effect.Effect<Audience, AlreadyExistsError>;
  }
>() {}
