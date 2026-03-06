import { CredentialsId, SegmentId } from "@typebot.io/shared-primitives/domain";
import { Schema } from "effect";
import { CampaignName } from "../domain/Campaign";

const TemplateId = Schema.String.pipe(Schema.brand("TemplateId"));

export const WhatsAppCampaignInputSchema = Schema.Struct({
  channel: Schema.Literal("WHATSAPP"),
  name: CampaignName,
  segmentId: Schema.optional(SegmentId),
  templateId: TemplateId,
  credentialsId: CredentialsId,
  templateAttributesMapping: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.String.pipe(Schema.nonEmptyString()),
    }),
  ),
});
export type WhatsAppCampaignInput = typeof WhatsAppCampaignInputSchema.Type;
