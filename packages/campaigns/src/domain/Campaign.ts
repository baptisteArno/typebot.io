import {
  CampaignId,
  SegmentId,
  TypebotId,
} from "@typebot.io/shared-core/domain";
import { Schema } from "effect";

export const CampaignStatus = Schema.Literal(
  "DRAFT",
  "SCHEDULED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
);
export type CampaignStatus = typeof CampaignStatus.Type;

const WhatsAppCampaignConfigSchema = Schema.Struct({
  templateId: Schema.NullOr(Schema.String),
});

export const CampaignName = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("CampaignName"),
);

export class Campaign extends Schema.Class<Campaign>("Campaign")({
  id: CampaignId,
  createdAt: Schema.ValidDateFromSelf,
  updatedAt: Schema.ValidDateFromSelf,
  name: CampaignName,
  status: CampaignStatus,
  channel: Schema.Literal("WHATSAPP"),
  recipientSegmentId: Schema.NullOr(SegmentId),
  typebotId: TypebotId,
  whatsAppConfig: Schema.Array(WhatsAppCampaignConfigSchema),
}) {}
