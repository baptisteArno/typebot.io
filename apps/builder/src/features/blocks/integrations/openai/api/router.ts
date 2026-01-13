import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { handleListModels, listModelsInputSchema } from "./handleListModels";

export const openAIRouter = {
  listModels: authenticatedProcedure
    .input(listModelsInputSchema)
    .handler(handleListModels),
};
