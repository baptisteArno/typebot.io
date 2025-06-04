import { router } from "@/helpers/server/trpc";
import { updateUser } from "./updateUser";

export const userRouter = router({
  update: updateUser,
});
