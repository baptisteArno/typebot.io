import { edgeSchema } from "./schemas/edge";

export const preprocessTypebot = (typebot: any) => {
  if (!typebot || typebot.version === "5" || typebot.version === "6")
    return typebot;
  return {
    ...typebot,
    version:
      typebot.version === undefined || typebot.version === null
        ? "3"
        : typebot.version,
    groups: typebot.groups ? typebot.groups.map(preprocessGroup) : [],
    events: null,
    edges: typebot.edges
      ? typebot.edges?.filter((edge: any) => edgeSchema.safeParse(edge).success)
      : [],
  };
};

export const preprocessGroup = (group: any) => ({
  ...group,
  blocks: group.blocks ?? [],
});

export const preprocessColumnsWidthResults = (arg: unknown) =>
  Array.isArray(arg) && arg.length === 0 ? {} : arg;
