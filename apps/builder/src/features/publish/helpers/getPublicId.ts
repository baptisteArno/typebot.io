import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { toKebabCase } from "@/helpers/toKebabCase";

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
