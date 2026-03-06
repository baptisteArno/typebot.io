import { SpaceId } from "@typebot.io/shared-primitives/domain";
import type { UserId } from "@typebot.io/user/schemas";
import { WorkspaceRepo } from "@typebot.io/workspaces/application/WorkspaceRepo";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema, ServiceMap } from "effect";
import type { Contact, ContactId } from "../domain/Contact";
import {
  ContactsAlreadyExistsError,
  ContactsForbiddenError,
  type ContactsNotFoundError,
} from "../domain/errors";
import { ContactPropertyDefinitionsRepo } from "./ContactPropertyDefinitionsRepo";
import { ContactsRepo } from "./ContactsRepo";

const PropertyValue = Schema.Union([Schema.String, Schema.Number]);
const PropertiesSchema = Schema.Record(Schema.String, PropertyValue);

export const ContactCreateInputSchema = Schema.Struct({
  workspaceId: WorkspaceId,
  spaceId: Schema.optional(SpaceId),
  name: Schema.optional(Schema.String),
  properties: Schema.optional(PropertiesSchema),
  segmentIds: Schema.optional(Schema.Array(Schema.String)),
});
export type ContactCreateInput = typeof ContactCreateInputSchema.Type;

export class ContactsUsecases extends ServiceMap.Service<
  ContactsUsecases,
  {
    readonly list: (
      resource: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        userId: UserId;
      },
      pagination: { limit: number; cursor?: number; q?: string },
    ) => Effect.Effect<
      { contacts: readonly Contact[]; nextCursor: number | undefined },
      ContactsForbiddenError
    >;
    readonly create: (
      input: ContactCreateInput,
      context: { userId: UserId },
    ) => Effect.Effect<
      Contact,
      ContactsAlreadyExistsError | ContactsForbiddenError
    >;
    readonly get: (resource: {
      workspaceId: WorkspaceId;
      spaceId?: SpaceId;
      contactId: ContactId;
      userId: UserId;
    }) => Effect.Effect<
      Contact,
      ContactsForbiddenError | ContactsNotFoundError
    >;
    readonly delete: (resource: {
      workspaceId: WorkspaceId;
      spaceId?: SpaceId;
      contactId: ContactId;
      userId: UserId;
    }) => Effect.Effect<void, ContactsForbiddenError | ContactsNotFoundError>;
    readonly deleteMany: (resource: {
      workspaceId: WorkspaceId;
      spaceId?: SpaceId;
      contactIds: readonly ContactId[];
      userId: UserId;
    }) => Effect.Effect<void, ContactsForbiddenError>;
  }
>()("@typebot.io/ContactsUsecases") {
  static readonly layer = Layer.effect(
    ContactsUsecases,
    Effect.gen(function* () {
      const contactsRepo = yield* ContactsRepo;
      const contactPropertyDefinitionsRepo =
        yield* ContactPropertyDefinitionsRepo;
      const workspaceRepo = yield* WorkspaceRepo;

      const list = Effect.fn("ContactsUsecases.list")(function* (
        {
          workspaceId,
          spaceId,
          userId,
        }: {
          workspaceId: WorkspaceId;
          spaceId?: SpaceId;
          userId: UserId;
        },
        pagination: { limit: number; cursor?: number; q?: string },
      ): Effect.fn.Return<
        { contacts: readonly Contact[]; nextCursor: number | undefined },
        ContactsForbiddenError
      > {
        const canList = yield* workspaceRepo.canReadWorkspace(
          workspaceId,
          userId,
        );

        if (!canList) return yield* new ContactsForbiddenError();

        return yield* contactsRepo.list(pagination, { workspaceId, spaceId });
      });

      const create = Effect.fn("ContactsUsecases.create")(function* (
        input: ContactCreateInput,
        context: { userId: UserId },
      ): Effect.fn.Return<
        Contact,
        ContactsAlreadyExistsError | ContactsForbiddenError
      > {
        const { workspaceId, spaceId } = input;
        const canCreate = yield* workspaceRepo.canAdminWriteWorkspace(
          workspaceId,
          context.userId,
        );

        if (!canCreate) return yield* new ContactsForbiddenError();

        const definitions = yield* contactPropertyDefinitionsRepo.list({
          workspaceId,
          spaceId,
        });

        const keyToDefinition = new Map(
          definitions.map((definition) => [
            definition.key.toString(),
            definition,
          ]),
        );

        const propertiesInput = input.properties ?? {};
        const uniqueChecks = Object.entries(propertiesInput).reduce<
          Array<{ definitionId: number; valueString: string }>
        >((acc, [key, value]) => {
          const def = keyToDefinition.get(key);
          if (!def?.isUnique) return acc;
          const valueStr = typeof value === "string" ? value : value.toString();
          if (!valueStr.trim()) return acc;
          acc.push({ definitionId: def.id, valueString: valueStr });
          return acc;
        }, []);

        const exists =
          yield* contactsRepo.existsContactWithUniquePropertyValues(
            uniqueChecks,
            { workspaceId, spaceId },
          );
        if (exists) return yield* new ContactsAlreadyExistsError();

        const properties = Object.entries(propertiesInput).reduce<
          Array<{
            definitionId: number;
            valueString: string | null;
            valueNumber: number | null;
          }>
        >((acc, [key, value]) => {
          if (value === undefined || value === null) return acc;
          const def = keyToDefinition.get(key);
          if (!def) return acc;
          const isNumType = def.type === "NUMBER";
          const numValue =
            typeof value === "number"
              ? value
              : typeof value === "string" && !Number.isNaN(Number(value))
                ? Number(value)
                : null;
          const useNumber = isNumType && numValue !== null;
          acc.push({
            definitionId: def.id,
            valueString: useNumber ? null : String(value),
            valueNumber: useNumber ? numValue : null,
          });
          return acc;
        }, []);

        return yield* contactsRepo.create({
          workspaceId,
          spaceId,
          name: input.name,
          properties,
        });
      });

      const get = Effect.fn("ContactsUsecases.get")(function* ({
        workspaceId,
        spaceId,
        contactId,
        userId,
      }: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        contactId: ContactId;
        userId: UserId;
      }): Effect.fn.Return<
        Contact,
        ContactsForbiddenError | ContactsNotFoundError
      > {
        const canGet = yield* workspaceRepo.canReadWorkspace(
          workspaceId,
          userId,
        );

        if (!canGet) return yield* new ContactsForbiddenError();

        return yield* contactsRepo.getById(contactId, { workspaceId, spaceId });
      });

      const delete_ = Effect.fn("ContactsUsecases.delete")(function* ({
        workspaceId,
        spaceId,
        contactId,
        userId,
      }: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        contactId: ContactId;
        userId: UserId;
      }): Effect.fn.Return<
        void,
        ContactsForbiddenError | ContactsNotFoundError
      > {
        const canDelete = yield* workspaceRepo.canAdminWriteWorkspace(
          workspaceId,
          userId,
        );

        if (!canDelete) return yield* new ContactsForbiddenError();

        return yield* contactsRepo.delete(contactId, { workspaceId, spaceId });
      });

      const deleteMany = Effect.fn("ContactsUsecases.deleteMany")(function* ({
        workspaceId,
        spaceId,
        contactIds,
        userId,
      }: {
        workspaceId: WorkspaceId;
        spaceId?: SpaceId;
        contactIds: readonly ContactId[];
        userId: UserId;
      }): Effect.fn.Return<void, ContactsForbiddenError> {
        const canDelete = yield* workspaceRepo.canAdminWriteWorkspace(
          workspaceId,
          userId,
        );

        if (!canDelete) return yield* new ContactsForbiddenError();

        return yield* contactsRepo.deleteMany(contactIds, {
          workspaceId,
          spaceId,
        });
      });

      return ContactsUsecases.of({
        list,
        create,
        get,
        delete: delete_,
        deleteMany,
      });
    }),
  );
}
