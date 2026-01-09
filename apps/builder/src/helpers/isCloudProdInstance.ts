import { env } from "@typebot.io/env";

export const isCloudProdInstance = () => {
  if (typeof window !== "undefined") {
    return window.location.hostname === "app.typebot.io";
  }
  return env.BETTER_AUTH_URL === "https://app.typebot.io";
};
