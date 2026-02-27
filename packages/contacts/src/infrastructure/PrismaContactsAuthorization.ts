import type { AudienceId } from "@typebot.io/audiences/core/Audience";
import { PrismaService } from "@typebot.io/prisma/effect";
import type { UserId } from "@typebot.io/user/schemas";
import { WorkspaceAuthorization } from "@typebot.io/workspaces/core/WorkspaceAuthorization";
import { WorkspaceId } from "@typebot.io/workspaces/schemas";
import { Effect, Layer, Schema } from "effect";
import { ContactsAuthorization } from "../core/ContactsAuthorization";

export const PrismaContactsAuthorization = Layer.effect(
  ContactsAuthorization,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;
    const workspaceAuthorization = yield* WorkspaceAuthorization;

    const resolveWorkspaceId = (audienceId: AudienceId) =>
      prisma.audience
        .findUnique({
          where: { id: audienceId },
          select: { workspaceId: true },
        })
        .pipe(Effect.orDie);

    const toWorkspaceId = (s: string) => Schema.decodeSync(WorkspaceId)(s);

    const canListContacts = Effect.fn(
      "PrismaContactsAuthorization.canListContacts",
    )(function* (audienceId: AudienceId, userId: UserId) {
      const audience = yield* resolveWorkspaceId(audienceId);
      if (!audience) return false;
      return yield* workspaceAuthorization.canReadWorkspace(
        toWorkspaceId(audience.workspaceId),
        userId,
      );
    });

    const canCreateContact = Effect.fn(
      "PrismaContactsAuthorization.canCreateContact",
    )(function* (audienceId: AudienceId, userId: UserId) {
      const audience = yield* resolveWorkspaceId(audienceId);
      if (!audience) return false;
      return yield* workspaceAuthorization.canAdminWriteWorkspace(
        toWorkspaceId(audience.workspaceId),
        userId,
      );
    });

    const canGetContact = Effect.fn(
      "PrismaContactsAuthorization.canGetContact",
    )(function* (audienceId: AudienceId, userId: UserId) {
      const audience = yield* resolveWorkspaceId(audienceId);
      if (!audience) return false;
      return yield* workspaceAuthorization.canReadWorkspace(
        toWorkspaceId(audience.workspaceId),
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
