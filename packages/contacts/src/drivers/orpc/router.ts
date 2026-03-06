import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { PrismaLayer } from "@typebot.io/prisma/layer";
import { PrismaWorkspaceRepository } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceRepository";
import { Effect, Layer, Schema } from "effect";
import { ContactPropertyDefinitionsUsecases } from "../../application/ContactPropertyDefinitionsUsecases";
import {
  ContactCreateInputSchema,
  ContactsUsecases,
} from "../../application/ContactsUsecases";
import { PrismaContactPropertyDefinitionsRepository } from "../../infrastructure/PrismaContactPropertyDefinitionsRepository";
import { PrismaContactsRepository } from "../../infrastructure/PrismaContactsRepository";
import { handleCreateContact } from "./handleCreateContact";
import { getContactInputSchema, handleGetContact } from "./handleGetContact";
import {
  handleListContacts,
  listContactsInputSchema,
} from "./handleListContacts";

const ContactsInfrastructureLayer = Layer.mergeAll(
  PrismaContactsRepository,
  PrismaWorkspaceRepository,
).pipe(Layer.provideMerge(PrismaLayer));

const ContactPropertyDefinitionsInfrastructureLayer = Layer.mergeAll(
  PrismaContactPropertyDefinitionsRepository,
  PrismaWorkspaceRepository,
).pipe(Layer.provideMerge(PrismaLayer));

const AllContactsInfrastructureLayer = Layer.mergeAll(
  ContactsInfrastructureLayer,
  ContactPropertyDefinitionsInfrastructureLayer,
);

export const ContactsLiveLayer = Layer.mergeAll(
  Layer.provide(ContactsUsecases.layer, AllContactsInfrastructureLayer),
  Layer.provide(
    ContactPropertyDefinitionsUsecases.layer,
    ContactPropertyDefinitionsInfrastructureLayer,
  ),
);

const runContactsEffectHandler = <A, E>(
  handler: Effect.Effect<A, E, ContactsUsecases>,
) => Effect.runPromise(handler.pipe(Effect.provide(ContactsLiveLayer)));

export const contactsRouter = {
  list: authenticatedProcedure
    .input(listContactsInputSchema)
    .handler((props) => runContactsEffectHandler(handleListContacts(props))),
  create: authenticatedProcedure
    .input(Schema.toStandardSchemaV1(ContactCreateInputSchema))
    .handler((props) => runContactsEffectHandler(handleCreateContact(props))),
  get: authenticatedProcedure
    .input(getContactInputSchema)
    .handler((props) => runContactsEffectHandler(handleGetContact(props))),
};
