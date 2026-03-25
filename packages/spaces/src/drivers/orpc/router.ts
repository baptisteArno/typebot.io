import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { PostHogFeatureFlagsLayer } from "@typebot.io/feature-flags/infrastructure/PostHogFeatureFlags";
import { PrismaLayer } from "@typebot.io/prisma/layer";
import { WorkspaceAccessPolicies } from "@typebot.io/workspaces/application/WorkspaceAccessPolicies";
import { PrismaWorkspaceRepo } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceRepo";
import { Effect, Layer, Schema } from "effect";
import {
  ListSpacesInputSchema,
  SpaceCreateInputSchema,
  SpaceDeleteInputSchema,
  SpacePatchInputSchema,
} from "../../application/SpacesRepo";
import { SpacesUsecases } from "../../application/SpacesUsecases";
import { PrismaSpacesRepo } from "../../infrastructure/PrismaSpacesRepo";
import { handleCreateSpace } from "./handleCreateSpace";
import { handleDeleteSpace } from "./handleDeleteSpace";
import { handleListSpaces } from "./handleListSpaces";
import { handlePatchSpace } from "./handlePatchSpace";

const WorkspaceAccessPolicyLiveLayer = Layer.provide(
  WorkspaceAccessPolicies.layer,
  Layer.provide(PrismaWorkspaceRepo, PrismaLayer),
);

const SpacesRepoLiveLayer = Layer.provide(PrismaSpacesRepo, PrismaLayer);

const SpacesUsecasesLiveLayer = Layer.provide(
  SpacesUsecases.layer,
  Layer.mergeAll(
    WorkspaceAccessPolicyLiveLayer,
    SpacesRepoLiveLayer,
    PostHogFeatureFlagsLayer,
  ),
);

const runSpacesEffectHandler = <A, E>(
  handler: Effect.Effect<A, E, SpacesUsecases>,
) => Effect.runPromise(handler.pipe(Effect.provide(SpacesUsecasesLiveLayer)));

export const spacesRouter = {
  list: authenticatedProcedure
    .input(ListSpacesInputSchema.pipe(Schema.toStandardSchemaV1))
    .handler((props) => runSpacesEffectHandler(handleListSpaces(props))),
  create: authenticatedProcedure
    .input(SpaceCreateInputSchema.pipe(Schema.toStandardSchemaV1))
    .handler((props) => runSpacesEffectHandler(handleCreateSpace(props))),
  patch: authenticatedProcedure
    .route({
      method: "PATCH",
      path: "/v1/workspaces/{workspaceId}/spaces/{spaceId}",
      summary: "Update a space",
      tags: ["Space"],
    })
    .input(SpacePatchInputSchema.pipe(Schema.toStandardSchemaV1))
    .handler((props) => runSpacesEffectHandler(handlePatchSpace(props))),
  delete: authenticatedProcedure
    .input(SpaceDeleteInputSchema.pipe(Schema.toStandardSchemaV1))
    .handler((props) => runSpacesEffectHandler(handleDeleteSpace(props))),
};
