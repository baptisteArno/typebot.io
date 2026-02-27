import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import {
  CreateAudienceInputSchema,
  handleCreateAudience,
} from "./handleCreateAudience";
import {
  handleListAudiences,
  listAudiencesInputSchema,
} from "./handleListAudiences";

export const audiencesRouter = {
  list: authenticatedProcedure
    .input(listAudiencesInputSchema)
    .handler(handleListAudiences),
  create: authenticatedProcedure
    .input(CreateAudienceInputSchema)
    .handler(handleCreateAudience),
};
