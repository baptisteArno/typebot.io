import { SpaceId, WorkspaceId } from "@typebot.io/shared-core/domain";
import { Emoji, ImageSrc } from "@typebot.io/shared-core/schemas";
import { Schema } from "effect";

export const SpaceIcon = Schema.Union([Emoji, ImageSrc]);
export type SpaceIcon = typeof SpaceIcon.Type;

export const SpaceName = Schema.NonEmptyString.pipe(Schema.brand("SpaceName"));
export type SpaceName = typeof SpaceName.Type;

export class Space extends Schema.Class<Space>("Space")({
  id: SpaceId,
  name: SpaceName,
  icon: Schema.NullOr(SpaceIcon),
  workspaceId: WorkspaceId,
  createdAt: Schema.DateValid,
  updatedAt: Schema.DateValid,
}) {}
