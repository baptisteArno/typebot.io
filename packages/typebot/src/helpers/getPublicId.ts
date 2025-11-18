import { isNotEmpty } from "@typebot.io/lib/utils";
import type { TypebotV6 } from "../schemas/typebot";

export const getPublicId = (
  typebot?: Pick<TypebotV6, "name" | "id" | "publicId">,
) => {
  return typebot?.publicId ?? parseDefaultPublicId(typebot?.name, typebot?.id);
};

const parseDefaultPublicId = (name?: string, id?: string) => {
  if (!name || !id) return "";
  const prefix = toKebabCase(name);
  return `${prefix !== "" ? `${prefix}-` : ""}${id?.slice(-7)}`;
};

const toKebabCase = (value: string) => {
  const matched = value.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
  );
  if (!matched) return "";
  return matched
    .filter(isNotEmpty)
    .map((x) => x.toLowerCase())
    .join("-");
};
