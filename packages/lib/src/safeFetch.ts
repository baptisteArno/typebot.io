import { safeKy } from "./ky";

export const safeFetch = Object.assign(
  async (
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> =>
    safeKy(input, {
      ...init,
      retry: 0,
      throwHttpErrors: false,
      timeout: false,
    }),
  { preconnect: () => undefined },
);
