import type { FetcherDefinition } from "@typebot.io/forge/types";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";

export const getFetchers = (blockDef: ForgedBlockDefinition) =>
  (blockDef.fetchers ?? []).concat(
    blockDef.actions.flatMap(
      (action) => (action.fetchers ?? []) as FetcherDefinition[],
    ),
  );
