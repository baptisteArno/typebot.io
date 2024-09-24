import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { Group } from "@typebot.io/groups/schemas";
import type {
  BlockSource,
  TEventSource,
  Target,
} from "@typebot.io/typebot/schemas/edge";
import type { IdMap } from "@typebot.io/typebot/schemas/types";

export type Coordinates = { x: number; y: number };

export type Anchor = {
  coordinates: Coordinates;
};

export type Node = Omit<Group, "blocks"> & {
  blocks: (Block & {
    sourceAnchorsPosition: { left: Coordinates; right: Coordinates };
  })[];
};

export type ConnectingIds = {
  source: TEventSource | (BlockSource & { groupId: string });
  target?: Target;
};

export type CoordinatesMap = IdMap<Coordinates>;

export type AnchorsPositionProps = {
  sourcePosition: Coordinates;
  targetPosition: Coordinates;
  sourceType: "right" | "left";
  totalSegments: number;
};

export type Endpoint = {
  id: string;
  y: number;
};
