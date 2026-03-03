import { ORPCError } from "@orpc/server";
import { TypebotId } from "@typebot.io/domain-primitives/schemas";
import { type User, UserId } from "@typebot.io/user/schemas";
import { Effect, Schema } from "effect";
import { WhatsAppCampaignInputSchema } from "../core/Campaign";
import { Campaigns } from "../core/Campaigns";

export const CreateCampaignInputStandardSchema =
  WhatsAppCampaignInputSchema.pipe(
    Schema.extend(Schema.Struct({ typebotId: TypebotId })),
    Schema.standardSchemaV1,
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
    input: typeof CreateCampaignInputStandardSchema.Type;
    context: { user: Pick<User, "id"> };
  }) {
    const campaigns = yield* Campaigns;
    return yield* campaigns.createWhatsAppCampaign(
      {
        typebotId,
        userId: UserId.make(user.id),
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
  Effect.catchAllDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create campaign",
        cause: defect,
      }),
    ),
  ),
);
