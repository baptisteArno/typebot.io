export function createContext({
  authenticate,
}: {
  authenticate: () => Promise<{ id: string; email: string } | null>;
}) {
  return {
    authenticate,
  };
}

export type Context = ReturnType<typeof createContext>;
