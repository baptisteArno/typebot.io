import type { ClientUser } from "@typebot.io/schemas/features/user/schema";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: ClientUser;
  }
}
