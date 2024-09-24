import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type {
  AuthDefinition,
  FetcherDefinition,
} from "@typebot.io/forge/types";

export const getFetchers = (blockDef: ForgedBlockDefinition) =>
  (blockDef.fetchers ?? []).concat(
    blockDef.actions.flatMap(
      (action) =>
        (action.fetchers ?? []) as FetcherDefinition<AuthDefinition>[],
    ),
  );
