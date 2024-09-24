import { z } from "@typebot.io/zod";
import { abTestBlockSchemas } from "./abTest/schema";
import { conditionBlockSchemas } from "./condition/schema";
import { jumpBlockSchema } from "./jump/schema";
import { redirectBlockSchema } from "./redirect/schema";
import { scriptBlockSchema } from "./script/schema";
import { setVariableBlockSchema } from "./setVariable/schema";
import { typebotLinkBlockSchema } from "./typebotLink/schema";
import { waitBlockSchema } from "./wait/schema";

const logicBlockSchemas = [
  scriptBlockSchema,
  redirectBlockSchema,
  setVariableBlockSchema,
  typebotLinkBlockSchema,
  waitBlockSchema,
  jumpBlockSchema,
] as const;

export const logicBlockV5Schema = z.discriminatedUnion("type", [
  ...logicBlockSchemas,
  conditionBlockSchemas.v5,
  abTestBlockSchemas.v5,
]);
export type LogicBlockV5 = z.infer<typeof logicBlockV5Schema>;

export const logicBlockV6Schema = z.discriminatedUnion("type", [
  ...logicBlockSchemas,
  conditionBlockSchemas.v6,
  abTestBlockSchemas.v6,
]);
export type LogicBlockV6 = z.infer<typeof logicBlockV6Schema>;

export type LogicBlock = LogicBlockV5 | LogicBlockV6;
