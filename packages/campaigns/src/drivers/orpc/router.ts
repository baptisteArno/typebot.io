import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { PrismaLayer } from "@typebot.io/prisma/layer";
import { PrismaTypebotRepository } from "@typebot.io/typebot/infrastructure/PrismaTypebotRepository";
import { Effect, Layer } from "effect";
import { CampaignsUsecases } from "../../application/CampaignsUsecases";
import { PrismaCampaignsRepository } from "../../infrastructure/PrismaCampaignsRepository";
import {
  CreateCampaignInputStandardSchema,
  handleCreateCampaign,
} from "./handleCreateCampaign";
import {
  deleteCampaignInputSchema,
  handleDeleteCampaign,
} from "./handleDeleteCampaign";
import { getCampaignInputSchema, handleGetCampaign } from "./handleGetCampaign";
import {
  handleListCampaigns,
  listCampaignsInputSchema,
} from "./handleListCampaigns";
import {
  handleUpdateCampaign,
  UpdateCampaignInputStandardSchema,
} from "./handleUpdateCampaign";

const CampaignsInfrastructureLayer = Layer.mergeAll(
  PrismaCampaignsRepository,
  PrismaTypebotRepository,
).pipe(Layer.provideMerge(PrismaLayer));

export const CampaignsLiveLayer = Layer.provide(
  CampaignsUsecases.layer,
  CampaignsInfrastructureLayer,
);

const runCampaignsEffectHandler = <A, E>(
  handler: Effect.Effect<A, E, CampaignsUsecases>,
) => Effect.runPromise(handler.pipe(Effect.provide(CampaignsLiveLayer)));

export const campaignsRouter = {
  list: authenticatedProcedure
    .input(listCampaignsInputSchema)
    .handler((props) => runCampaignsEffectHandler(handleListCampaigns(props))),
  create: authenticatedProcedure
    .input(CreateCampaignInputStandardSchema)
    .handler((props) => runCampaignsEffectHandler(handleCreateCampaign(props))),
  get: authenticatedProcedure
    .input(getCampaignInputSchema)
    .handler((props) => runCampaignsEffectHandler(handleGetCampaign(props))),
  update: authenticatedProcedure
    .input(UpdateCampaignInputStandardSchema)
    .handler((props) => runCampaignsEffectHandler(handleUpdateCampaign(props))),
  delete: authenticatedProcedure
    .input(deleteCampaignInputSchema)
    .handler((props) => runCampaignsEffectHandler(handleDeleteCampaign(props))),
};
