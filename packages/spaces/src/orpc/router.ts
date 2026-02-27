import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { CreateSpaceInputSchema, handleCreateSpace } from "./handleCreateSpace";
import { handleListSpaces, listSpacesInputSchema } from "./handleListSpaces";

export const spacesRouter = {
  list: authenticatedProcedure
    .input(listSpacesInputSchema)
    .handler(handleListSpaces),
  create: authenticatedProcedure
    .input(CreateSpaceInputSchema)
    .handler(handleCreateSpace),
};
