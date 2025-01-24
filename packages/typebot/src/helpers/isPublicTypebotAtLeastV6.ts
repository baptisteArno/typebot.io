import type { PublicTypebot, PublicTypebotV6 } from "../schemas/publicTypebot";

export const isPublicTypebotAtLeastV6 = (
  typebot: PublicTypebot,
): typebot is PublicTypebotV6 => Number(typebot.version) >= 6;
