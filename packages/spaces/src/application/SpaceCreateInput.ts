import { Schema } from "effect";
import { SpaceIcon, SpaceName } from "../domain/Space";

export const SpaceCreateInputSchema = Schema.Struct({
  name: SpaceName,
  icon: Schema.optional(SpaceIcon),
});
export type SpaceCreateInput = typeof SpaceCreateInputSchema.Type;
