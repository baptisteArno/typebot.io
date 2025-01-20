import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import type { TypebotV6Version } from "@typebot.io/schemas/versions";
import { z } from "@typebot.io/zod";
import {
  type GroupV5,
  type GroupV6,
  groupV5Schema,
  groupV6Schema,
} from "../schemas";

export const parseGroups = <T extends string | null>(
  groups: unknown,
  { typebotVersion }: { typebotVersion: T },
): T extends TypebotV6Version ? GroupV6[] : GroupV5[] => {
  if (isTypebotVersionAtLeastV6(typebotVersion)) {
    return z.array(groupV6Schema).parse(groups) as T extends TypebotV6Version
      ? GroupV6[]
      : GroupV5[];
  }
  return z.array(groupV5Schema).parse(groups) as T extends TypebotV6Version
    ? GroupV6[]
    : GroupV5[];
};
