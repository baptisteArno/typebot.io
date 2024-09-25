import { z } from "@typebot.io/zod";
import { IntegrationBlockType } from "../constants";
import { httpBlockSchemas } from "../webhook/schema";

export const makeComBlockSchemas = {
  v5: httpBlockSchemas.v5.merge(
    z.object({
      type: z.enum([IntegrationBlockType.MAKE_COM]),
    }),
  ),
  v6: httpBlockSchemas.v6
    .merge(
      z.object({
        type: z.enum([IntegrationBlockType.MAKE_COM]),
      }),
    )
    .openapi({
      title: "Make.com",
      ref: "makeComBlock",
    }),
} as const;

const makeComBlockSchema = z.union([
  makeComBlockSchemas.v5,
  makeComBlockSchemas.v6,
]);

export type MakeComBlock = z.infer<typeof makeComBlockSchema>;
