import { env } from "@typebot.io/env";

export const isSelfHostedInstance = () => {
  if (typeof window !== "undefined") {
    return (
      window.location.hostname !== "app.typebot.io" &&
      window.location.hostname !== "localhost"
    );
  }
  return (
    env.NEXTAUTH_URL !== "https://app.typebot.io" &&
    !env.NEXTAUTH_URL.startsWith("http://localhost")
  );
};
