export type DropoffLogger = (
  msg: string,
  ctx?: Record<string, unknown>,
) => void;

export type TraversalFrame = {
  edgeId: string;
  usersRemaining: number;
  pathIndex: number;
};

export type VisitedPathsByEdge = Map<string, Set<number>>;
