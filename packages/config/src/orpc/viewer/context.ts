export function createContext({
  req,
  authenticate,
}: {
  req: Request;
  authenticate: () => Promise<{ id: string; email: string } | null>;
}) {
  return {
    origin: req.headers.get("origin") ?? undefined,
    iframeReferrerOrigin:
      req.headers.get("x-typebot-iframe-referrer-origin") ?? undefined,
    authenticate,
  };
}

export type Context = ReturnType<typeof createContext>;
