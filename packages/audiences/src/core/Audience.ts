import { Name, SpaceId } from "@typebot.io/domain-primitives/schemas";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Schema } from "effect";

export const AudienceId = Schema.String.pipe(Schema.brand("AudienceId"));
export type AudienceId = typeof AudienceId.Type;

export class Audience extends Schema.Class<Audience>("Audience")({
  id: AudienceId,
  name: Name,
  workspaceId: WorkspaceId,
  createdAt: Schema.ValidDateFromSelf,
  updatedAt: Schema.ValidDateFromSelf,
}) {}

export const AudienceCreateInputSchema = Schema.Struct({
  name: Name.pipe(Schema.minLength(1)),
  spaceId: Schema.optional(SpaceId),
});
export type AudienceCreateInputSchema = typeof AudienceCreateInputSchema.Type;
export const AudienceCreateInputStandardSchema = AudienceCreateInputSchema.pipe(
  Schema.standardSchemaV1,
);
