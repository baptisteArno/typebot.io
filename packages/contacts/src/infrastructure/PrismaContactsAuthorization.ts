import type { SpaceId } from "@typebot.io/domain/shared-primitives";
import type { UserId } from "@typebot.io/user/schemas";
import { WorkspaceAuthorization } from "@typebot.io/workspaces/application/WorkspaceAuthorization";
import type { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer } from "effect";
import { ContactsAuthorization } from "../application/ContactsAuthorization";

export const PrismaContactsAuthorization = Layer.effect(
  ContactsAuthorization,
  Effect.gen(function* () {
    const workspaceAuthorization = yield* WorkspaceAuthorization;

    const canListContacts = Effect.fn(
      "PrismaContactsAuthorization.canListContacts",
    )(function* (
      workspaceId: WorkspaceId,
      _spaceId: SpaceId | undefined,
      userId: UserId,
    ) {
      return yield* workspaceAuthorization.canReadWorkspace(
        workspaceId,
        userId,
      );
    });

    const canCreateContact = Effect.fn(
      "PrismaContactsAuthorization.canCreateContact",
    )(function* (
      workspaceId: WorkspaceId,
      _spaceId: SpaceId | undefined,
      userId: UserId,
    ) {
      return yield* workspaceAuthorization.canAdminWriteWorkspace(
        workspaceId,
        userId,
      );
    });

    const canGetContact = Effect.fn(
      "PrismaContactsAuthorization.canGetContact",
    )(function* (
      workspaceId: WorkspaceId,
      _spaceId: SpaceId | undefined,
      userId: UserId,
    ) {
      return yield* workspaceAuthorization.canReadWorkspace(
        workspaceId,
        userId,
      );
    });

    return ContactsAuthorization.of({
      canListContacts,
      canCreateContact,
      canGetContact,
    });
  }),
);
