import type { TypebotV6Version } from "../versions";

export const isTypebotVersionAtLeastV6 = (
  version: string | null,
): version is TypebotV6Version => Number(version) >= 6;
