import { ORPCError } from "@orpc/server";
import type { UserInOrpcContext } from "@typebot.io/config/orpc/builder/context";
import { Effect } from "effect";
import type { ListSpacesInput } from "../../application/SpacesRepo";
import { SpacesUsecases } from "../../application/SpacesUsecases";

export const handleListSpaces = Effect.fn("handleListSpaces")(
  function* ({
    input,
    context: { user },
  }: {
    input: ListSpacesInput;
    context: { user: UserInOrpcContext };
  }) {
    const spacesUsecases = yield* SpacesUsecases;
    const spacesList = yield* spacesUsecases.list(input, { userId: user.id });
    return { spaces: spacesList };
  },
  Effect.catchTags({
    ForbiddenSpaceAccessError: () =>
      Effect.fail(
        new ORPCError("NOT_FOUND", {
          message: "Space not found",
        }),
      ),
    SpacesFeatureDisabledError: () =>
      Effect.fail(
        new ORPCError("FORBIDDEN", {
          message: "Spaces are not enabled for this account",
        }),
      ),
  }),
  Effect.catchDefect((defect) =>
    Effect.fail(
      new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list spaces",
        cause: defect,
      }),
    ),
  ),
);
