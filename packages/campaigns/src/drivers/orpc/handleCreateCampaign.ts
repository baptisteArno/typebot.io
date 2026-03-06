import { ORPCError } from "@orpc/server";
import { TypebotId } from "@typebot.io/shared-primitives/domain";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import { CampaignsUsecases } from "../../application/CampaignsUsecases";
import { WhatsAppCampaignInputSchema } from "../../application/WhatsAppCampaignInput";

const CreateCampaignInputSchema = Schema.Struct({
  typebotId: TypebotId,
  channel: WhatsAppCampaignInputSchema.fields.channel,
  name: WhatsAppCampaignInputSchema.fields.name,
  segmentId: WhatsAppCampaignInputSchema.fields.segmentId,
  templateId: WhatsAppCampaignInputSchema.fields.templateId,
  credentialsId: WhatsAppCampaignInputSchema.fields.credentialsId,
  templateAttributesMapping:
    WhatsAppCampaignInputSchema.fields.templateAttributesMapping,
});

export const CreateCampaignInputStandardSchema = Schema.toStandardSchemaV1(
  CreateCampaignInputSchema,
);

export const handleCreateCampaign = Effect.fn("handleCreateCampaign")(
  function* ({
    input: {
      typebotId,
      channel,
      name,
      templateId,
      credentialsId,
      templateAttributesMapping,
    },
    context: { user },
  }: {
    input: typeof CreateCampaignInputSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const campaignsUsecases = yield* CampaignsUsecases;
    const userId = Schema.decodeSync(UserId)(user.id);
    return yield* campaignsUsecases.createWhatsAppCampaign(
      {
        typebotId,
        userId,
      },
      { channel, name, templateId, credentialsId, templateAttributesMapping },
    );
  },
  Effect.catchTags({
    CampaignsForbiddenError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Typebot not found" as const,
        }),
      ),
  }),
  Effect.catchDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create campaign",
        cause: defect,
      }),
    ),
  ),
);
