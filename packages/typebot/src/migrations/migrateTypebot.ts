import { isPublicTypebotAtLeastV6 } from "../helpers/isPublicTypebotAtLeastV6";
import { isTypebotAtLeastV6 } from "../helpers/isTypebotAtLeastV6";
import type { PublicTypebot, PublicTypebotV6 } from "../schemas/publicTypebot";
import type { Typebot, TypebotV6 } from "../schemas/typebot";
import { migrateTypebotFromV3ToV4 } from "./migrateTypebotFromV3ToV4";
import { migrateTypebotFromV5ToV6 } from "./migrateTypebotFromV5ToV6";

export const migrateTypebot = async (
  typebot: Typebot,
): Promise<{ typebot: TypebotV6; wasMigrated: boolean }> => {
  if (isTypebotAtLeastV6(typebot)) return { typebot, wasMigrated: false };
  let migratedTypebot: any = typebot;
  if (migratedTypebot.version === "3")
    migratedTypebot = await migrateTypebotFromV3ToV4(typebot);
  if (migratedTypebot.version === "4" || migratedTypebot.version === "5")
    migratedTypebot = await migrateTypebotFromV5ToV6(migratedTypebot);
  return { typebot: migratedTypebot, wasMigrated: true };
};

export const migratePublicTypebot = async (
  publicTypebot: PublicTypebot,
): Promise<PublicTypebotV6> => {
  if (isPublicTypebotAtLeastV6(publicTypebot)) return publicTypebot;
  let migratedTypebot: any = publicTypebot;
  if (migratedTypebot.version === "3")
    migratedTypebot = await migrateTypebotFromV3ToV4(publicTypebot);
  if (migratedTypebot.version === "4" || migratedTypebot.version === "5")
    migratedTypebot = migrateTypebotFromV5ToV6(migratedTypebot);
  return migratedTypebot;
};
