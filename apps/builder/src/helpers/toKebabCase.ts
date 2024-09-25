import { isNotEmpty } from "@typebot.io/lib/utils";

export const toKebabCase = (value: string) => {
  const matched = value.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
  );
  if (!matched) return "";
  return matched
    .filter(isNotEmpty)
    .map((x) => x.toLowerCase())
    .join("-");
};
