import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import { env } from "@typebot.io/env";
import type { BotProps } from "@typebot.io/js";
import { isDefined } from "@typebot.io/lib/utils";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import parserBabel from "prettier/parser-babel";
import prettier from "prettier/standalone";
import packageJson from "../../../../../../../../packages/embeds/js/package.json";

export const parseStringParam = (
  fieldName: string,
  fieldValue?: string,
  defaultValue?: string,
) => {
  if (!fieldValue) return "";
  if (isDefined(defaultValue) && fieldValue === defaultValue) return "";
  return `${fieldName}: "${fieldValue}",`;
};

export const parseNumberOrBoolParam = (
  fieldName: string,
  fieldValue?: number | boolean,
) => (isDefined(fieldValue) ? `${fieldName}: ${fieldValue},` : ``);

export const parseBotProps = ({ typebot, apiHost }: BotProps) => {
  const typebotLine = parseStringParam("typebot", typebot as string);
  const apiHostLine = parseStringParam("apiHost", apiHost);
  return `${typebotLine}${apiHostLine}`;
};

export const parseReactStringParam = (
  fieldName: string,
  fieldValue?: string,
) => (fieldValue ? `${fieldName}="${fieldValue}"` : ``);

export const parseReactNumberOrBoolParam = (
  fieldName: string,
  fieldValue?: number | boolean,
) => (isDefined(fieldValue) ? `${fieldName}={${fieldValue}}` : ``);

export const parseReactBotProps = ({ typebot, apiHost }: BotProps) => {
  const typebotLine = parseReactStringParam("typebot", typebot as string);
  const apiHostLine = parseReactStringParam("apiHost", apiHost);
  return `${typebotLine} ${apiHostLine}`;
};

export const typebotImportCode = isCloudProdInstance()
  ? `import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.3/dist/web.js'`
  : `import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@${packageJson.version}/dist/web.js'`;

export const parseInlineScript = (script: string) =>
  prettier.format(
    `const typebotInitScript = document.createElement("script");
  typebotInitScript.type = "module";
  typebotInitScript.innerHTML = \`${script}\`;
  document.body.append(typebotInitScript);`,
    { parser: "babel", plugins: [parserBabel] },
  );

export const parseApiHost = (
  customDomain: Typebot["customDomain"] | undefined,
) => {
  if (customDomain) return new URL(`https://${customDomain}`).origin;
  return env.NEXT_PUBLIC_VIEWER_URL.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL[0];
};

export const parseApiHostValue = (
  customDomain: Typebot["customDomain"] | undefined,
) => {
  if (isCloudProdInstance()) return;
  return parseApiHost(customDomain);
};
