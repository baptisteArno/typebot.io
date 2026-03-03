import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { PrismaLayer } from "@typebot.io/prisma/layer";
import { PrismaWorkspaceAuthorization } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceAuthorization";
import { Effect, Layer } from "effect";
import { Contacts } from "../core/Contacts";
import { PrismaContactsAuthorization } from "../infrastructure/PrismaContactsAuthorization";
import { PrismaContactsRepository } from "../infrastructure/PrismaContactsRepository";
import {
  CreateContactInputStandardSchema,
  handleCreateContact,
} from "./handleCreateContact";
import { getContactInputSchema, handleGetContact } from "./handleGetContact";
import {
  handleListContacts,
  listContactsInputSchema,
} from "./handleListContacts";

const ContactsInfrastructureLayer = Layer.mergeAll(
  PrismaContactsAuthorization,
  PrismaContactsRepository,
).pipe(
  Layer.provideMerge(PrismaWorkspaceAuthorization),
  Layer.provideMerge(PrismaLayer),
);

export const ContactsLiveLayer = Layer.provide(
  Contacts.layer,
  ContactsInfrastructureLayer,
);

const runContactsEffectHandler = <A, E>(
  handler: Effect.Effect<A, E, Contacts>,
) => Effect.runPromise(handler.pipe(Effect.provide(ContactsLiveLayer)));

export const contactsRouter = {
  list: authenticatedProcedure
    .input(listContactsInputSchema)
    .handler((props) => runContactsEffectHandler(handleListContacts(props))),
  create: authenticatedProcedure
    .input(CreateContactInputStandardSchema)
    .handler((props) => runContactsEffectHandler(handleCreateContact(props))),
  get: authenticatedProcedure
    .input(getContactInputSchema)
    .handler((props) => runContactsEffectHandler(handleGetContact(props))),
};
