import { parseBlockCredentials, parseBlockSchema } from "@typebot.io/forge";
import { auth } from "./auth";
import { deepSeekBlock } from "./index";

export const deepSeekBlockSchema = parseBlockSchema(deepSeekBlock);

export const deepSeekCredentialsSchema = parseBlockCredentials(
  deepSeekBlock.id,
  auth.schema,
);
