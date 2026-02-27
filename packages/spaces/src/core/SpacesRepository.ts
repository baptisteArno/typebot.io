import type { Icon, Name } from "@typebot.io/domain-primitives/schemas";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Context, type Effect } from "effect";
import type { AudienceId, Space } from "./Space";
import type { AlreadyExistsError } from "./SpacesErrors";

export class SpacesRepository extends Context.Tag(
  "@typebot.io/SpacesRepository",
)<
  SpacesRepository,
  {
    readonly listByWorkspaceId: (
      workspaceId: WorkspaceId,
    ) => Effect.Effect<readonly Space[]>;
    readonly create: (
      workspaceId: WorkspaceId,
      input: {
        name: Name;
        icon?: Icon;
        audienceId?: AudienceId;
      },
    ) => Effect.Effect<Space, AlreadyExistsError>;
  }
>() {}
