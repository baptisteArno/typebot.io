export const latestTypebotVersion = "6.1" as const;
export const typebotV6Versions = ["6", latestTypebotVersion] as const;
export type TypebotV6Version = (typeof typebotV6Versions)[number];
