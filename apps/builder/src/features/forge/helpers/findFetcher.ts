import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { getFetchers } from "./getFetchers";

export const findFetcher = (
  blockDef: ForgedBlockDefinition,
  fetcherId: string,
) => getFetchers(blockDef).find((fetcher) => fetcher.id === fetcherId);
