import { getRuntimeVariable } from "@typebot.io/env/getRuntimeVariable";

const cloudFallback = "partykit.typebot.io";

export const getPartyKitHost = (hostFromContext?: string) =>
  hostFromContext ??
  getRuntimeVariable("NEXT_PUBLIC_PARTYKIT_HOST") ??
  cloudFallback;
