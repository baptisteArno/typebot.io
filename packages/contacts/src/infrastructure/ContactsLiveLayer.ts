import { PrismaLayer } from "@typebot.io/prisma/layer";
import { PrismaWorkspaceAuthorization } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceAuthorization";
import { Effect, Layer } from "effect";
import { Contacts } from "../core/Contacts";
import { PrismaContactsAuthorization } from "./PrismaContactsAuthorization";
import { PrismaContactsRepository } from "./PrismaContactsRepository";

const ContactsInfrastructureLayer = Layer.mergeAll(
  PrismaContactsAuthorization,
  PrismaContactsRepository,
).pipe(
  Layer.provideMerge(PrismaWorkspaceAuthorization),
  Layer.provideMerge(PrismaLayer),
);

const ContactsLiveLayer = Layer.provide(
  Contacts.layer,
  ContactsInfrastructureLayer,
);

export const runContactsEffect = <A, E>(
  program: Effect.Effect<A, E, Contacts>,
) => Effect.runPromise(program.pipe(Effect.provide(ContactsLiveLayer)));
