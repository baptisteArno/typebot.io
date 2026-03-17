import { expect, it } from "@effect/vitest";
import { PgContainerPrismaLayer } from "@typebot.io/config/tests/PgContainer";
import {
  proWorkspaceId,
  userId,
} from "@typebot.io/config/tests/seedDatabaseForTest";
import { PrismaWorkspaceRepository } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceRepository";
import { Effect, Layer } from "effect";
import { ContactsUsecases } from "../../application/ContactsUsecases";
import type { ContactId } from "../../domain/Contact";
import { PrismaContactPropertyDefinitionsRepository } from "../../infrastructure/PrismaContactPropertyDefinitionsRepository";
import { PrismaContactsRepository } from "../../infrastructure/PrismaContactsRepository";
import { handleCreateContact } from "./handleCreateContact";
import { handleGetContact } from "./handleGetContact";
import { handleListContacts } from "./handleListContacts";

const ContactsInfrastructureLayer = Layer.mergeAll(
  PrismaContactsRepository,
  PrismaWorkspaceRepository,
).pipe(Layer.provideMerge(PgContainerPrismaLayer));

const ContactPropertyDefinitionsInfrastructureLayer = Layer.mergeAll(
  PrismaContactPropertyDefinitionsRepository,
  PrismaWorkspaceRepository,
).pipe(Layer.provideMerge(PgContainerPrismaLayer));

const AllContactsInfrastructureLayer = Layer.mergeAll(
  ContactsInfrastructureLayer,
  ContactPropertyDefinitionsInfrastructureLayer,
);

const ContactsLiveLayer = Layer.provide(
  ContactsUsecases.layer,
  AllContactsInfrastructureLayer,
);

let contactId: ContactId;

it.layer(ContactsLiveLayer, { timeout: "30 seconds" })(
  "ContactsLayer",
  (it) => {
    it.effect("should create contact with valid data", () =>
      Effect.gen(function* () {
        const { contact } = yield* handleCreateContact({
          input: {
            workspaceId: proWorkspaceId,
            name: "John Doe",
          },
          context: {
            user: {
              id: userId,
            },
          },
        });
        contactId = contact.id;

        expect(contact).toBeDefined();
        expect(contact.name).toBe("John Doe");
      }),
    );

    it.effect("gets contact", () =>
      Effect.gen(function* () {
        const { contact } = yield* handleGetContact({
          input: {
            workspaceId: proWorkspaceId,
            contactId,
          },
          context: {
            user: {
              id: userId,
            },
          },
        });
        expect(contact).toBeDefined();
        expect(contact.id).toBe(contactId);
        expect(contact.name).toBe("John Doe");
      }),
    );

    it.effect("lists contacts", () =>
      Effect.gen(function* () {
        const { contacts } = yield* handleListContacts({
          input: {
            workspaceId: proWorkspaceId,
          },
          context: {
            user: {
              id: userId,
            },
          },
        });
        expect(contacts.length).toBeGreaterThanOrEqual(1);
        expect(contacts.some((contact) => contact.id === contactId)).toBe(true);
      }),
    );
  },
);
