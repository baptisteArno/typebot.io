import type { User } from "@typebot.io/user/schemas";

export const handleGetMe = ({
  context: { user },
}: {
  context: { user: Pick<User, "id" | "email"> };
}) => ({
  id: user.id,
  email: user.email,
});
