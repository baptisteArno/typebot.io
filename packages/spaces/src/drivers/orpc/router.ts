import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { PrismaLayer } from "@typebot.io/prisma/layer";
import { PrismaWorkspaceRepository } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceRepository";
import { Effect, Layer } from "effect";
import { SpacesUsecases } from "../../application/SpacesUsecases";
import { PrismaSpacesRepository } from "../../infrastructure/PrismaSpacesRepository";
import {
  CreateSpaceInputStandardSchema,
  handleCreateSpace,
} from "./handleCreateSpace";
import { handleListSpaces, listSpacesInputSchema } from "./handleListSpaces";

const SpacesInfrastructureLayer = Layer.mergeAll(
  PrismaSpacesRepository,
  PrismaWorkspaceRepository,
).pipe(Layer.provideMerge(PrismaLayer));

export const SpacesLiveLayer = Layer.provide(
  SpacesUsecases.layer,
  SpacesInfrastructureLayer,
);

const runSpacesEffectHandler = <A, E>(
  handler: Effect.Effect<A, E, SpacesUsecases>,
) => Effect.runPromise(handler.pipe(Effect.provide(SpacesLiveLayer)));

export const spacesRouter = {
  list: authenticatedProcedure
    .input(listSpacesInputSchema)
    .handler((props) => runSpacesEffectHandler(handleListSpaces(props))),
  create: authenticatedProcedure
    .input(CreateSpaceInputStandardSchema)
    .handler((props) => runSpacesEffectHandler(handleCreateSpace(props))),
};
