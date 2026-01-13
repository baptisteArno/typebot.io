import type { ClientUser } from "@typebot.io/user/schemas";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: ClientUser;
  }
}
