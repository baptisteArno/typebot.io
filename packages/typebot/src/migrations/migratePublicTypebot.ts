import type { PublicTypebot, PublicTypebotV6 } from "../schemas/publicTypebot";
import { migrateTypebotFromV3ToV4 } from "./migrateTypebotFromV3ToV4";
import { migrateTypebotFromV5ToV6 } from "./migrateTypebotFromV5ToV6";

export const migrateTypebot = async (
  typebot: PublicTypebot,
): Promise<PublicTypebotV6> => {
  if (typebot.version === "6") return typebot;
  let migratedTypebot: any = typebot;
  if (migratedTypebot.version === "3")
    migratedTypebot = await migrateTypebotFromV3ToV4(typebot);
  if (migratedTypebot.version === "4" || migratedTypebot.version === "5")
    migratedTypebot = migrateTypebotFromV5ToV6(migratedTypebot);
  return migratedTypebot;
};
