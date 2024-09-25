import { buttonItemSchemas } from "@typebot.io/blocks-inputs/choice/schema";
import { pictureChoiceItemSchemas } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import {
  aItemSchemas,
  bItemSchemas,
} from "@typebot.io/blocks-logic/abTest/schema";
import { conditionItemSchemas } from "@typebot.io/blocks-logic/condition/schema";
import { z } from "@typebot.io/zod";

const itemSchemas = {
  v5: z.union([
    buttonItemSchemas.v5,
    conditionItemSchemas.v5,
    pictureChoiceItemSchemas.v5,
    aItemSchemas.v5,
    bItemSchemas.v5,
  ]),
  v6: z.union([
    buttonItemSchemas.v6,
    conditionItemSchemas.v6,
    pictureChoiceItemSchemas.v6,
    aItemSchemas.v6,
    bItemSchemas.v6,
  ]),
} as const;

const itemSchema = z.union([itemSchemas.v5, itemSchemas.v6]);
export type Item = z.infer<typeof itemSchema>;
export type ItemV5 = z.infer<typeof itemSchemas.v5>;
export type ItemV6 = z.infer<typeof itemSchemas.v6>;
