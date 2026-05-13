import { lookup as dnsLookup } from "node:dns";
import type { LookupFunction } from "node:net";
import { env } from "@typebot.io/env";
import { Agent } from "undici";
import { parseIPAddress, validateIPAddress } from "./validateHttpReqUrl";

/**
 * A DNS lookup function that validates resolved IPs against SSRF blocklists.
 * Used as the `connect.lookup` in an undici Agent to ensure IP validation
 * happens at connection time — eliminating the TOCTOU gap of DNS rebinding.
 *
 * Handles both single-address and all-addresses modes since undici may pass
 * `{ all: true }` in lookup options.
 */
export const validatingLookup: LookupFunction = (
  hostname,
  options,
  callback,
) => {
  dnsLookup(
    hostname,
    options,
    (err: unknown, address: unknown, family: unknown) => {
      if (err) return (callback as Function)(err, address, family);
      if (env.NODE_ENV === "development" && hostname === "localhost") {
        return (callback as Function)(null, address, family);
      }
      try {
        if (Array.isArray(address)) {
          for (const entry of address) {
            const parsed = parseIPAddress(entry.address);
            if (parsed) validateIPAddress(parsed);
          }
        } else {
          const parsed = parseIPAddress(address as string);
          if (parsed) validateIPAddress(parsed);
        }
      } catch (validationError) {
        return (callback as Function)(
          validationError instanceof Error
            ? validationError
            : new Error(String(validationError)),
          address,
          family,
        );
      }
      (callback as Function)(null, address, family);
    },
  );
};

/**
 * Creates an undici Agent that validates resolved IPs at connection time,
 * preventing DNS rebinding attacks.
 *
 * Unlike pre-request URL validation, this ensures the IP check happens
 * during the actual TCP connection — eliminating the TOCTOU gap where
 * a hostname could rebind between validation and connection.
 */
export const createSafeDispatcher = () =>
  new Agent({
    connect: {
      lookup: validatingLookup,
    },
  });

let sharedDispatcher: Agent | undefined;

export const getSafeDispatcher = () => {
  if (!sharedDispatcher) sharedDispatcher = createSafeDispatcher();
  return sharedDispatcher;
};
