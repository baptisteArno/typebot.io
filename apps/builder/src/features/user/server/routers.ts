import { router } from "@/helpers/server/trpc";
import { acceptTerms } from "./acceptTerms";
import { createApiToken } from "./createApiToken";
import { deleteApiToken } from "./deleteApiToken";
import { listApiTokens } from "./listApiTokens";
import { updateUser } from "./updateUser";

export const publicUserRouter = router({
  update: updateUser,
  listApiTokens,
  createApiToken,
  deleteApiToken,
});

export const internalUserRouter = router({
  acceptTerms,
});
