import { z } from "@typebot.io/zod";
import { IntegrationBlockType } from "../constants";
import { httpBlockSchemas } from "../webhook/schema";

export const pabblyConnectBlockSchemas = {
  v5: httpBlockSchemas.v5.merge(
    z.object({
      type: z.enum([IntegrationBlockType.PABBLY_CONNECT]),
    }),
  ),
  v6: httpBlockSchemas.v6
    .merge(
      z.object({
        type: z.enum([IntegrationBlockType.PABBLY_CONNECT]),
      }),
    )
    .openapi({
      title: "Pabbly Connect",
      ref: "pabblyConnectBlock",
    }),
} as const;

const pabblyConnectBlockSchema = z.union([
  pabblyConnectBlockSchemas.v5,
  pabblyConnectBlockSchemas.v6,
]);

export type PabblyConnectBlock = z.infer<typeof pabblyConnectBlockSchema>;
