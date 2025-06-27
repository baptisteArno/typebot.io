export type DropoffLogger = (
  msg: string,
  ctx?: Record<string, unknown>,
) => void;

export type TraversalFrame = {
  edgeId: string;
  usersRemaining: number;
  isOffDefaultPath: boolean;
};
