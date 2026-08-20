import kyOriginal from "ky";
import type { Dispatcher } from "undici";
import { getSafeDispatcher } from "./ssrf/createSafeDispatcher";
import {
  resolveAndValidateHttpReqUrl,
  type ValidatedHttpReqUrl,
} from "./ssrf/validateHttpReqUrl";

type ExtendedRequestInit = RequestInit & {
  dispatcher?: Dispatcher;
  duplex?: "half" | "full";
};

type DispatchOptionsWithServername = Parameters<Dispatcher["dispatch"]>[0] & {
  servername: string;
};

/**
 * Workaround for Next.js App Router + undici bug where `fetch(Request)` adds
 * `transfer-encoding: chunked` header, but `fetch(url, options)` doesn't.
 *
 * ky internally creates `new Request()` before calling fetch, triggering this bug.
 * This wrapper intercepts Request objects and rebuilds them into the two-parameter
 * fetch signature to avoid chunked encoding.
 *
 * See: https://github.com/openapi-ts/openapi-typescript/discussions/1912
 */
export const rebuildFetchWithoutChunkedEncoding = async (
  input: string | URL | Request,
  init?: ExtendedRequestInit,
): Promise<Response> => {
  if (typeof input === "string" || input instanceof URL) {
    return fetch(input, init);
  }

  const request = input;

  if (request.bodyUsed) {
    throw new Error("Request body already consumed");
  }

  const headers = new Headers(request.headers);
  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const mergedInit: RequestInit & {
    dispatcher?: Dispatcher;
    duplex?: "half" | "full";
  } = {
    method: init?.method ?? request.method,
    headers,
    body:
      init?.body ?? (request.body ? await request.arrayBuffer() : undefined),
    cache: init?.cache ?? request.cache,
    credentials: init?.credentials ?? request.credentials,
    integrity: init?.integrity ?? request.integrity,
    mode: init?.mode ?? request.mode,
    redirect: init?.redirect ?? request.redirect,
    referrer: init?.referrer ?? request.referrer,
    referrerPolicy: init?.referrerPolicy ?? request.referrerPolicy,
    signal: init?.signal ?? request.signal,
    keepalive: init?.keepalive ?? request.keepalive,
    dispatcher: init?.dispatcher,
    duplex: init?.duplex ?? (request.body ? "half" : undefined),
  };

  return fetch(request.url, mergedInit);
};

export const ky = kyOriginal.create({
  fetch: rebuildFetchWithoutChunkedEncoding,
});

const MAX_REDIRECTS = 10;
const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);
const REQUEST_BODY_HEADERS = [
  "content-encoding",
  "content-language",
  "content-location",
  "content-type",
  "content-length",
];
const CROSS_ORIGIN_SENSITIVE_HEADERS = [
  "authorization",
  "proxy-authorization",
  "cookie",
  "host",
];

export const createPinnedDispatcher = (
  dispatcher: Dispatcher,
  validatedUrl: ValidatedHttpReqUrl,
) =>
  new Proxy(dispatcher, {
    get(target, property) {
      if (property !== "dispatch") return Reflect.get(target, property);
      return (
        options: Parameters<Dispatcher["dispatch"]>[0],
        handler: Parameters<Dispatcher["dispatch"]>[1],
      ) => {
        const pinnedOrigin = new URL(options.origin ?? validatedUrl.url.origin);
        pinnedOrigin.hostname = validatedUrl.resolvedAddress.includes(":")
          ? `[${validatedUrl.resolvedAddress}]`
          : validatedUrl.resolvedAddress;
        const pinnedOptions: DispatchOptionsWithServername = {
          ...options,
          origin: pinnedOrigin.origin,
          headers: Array.isArray(options.headers)
            ? [...options.headers, "host", validatedUrl.url.host]
            : { ...options.headers, host: validatedUrl.url.host },
          servername: validatedUrl.hostname,
        };
        return target.dispatch(pinnedOptions, handler);
      };
    },
  });

export const createSafeFetchWithoutChunkedEncoding =
  (getDispatcher: (validatedUrl: ValidatedHttpReqUrl) => Dispatcher) =>
  async (
    input: string | URL | Request,
    init?: ExtendedRequestInit,
  ): Promise<Response> => {
    let request = new Request(input, init);
    let validatedUrl = await resolveAndValidateHttpReqUrl(request.url);
    let dispatcher = getDispatcher(validatedUrl);
    let response = await rebuildFetchWithoutChunkedEncoding(request.clone(), {
      redirect: "manual",
      dispatcher,
    });
    let redirectCount = 0;
    while (REDIRECT_STATUS_CODES.has(response.status)) {
      if (request.redirect === "manual") return response;
      if (request.redirect === "error") {
        await response.body?.cancel();
        throw new TypeError(
          'Redirect encountered while redirect mode is set to "error".',
        );
      }
      if (!response.headers.has("location")) return response;
      await response.body?.cancel();
      if (redirectCount >= MAX_REDIRECTS)
        throw new Error("Too many redirects while following safe fetch chain.");
      const location = new URL(
        response.headers.get("location")!,
        response.url || request.url,
      ).toString();
      validatedUrl = await resolveAndValidateHttpReqUrl(location);
      const headers = new Headers(request.headers);
      const shouldSwitchToGet =
        ([301, 302].includes(response.status) && request.method === "POST") ||
        (response.status === 303 && !["GET", "HEAD"].includes(request.method));
      if (shouldSwitchToGet)
        REQUEST_BODY_HEADERS.forEach((header) => headers.delete(header));
      if (new URL(request.url).origin !== new URL(location).origin)
        CROSS_ORIGIN_SENSITIVE_HEADERS.forEach((header) =>
          headers.delete(header),
        );
      const redirectRequestInit: ExtendedRequestInit = {
        method: shouldSwitchToGet ? "GET" : request.method,
        headers,
        body:
          shouldSwitchToGet || !request.body
            ? undefined
            : await request.clone().arrayBuffer(),
        cache: request.cache,
        credentials: request.credentials,
        integrity: request.integrity,
        mode: request.mode,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        signal: request.signal,
        keepalive: request.keepalive,
        duplex: request.body && !shouldSwitchToGet ? "half" : undefined,
      };
      request = new Request(location, redirectRequestInit);
      dispatcher = getDispatcher(validatedUrl);
      response = await rebuildFetchWithoutChunkedEncoding(request.clone(), {
        redirect: "manual",
        dispatcher,
      });
      redirectCount++;
    }
    return response;
  };

/**
 * ky instance with SSRF validation. Use this when the URL may come from user input.
 */
export const safeKy = kyOriginal.create({
  fetch: createSafeFetchWithoutChunkedEncoding(getSafeDispatcher),
});
