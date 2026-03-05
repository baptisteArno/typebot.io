import { Schema } from "effect";
import {
  CampaignId,
  CredentialsId,
  Name,
  SegmentId,
  TypebotId,
} from "../shared-primitives";

export const CampaignStatus = Schema.Literal(
  "DRAFT",
  "SCHEDULED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
);
export type CampaignStatus = typeof CampaignStatus.Type;

const TemplateId = Schema.String.pipe(Schema.brand("TemplateId"));
export type TemplateId = typeof TemplateId.Type;

const WhatsAppCampaignConfigSchema = Schema.Struct({
  templateId: Schema.NullOr(Schema.String),
});

export class Campaign extends Schema.Class<Campaign>("Campaign")({
  id: CampaignId,
  createdAt: Schema.ValidDateFromSelf,
  updatedAt: Schema.ValidDateFromSelf,
  name: Name,
  status: CampaignStatus,
  channel: Schema.Literal("WHATSAPP"),
  recipientSegmentId: Schema.NullOr(SegmentId),
  typebotId: TypebotId,
  whatsAppConfig: Schema.Array(WhatsAppCampaignConfigSchema),
}) {}

export const WhatsAppCampaignInputSchema = Schema.Struct({
  channel: Schema.Literal("WHATSAPP"),
  name: Name,
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

export const CampaignUpdateInputSchema = Schema.Struct({
  status: Schema.optional(CampaignStatus),
  recipientSegmentId: Schema.optional(Schema.NullOr(SegmentId)),
  templateId: Schema.optional(Schema.NullOr(Schema.String)),
});
export type CampaignUpdateInput = typeof CampaignUpdateInputSchema.Type;
