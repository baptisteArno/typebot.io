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
export const createValidatingLookup =
  (lookupHost: LookupFunction): LookupFunction =>
  (hostname, options, callback) => {
    lookupHost(hostname, options, (err, address, family) => {
      if (err) return callLookupCallback(callback, err, address, family);
      if (env.NODE_ENV === "development" && hostname === "localhost") {
        return callLookupCallback(callback, null, address, family);
      }
      try {
        if (Array.isArray(address)) {
          for (const entry of address)
            validateResolvedAddress(hostname, entry.address);
        } else if (typeof address === "string") {
          validateResolvedAddress(hostname, address);
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

export const validatingLookup = createValidatingLookup(dnsLookup);

export const validateResolvedAddress = (
  hostname: string,
  address: string,
  allowedHosts = env.SSRF_ALLOWED_HOSTS,
) => {
  const parsedAddress = parseIPAddress(address);
  if (!parsedAddress)
    throw new Error(
      `Hostname "${hostname}" resolved to an invalid IP address.`,
    );
  validateIPAddress(parsedAddress, {
    allowPrivateRanges: allowedHosts?.includes(hostname.toLowerCase()) ?? false,
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
