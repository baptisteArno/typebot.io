import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { PrismaLayer } from "@typebot.io/prisma/layer";
import { PrismaWorkspaceAuthorization } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceAuthorization";
import { Effect, Layer } from "effect";
import { SpacesUsecases } from "../../application/SpacesUsecases";
import { PrismaSpacesAuthorization } from "../../infrastructure/PrismaSpacesAuthorization";
import { PrismaSpacesRepository } from "../../infrastructure/PrismaSpacesRepository";
import { CreateSpaceInputSchema, handleCreateSpace } from "./handleCreateSpace";
import { handleListSpaces, listSpacesInputSchema } from "./handleListSpaces";

const SpacesInfrastructureLayer = Layer.mergeAll(
  PrismaSpacesAuthorization,
  PrismaSpacesRepository,
).pipe(
  Layer.provideMerge(PrismaWorkspaceAuthorization),
  Layer.provideMerge(PrismaLayer),
);

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
    .input(CreateSpaceInputSchema)
    .handler((props) => runSpacesEffectHandler(handleCreateSpace(props))),
};
