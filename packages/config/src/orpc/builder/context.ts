export function createContext({
  authenticate,
}: {
  authenticate: () => Promise<{
    id: string;
    email: string;
    // TODO: review package org
    groupTitlesAutoGeneration: any;
  } | null>;
}) {
  return {
    authenticate,
  };
}

export type Context = ReturnType<typeof createContext>;
