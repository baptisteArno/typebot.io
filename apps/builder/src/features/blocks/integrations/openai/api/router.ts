import { router } from "@/helpers/server/trpc";
import { listModels } from "./listModels";

export const openAIRouter = router({
  listModels,
});
