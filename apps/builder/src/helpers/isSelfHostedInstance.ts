import { env } from "@typebot.io/env";

export const isSelfHostedInstance = () => {
  if (typeof window !== "undefined") {
    return (
      window.location.hostname !== "app.typebot.io" &&
      window.location.hostname !== "localhost"
    );
  }
  return (
    env.BETTER_AUTH_URL !== "https://app.typebot.io" &&
    !env.BETTER_AUTH_URL.startsWith("http://localhost")
  );
};
