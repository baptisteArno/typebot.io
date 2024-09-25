import { sendRequest } from "@typebot.io/lib/utils";
import type { User } from "@typebot.io/schemas/features/user/schema";

export const updateUserQuery = async (id: string, user: Partial<User>) =>
  sendRequest({
    url: `/api/users/${id}`,
    method: "PATCH",
    body: user,
  });
