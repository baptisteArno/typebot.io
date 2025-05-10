import { router } from "@/helpers/server/trpc";
import { sendUpdateEmailVerifCodeEmail } from "./sendUpdateEmailVerifCodeEmail";
import { updateUserEmail } from "./updateUserEmail";

export const authRouter = router({
  sendUpdateEmailVerifCodeEmail,
  updateUserEmail,
});
