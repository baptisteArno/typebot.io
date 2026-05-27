import { lookup as dnsLookup } from "node:dns";
import type { LookupFunction } from "node:net";
import { env } from "@typebot.io/env";
import { Agent } from "undici";
import { parseIPAddress, validateIPAddress } from "./validateHttpReqUrl";

type LookupCallback = Parameters<LookupFunction>[2];

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
  dnsLookup(hostname, options, (err, address, family) => {
    if (err) return callLookupCallback(callback, err, address, family);
    if (env.NODE_ENV === "development" && hostname === "localhost") {
      return callLookupCallback(callback, null, address, family);
    }
    try {
      if (Array.isArray(address)) {
        for (const entry of address) {
          const parsed = parseIPAddress(entry.address);
          if (parsed) validateIPAddress(parsed);
        }
      } else if (typeof address === "string") {
        const parsed = parseIPAddress(address);
        if (parsed) validateIPAddress(parsed);
      }
    } catch (validationError) {
      return callLookupCallback(
        callback,
        validationError instanceof Error
          ? validationError
          : new Error(String(validationError)),
        address,
        family,
      );
    }
    callLookupCallback(callback, null, address, family);
  });
};

const callLookupCallback = (
  callback: LookupCallback,
  error: Error | null,
  address: Parameters<LookupCallback>[1],
  family: Parameters<LookupCallback>[2],
) => {
  callback(error, address, family);
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
