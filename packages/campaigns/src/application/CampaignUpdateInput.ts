import { SegmentId } from "@typebot.io/shared-primitives/domain";
import { Schema } from "effect";
import { CampaignStatus } from "../domain/Campaign";

export const CampaignUpdateInputSchema = Schema.Struct({
  status: Schema.optional(CampaignStatus),
  recipientSegmentId: Schema.optional(Schema.NullOr(SegmentId)),
  templateId: Schema.optional(Schema.NullOr(Schema.String)),
});
export type CampaignUpdateInput = typeof CampaignUpdateInputSchema.Type;
