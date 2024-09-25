import type { TypebotV6 } from "./typebot";

export type TEvent = TypebotV6["events"][number];

export type IdMap<T> = { [id: string]: T };
