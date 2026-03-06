import {
  CampaignId,
  SegmentId,
  TypebotId,
} from "@typebot.io/shared-primitives/domain";
import { Schema } from "effect";

export const CampaignStatus = Schema.Literals([
  "DRAFT",
  "SCHEDULED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
]);
export type CampaignStatus = typeof CampaignStatus.Type;

const WhatsAppCampaignConfigSchema = Schema.Struct({
  templateId: Schema.NullOr(Schema.String),
});

export const CampaignName = Schema.NonEmptyString.pipe(
  Schema.brand("CampaignName"),
);

export class Campaign extends Schema.Class<Campaign>("Campaign")({
  id: CampaignId,
  createdAt: Schema.DateValid,
  updatedAt: Schema.DateValid,
  name: CampaignName,
  status: CampaignStatus,
  channel: Schema.Literal("WHATSAPP"),
  recipientSegmentId: Schema.NullOr(SegmentId),
  typebotId: TypebotId,
  whatsAppConfig: Schema.NullOr(WhatsAppCampaignConfigSchema),
}) {}
