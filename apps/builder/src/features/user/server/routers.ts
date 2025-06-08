import { router } from "@/helpers/server/trpc";
import { acceptTerms } from "./acceptTerms";
import { updateUser } from "./updateUser";

export const publicUserRouter = router({
  update: updateUser,
});

export const internalUserRouter = router({
  acceptTerms,
});
