import { router } from "@/helpers/server/trpc";
import { generateGroupTitle } from "./generateGroupTitle";

export const aiFeaturesRouter = router({
  generateGroupTitle,
});
