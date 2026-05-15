import prisma from "@typebot.io/prisma";
import { decryptSecretValue } from "./decryptSecretValue";

export const getWorkspaceSecretsByNames = async ({
  workspaceId,
  names,
}: {
  workspaceId: string;
  names: string[];
}): Promise<Map<string, string>> => {
  const resolved = new Map<string, string>();
  if (names.length === 0) return resolved;
  const rows = await prisma.workspaceSecret.findMany({
    where: { workspaceId, name: { in: names } },
    select: { name: true, data: true, iv: true },
  });
  for (const row of rows) {
    const value = await decryptSecretValue(row.data, row.iv);
    resolved.set(row.name, value);
  }
  return resolved;
};
