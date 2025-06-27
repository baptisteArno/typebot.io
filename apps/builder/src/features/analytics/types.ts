export type DropoffLogger = (
  msg: string,
  ctx?: Record<string, unknown>,
) => void;

export type TraversalFrame = {
  usersRemaining: number;
  pathKey: string;
};
