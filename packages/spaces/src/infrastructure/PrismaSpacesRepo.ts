import { PrismaService } from "@typebot.io/prisma/effect";
import { PrismaClientKnownRequestError } from "@typebot.io/prisma/enum";
import { Effect, Layer, Schema } from "effect";
import type {
  ListSpacesInput,
  SpaceCreateInput,
  SpaceDeleteInput,
  SpacePatchInput,
} from "../application/SpacesRepo";
import { SpacesRepo } from "../application/SpacesRepo";
import { SpaceAlreadyExistsError, SpaceNotFoundError } from "../domain/errors";
import { Space } from "../domain/Space";

export const PrismaSpacesRepo = Layer.effect(
  SpacesRepo,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const list = Effect.fn("PrismacpacesRepo.list")(function* (
      input: ListSpacesInput,
    ) {
      const spaces = yield* prisma.space
        .findMany({
          where: {
            workspaceId: input.workspaceId,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
        .pipe(Effect.orDie);

      return yield* Schema.decodeUnknownEffect(Schema.Array(Space))(
        spaces,
      ).pipe(Effect.orDie);
    });

    const create = Effect.fn("PrismaSpacesRepo.create")(function* (
      input: SpaceCreateInput,
    ) {
      const space = yield* prisma.space
        .create({
          data: {
            id: input.id,
            name: input.name,
            icon: input.icon,
            workspaceId: input.workspaceId,
          },
        })
        .pipe(
          Effect.catch((error) =>
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
              ? Effect.fail(new SpaceAlreadyExistsError())
              : Effect.die(error),
          ),
        );

      return yield* Schema.decodeUnknownEffect(Space)(space).pipe(Effect.orDie);
    });

    const patch = Effect.fn("PrismaSpacesRepo.patch")(function* (
      input: SpacePatchInput,
    ) {
      const space = yield* prisma.space
        .update({
          where: {
            id_workspaceId: {
              id: input.spaceId,
              workspaceId: input.workspaceId,
            },
          },
          data: {
            name: input.name,
            icon: input.icon,
          },
        })
        .pipe(
          Effect.catch((error) =>
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2025"
              ? Effect.fail(new SpaceNotFoundError())
              : Effect.die(error),
          ),
        );

      return yield* Schema.decodeUnknownEffect(Space)(space).pipe(Effect.orDie);
    });

    const deleteSpace = Effect.fn("PrismaSpacesRepo.delete")(function* (
      input: SpaceDeleteInput,
    ) {
      yield* prisma.space
        .delete({
          where: {
            id_workspaceId: {
              id: input.spaceId,
              workspaceId: input.workspaceId,
            },
          },
        })
        .pipe(
          Effect.catch((error) =>
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2025"
              ? Effect.fail(new SpaceNotFoundError())
              : Effect.die(error),
          ),
        );
    });

    return SpacesRepo.of({
      list,
      create,
      patch,
      delete: deleteSpace,
    });
  }),
);
