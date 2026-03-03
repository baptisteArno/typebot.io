import { expect, it } from "@effect/vitest";
import { PgContainerPrismaLayer } from "@typebot.io/config/tests/PgContainer";
import {
  proWorkspaceId,
  userId,
} from "@typebot.io/config/tests/seedDatabaseForTest";
import { PrismaWorkspaceAuthorization } from "@typebot.io/workspaces/infrastructure/PrismaWorkspaceAuthorization";
import { Effect, Layer } from "effect";
import type { ContactId } from "../core/Contact";
import { Contacts } from "../core/Contacts";
import { PrismaContactsAuthorization } from "../infrastructure/PrismaContactsAuthorization";
import { PrismaContactsRepository } from "../infrastructure/PrismaContactsRepository";
import { handleCreateContact } from "./handleCreateContact";
import { handleGetContact } from "./handleGetContact";
import { handleListContacts } from "./handleListContacts";

const ContactsInfrastructureLayer = Layer.mergeAll(
  PrismaContactsAuthorization,
  PrismaContactsRepository,
).pipe(
  Layer.provideMerge(PrismaWorkspaceAuthorization),
  Layer.provideMerge(PgContainerPrismaLayer),
);

const ContactsLiveLayer = Layer.provide(
  Contacts.layer,
  ContactsInfrastructureLayer,
);

let contactId: ContactId;

it.layer(ContactsLiveLayer, { timeout: "30 seconds" })(
  "ContactsLayer",
  (it) => {
    it.effect(
      "should create contact with valid data",
      Effect.fn(function* () {
        const { contact } = yield* handleCreateContact({
          input: {
            workspaceId: proWorkspaceId,
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
          },
          context: {
            user: {
              id: userId,
            },
          },
        });
        contactId = contact.id;

        expect(contact).toBeDefined();
        expect(contact.firstName).toBe("John");
        expect(contact.email).toBe("john@example.com");
      }),
    );

    it.effect(
      "gets contact",
      Effect.fn(function* () {
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
        expect(contact.firstName).toBe("John");
      }),
    );

    it.effect(
      "lists contacts",
      Effect.fn(function* () {
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
        expect(contacts.some((c) => c.id === contactId)).toBe(true);
      }),
    );
  },
);
